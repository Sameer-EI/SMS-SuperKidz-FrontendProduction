import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { constants } from "../../global/constants";
import PaymentStatusDialog from "./PaymentStatusDialog";
import PaymentStatusDialogOffline from "./PaymentStatusDialogOffline";
import { fetchStudentById, fetchStudents1 } from "../../services/api/Api";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useParams } from "react-router-dom";

export const StudentAdmissionFees = () => {
  const [students, setStudents] = useState([]);
  const [availableFees, setAvailableFees] = useState([]);
  const [selectedFeeIds, setSelectedFeeIds] = useState([]);
  const [paymentStatus, setPaymentStatus] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showPaymentDialog1, setShowPaymentDialog1] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingFees, setIsLoadingFees] = useState(false);
  const [apiError, setApiError] = useState("");
  const { axiosInstance } = useContext(AuthContext);
   const {id} = useParams()
  console.log("id", id);




  const authTokens = JSON.parse(localStorage.getItem("authTokens"));
  const accessToken = authTokens?.access;
  const BASE_URL = constants.baseUrl;
  const UserRole = window.localStorage.getItem("userRole");

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      student_id: "",
      month: "",
      paid_amount: "",
      payment_mode: "",
      remarks: "",
      received_by: "",
    },
  });

  const selectedStudentId = watch("student_id");

  const getStudent = async () => {
    try {
      const data = await fetchStudentById(id);
      setSelectedStudent(data)
      console.log(data);
      
    } catch (error) {
      console.error("Error loading student data", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailableFees = async () => {
  
    try {
      setIsLoadingFees(true);
      setApiError("");

      const response = await axiosInstance.get(
        `${BASE_URL}/d/fee-record/fee-preview/?student_id=${id}`,
        { headers: { "Content-Type": "application/json" } }
      );


      let data = response.data;
      if (!Array.isArray(data)) {
        if (data?.month && data?.fees) data = [data];
        else data = [];
      }

      console.log("Fees response normalized:", data);
      setAvailableFees(data);
      return data;
    } catch (error) {
      console.error("API error", error.response || error.message || error);
      setApiError("Failed to load fees");
      setAvailableFees([]);
      return [];
    } finally {
      setIsLoadingFees(false);
    }
  };



  useEffect(() => {
   getStudent()
  }, []);
console.log(selectedStudent);


  useEffect(() => {
   fetchAvailableFees();
  }, []);

  useEffect(() => {
    if (selectedFeeIds.length > 0 && availableFees.length > 0) {
      let totalAmount = 0;
      let lateFeeAmount = 0;
      let totalPending = 0;

      availableFees.forEach((yearLevel) => {
        yearLevel.fees.forEach((fee) => {
          if (selectedFeeIds.includes(fee.id)) {
            const finalAmount = parseFloat(fee.final_amount) || 0;
            const lateFee = parseFloat(fee.late_fee) || 0;
            const dueAmount = parseFloat(fee.due_amount) || 0;

            totalAmount += finalAmount;
            lateFeeAmount += lateFee;
            totalPending += dueAmount;
            console.log(totalAmount);

          }
        });
      });

      totalAmount += lateFeeAmount + totalPending;

      setValue("paid_amount", totalAmount.toFixed(2));
    } else {
      setValue("paid_amount", "0.00");
    }
  }, [selectedFeeIds, availableFees, setValue]);


  const role = localStorage.getItem("userRole");
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };


  const paymentModes =
    role === constants.roles.officeStaff || constants.roles.director
      ? ["Cash", "Cheque", "Online"]
      : ["Online"];


const displayRazorpay = async (payload) => {
  const Payload = {...payload,student_id:id}
  try {
    const isScriptLoaded = await loadRazorpayScript();
    if (!isScriptLoaded) throw new Error("Razorpay SDK failed to load");

   

    const orderResponse = await axiosInstance.post(
      `${BASE_URL}/d/fee-record/initiate-payment/`,
      Payload,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );



    const { razorpay_order_id: orderId, currency, receipt_number, paid_amount: orderAmount } = orderResponse.data;
    const { student_id, received_by, payment_mode, paid_amount, selected_fees } = payload;

    const options = {
      key: "rzp_test_4h2aRSAPbYw3f8",
      amount: orderAmount,
      currency: currency,
      name: "School Fee Payment",
      description: `Receipt: ${receipt_number}`,
      order_id: orderId,
      handler: async function (response) {
        try {
          console.log(" RAZORPAY RESPONSE:", response);
          
          const verificationPayload = {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            student_id: parseInt(id),
            month: selected_fees, 
            received_by: received_by,
            payment_mode: payment_mode,
            paid_amount: paid_amount,
          };

          console.log(" SENDING VERIFICATION:", verificationPayload);

          const verificationResponse = await axiosInstance.post(
            `${BASE_URL}/d/fee-record/confirm-payment/`,
            verificationPayload,
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          console.log(" VERIFICATION RESPONSE:", verificationResponse.data);

          if (verificationResponse.data) {
            setPaymentStatus(verificationResponse.data);
            setShowPaymentDialog(true);
            console.log(" PAYMENT SUCCESS - STATUS:", verificationResponse.data.payment_status);
          } else {
            console.log(" No data in verification response");
            setPaymentStatus("Payment verification failed - No data received");
          }
        } catch (error) {
          console.log(" VERIFICATION ERROR:", error.response?.data || error.message);
          setPaymentStatus("Payment verification failed");
        }
      },
      prefill: { 
        name: selectedStudent?.student_name || "", 
        email: selectedStudent?.email || "" 
      },
      notes: { 
        student_id: id,
        receipt_number: receipt_number
      },
      theme: { color: "#5E35B1" },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  } catch (error) {
    console.log(" PAYMENT INITIATION ERROR:", error.response?.data || error.message);
    setPaymentStatus("Payment failed. Please try again.");
  }
};
  const onSubmit = async (data) => {
   
    if (selectedFeeIds.length === 0) {
      alert("Please select at least one fee to pay");
      return;
    }

    // Transform selectedFeeIds into the correct object format
    const selected_fees = selectedFeeIds.map((rowKey) => {
      const [month, feeId] = rowKey.split("-");
      return { month, fee_id: parseInt(feeId) };
    });

    const payload = {
      student_id: parseInt(id),
      selected_fees,
      paid_amount: parseFloat(data.paid_amount).toFixed(2),
      payment_mode: data.payment_mode,
      remarks: data.remarks,
      received_by: data.received_by,
      is_cheque_cleared: data.payment_mode === "Cheque" ? false : true,
    };

    console.log("Payload:", payload);

    try {
      if (payload.payment_mode === "Online") {
        await displayRazorpay(payload);
      } else {
        const response = await axios.post(`${BASE_URL}/d/fee-record/submit-multi-month-fees/`, payload, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setPaymentStatus(response.data);
        setShowPaymentDialog1(true);
      }
    } catch (err) {
      console.log(err);
      
      setPaymentStatus("Payment failed. Please try again.");
    }
  };



  const calculateTotalAmount = () => {
    let baseTotal = 0;
    let lateTotal = 0;
    let dueTotal = 0;
    let totalAmount = 0;

    if (!Array.isArray(availableFees)) {
      return { baseAmount: 0, lateFee: 0, due: 0, totalAmount: 0 };
    }

    availableFees.forEach((monthData) => {
      if (!Array.isArray(monthData?.fees)) return;

      monthData.fees.forEach((fee) => {
        const rowKey = `${monthData.month}-${fee.id}`;
        if (selectedFeeIds.includes(rowKey)) {
          const base = parseFloat(fee.base_amount) || 0;
          const paid = parseFloat(fee.paid_amount) || 0;
          const late = parseFloat(fee.late_fee) || 0;

          let feeAmount = 0;

          if (paid > 0 && paid < base) {
            feeAmount = base - paid;
            dueTotal += feeAmount;
          } else if (paid === 0) {
            feeAmount = base;
            baseTotal += feeAmount;
          }
          lateTotal += late;
          totalAmount += feeAmount + late;
        }
      });
    });

    return {
      baseAmount: baseTotal,  
      lateFee: lateTotal,
      due: dueTotal,         
      totalAmount: totalAmount,
    };
  };



  const totalAmount = calculateTotalAmount();
  const handleFeeSelection = (feeId, isSelected) => {
    if (isSelected) setSelectedFeeIds((prev) => [...prev, feeId]);
    else setSelectedFeeIds((prev) => prev.filter((id) => id !== feeId));
  };
  useEffect(() => {
    const totals = calculateTotalAmount();
    // update form field when fees change
    setValue("paid_amount", totals.totalAmount.toFixed(2), {
      shouldValidate: true,
      shouldDirty: true
    });
  }, [selectedFeeIds, availableFees, setValue]);


  const stuId = window.localStorage.getItem("student_id");
  const stuYearlvlName = localStorage.getItem("stu_year_level_name");
  const stuYearlvlId = localStorage.getItem("stu_year_level_id");
  const student = students?.find((s) => {
    return stuId == s.student_id

  })
  console.log(localStorage.getItem("stu_year_level_id"));
  console.log(localStorage.getItem("stu_year_level_name"));

  console.log(student);




  if (isLoading && !apiError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="flex space-x-2">
          <div className="w-3 h-3 bgTheme rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bgTheme rounded-full animate-bounce [animation-delay:-0.2s]"></div>
          <div className="w-3 h-3 bgTheme rounded-full animate-bounce [animation-delay:-0.4s]"></div>
        </div>
        <p className="mt-2 text-gray-500 text-sm">Loading data...</p>
      </div>
    );
  };
  if (isLoadingFees && !apiError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="flex space-x-2">
          <div className="w-3 h-3 bgTheme rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bgTheme rounded-full animate-bounce [animation-delay:-0.2s]"></div>
          <div className="w-3 h-3 bgTheme rounded-full animate-bounce [animation-delay:-0.4s]"></div>
        </div>
        <p className="mt-2 text-gray-500 text-sm">Loading data...</p>
      </div>
    );
  };
  if (apiError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-6">
        <i className="fa-solid fa-triangle-exclamation text-5xl text-red-400 mb-4"></i>
        <p className="text-lg text-red-400 font-medium">Failed to load data, Try Again</p>
        <button className="bg-red-400 btn text-white" onClick={handleRetry}>retry</button>
      </div>
    );
  }

  return (
    <div className="mb-24 md:mb-10">
      <div className="min-h-screen p-5 bg-gray-50 dark:bg-gray-900">
        <form
          className="w-full max-w-7xl mx-auto p-6 bg-base-100 rounded-box my-5 shadow-sm focus:outline-none"
          onSubmit={handleSubmit(onSubmit)}
        >
          <h1 className="text-3xl font-bold text-center mb-8">
            Fee Payment
            <i className="fa-solid fa-money-bill-wave ml-2"></i>
          </h1>


          {/* Available Fees Display */}
          {availableFees.length > 0  && (
            <div className="mt-8">
              {availableFees.length > 0  && (
                <div className="mt-8">
                  <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-gray-100">
                    Fee Details for {selectedStudent.first_name +" "+ selectedStudent.last_name}
                  </h2>
                  <div className="overflow-x-auto">
                    <div className="max-h-[500px] overflow-y-auto rounded-lg border">
                      <table className="table w-full">
                        <thead className="sticky top-0 bg-base-200 z-2">
                          <tr>
                            <th className="text-nowrap">Month</th>
                            <th className="v">Fee Type</th>
                            <th className="text-nowrap">Amount</th>
                            <th className="text-nowrap">Late Fee</th>
                            <th className="text-nowrap">Status</th>
                            <th className="text-nowrap">Select</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Array.isArray(availableFees) && availableFees.map((monthData) =>
                            monthData.fees.map((fee, index) => {
                              const rowKey = `${monthData.month}-${fee.id}`;
                              const isSelectable = fee.status !== "Already Paid";
                              const isChecked = selectedFeeIds.includes(rowKey);
                              let Due =  (Number(fee.base_amount ) - Number( fee.paid_amount) +Number( fee.late_fee) )  || 0
                              if(Due < 0) Due = 0
                            
                              
                              return (
                                <tr key={rowKey} className="hover">
                                  {index === 0 && (
                                    <td
                                      rowSpan={monthData.fees.length}
                                      className="font-semibold bg-base-100 text-nowrap align-top"
                                    >
                                      {monthData.month}
                                    </td>
                                  )}
                                  <td>{fee.fee_type}</td>
                                  <td>₹{fee.paid_amount ? Due : fee.base_amount}</td>
                                  <td className={fee.late_fee > 0 ? "text-warning" : ""}>
                                    ₹{fee.paid_amount ? 0: fee.late_fee}
                                  </td>
                                  <td>
                                    {fee.status === "Already Paid" ? (
                                      <span className="badge badge-success text-gray-900 dark:text-white">Paid</span>
                                    ) : fee.status.includes("Pending") ? (
                                      <span className="badge badge-error text-gray-900 dark:text-white">Pending</span>
                                    ) : (
                                      <span className="badge badge-warning text-nowrap text-gray-900 dark:text-white">{fee.status}</span>
                                    )}
                                  </td>
                                  <td>
                                    {isSelectable ? (
                                      <input
                                        type="checkbox"
                                        className="checkbox checkbox-primary"
                                        checked={isChecked}
                                        onChange={(e) =>
                                          handleFeeSelection(rowKey, e.target.checked)
                                        }
                                      />
                                    ) : (
                                      <i className="fa-solid fa-check text-success"></i>
                                    )}
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
 

              {/* Total Amount Summary */}
              {selectedFeeIds.length > 0 && (
                <div className="bg-base-300 p-4 rounded-lg mt-6">
                  <h3 className="text-lg font-semibold mb-2">Payment Summary</h3>
                  <div className="grid grid-cols-2 gap-2">

                    {parseFloat(totalAmount.baseAmount) > 0 && (
                      <>
                        <div>Base Amount:</div>
                        <div className="text-right">
                          ₹{parseFloat(totalAmount.baseAmount).toFixed(2)}
                        </div>
                      </>
                    )}

                    {parseFloat(totalAmount.lateFee) > 0 && !totalAmount.due && (
                      <>
                        <div>Late Fee:</div>
                        <div className="text-right text-warning">
                          ₹{parseFloat(totalAmount.lateFee).toFixed(2)}
                        </div>
                      </>
                    )}

                    {parseFloat(totalAmount.due) > 0 && (
                      <>
                        <div>Due Fee:</div>
                        <div className="text-right text-warning">
                          ₹{parseFloat(totalAmount.due +totalAmount.lateFee).toFixed(2)}
                        </div>
                      </>
                    )}

                    <div className="font-bold mt-2 border-t pt-2">
                      Total Amount:
                    </div>
                    <div className="text-right font-bold mt-2 border-t pt-2">
                      ₹{parseFloat(totalAmount.totalAmount).toFixed(2)}
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* No Fees Message */}
          {!isLoadingFees &&
            availableFees.length === 0 &&
            selectedStudentId && (
              <div className="flex flex-col items-center justify-center min-h-screen">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bgTheme rounded-full animate-bounce"></div>
                  <div className="w-3 h-3 bgTheme rounded-full animate-bounce [animation-delay:-0.2s]"></div>
                  <div className="w-3 h-3 bgTheme rounded-full animate-bounce [animation-delay:-0.4s]"></div>
                </div>
                <p className="mt-2 text-gray-500 text-sm">Loading data...</p>
              </div>

            )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Payment Mode Selection */}
            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <i className="fa-solid fa-credit-card text-sm"></i>
                  Payment Mode <span className="text-error">*</span>
                </span>
              </label>
              <select
                className={`select w-full focus:outline-none ${errors.payment_mode ? "select-error" : "select-bordered"
                  }`}
                {...register("payment_mode", {
                  required: "Payment mode is required",
                })}
                disabled={selectedFeeIds.length === 0}
              >
                <option value="">Select Payment Mode</option>
                {paymentModes.map((mode) => (
                  <option key={mode} value={mode}>
                    {mode}
                  </option>
                ))}
              </select>
              {errors.payment_mode && (
                <label className="label">
                  <span className="label-text-alt text-error">
                    {errors.payment_mode.message}
                  </span>
                </label>
              )}
            </div>
            {/* Paid Amount */}
            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <i className="fa-solid fa-calculator text-sm"></i>
                  Paid Amount <span className="text-error">*</span>
                </span>
              </label>

              <input
                type="number"
                className={`input w-full focus:outline-none ${errors.paid_amount ? "input-error" : "input-bordered"
                  }`}
                {...register("paid_amount", {
                  required: "Amount is required",
                  min: { value: 0, message: "Amount must be positive" },
                  max: {
                    value: totalAmount.totalAmount,
                    message: `Amount cannot exceed ₹${totalAmount.totalAmount.toFixed(2)}`,
                  },
                })}
                value={watch("paid_amount")}
                onChange={(e) => setValue("paid_amount", e.target.value)}
                step="1"
              />
              {errors.paid_amount && (
                <label className="label">
                  <span className="label-text-alt text-error">
                    {errors.paid_amount.message}
                  </span>
                </label>
              )}
            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Remarks */}
            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <i className="fa-solid fa-comment text-sm"></i>
                  Remarks <span className="text-error">*</span>
                </span>
              </label>
              <input
                type="text"
                className={`input w-full focus:outline-none ${errors.remarks ? "input-error" : "input-bordered"
                  }`}
                {...register("remarks", {
                  required: "Remarks are required",
                })}
                placeholder="Enter any remarks"
                disabled={selectedFeeIds.length === 0}
              />
              {errors.remarks && (
                <label className="label">
                  <span className="label-text-alt text-error">
                    {errors.remarks.message}
                  </span>
                </label>
              )}
            </div>

            {/* Signature */}
            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <i className="fa-solid fa-signature text-sm"></i>
                  Received By <span className="text-error">*</span>
                </span>
              </label>
              <input
                type="text"
                className={`input w-full focus:outline-none ${errors.received_by ? "input-error" : "input-bordered"
                  }`}
                {...register("received_by", {
                  required: "Signature is required",
                })}
                placeholder="Enter your name as signature"
                disabled={selectedFeeIds.length === 0}
              />
              {errors.received_by && (
                <label className="label">
                  <span className="label-text-alt text-error">
                    {errors.received_by.message}
                  </span>
                </label>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center mt-10">
            <button
              type="submit"
              className="btn bgTheme text-white w-52"
              disabled={isSubmitting || selectedFeeIds.length === 0}
            >
              {isSubmitting ? (
                <i className="fa-solid fa-spinner fa-spin mr-2"></i>
              ) : (
                <i className="fa-solid fa-money-bill-wave ml-2"></i>
              )}
              {isSubmitting ? "Processing..." : "Submit Payment"}
            </button>
          </div>
        </form>

        {/* Payment Status Dialogs */}
        {showPaymentDialog && paymentStatus && (
          <PaymentStatusDialog
            paymentStatus={paymentStatus}
            onClose={() => {
              setShowPaymentDialog(false);
              setPaymentStatus(null);
              window.location.reload();
            }}
          />
        )}

        {showPaymentDialog1 && paymentStatus && (
          <PaymentStatusDialogOffline
            paymentStatus={paymentStatus}
            onClose={() => {
              setShowPaymentDialog1(false);
              setPaymentStatus(null);
              window.location.reload();
            }}
          />
        )}
      </div>
    </div>
  );
};
