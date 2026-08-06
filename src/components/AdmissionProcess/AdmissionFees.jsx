import { useState, useEffect, useRef, useContext } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { constants } from "../../global/constants";
import PaymentStatusDialog from "./PaymentStatusDialog";
import PaymentStatusDialogOffline from "./PaymentStatusDialogOffline";
import { fetchSchoolYear, fetchStudents1 } from "../../services/api/Api";
import { AuthContext } from "../../context/AuthContext";

export const AdmissionFees = () => {
  const [students, setStudents] = useState([]);
  const [availableFees, setAvailableFees] = useState({
    annual_fees: [],
    monthly_fees_by_cycle: {}
  });
  const [selectedFeeIds, setSelectedFeeIds] = useState([]);
  const [paymentStatus, setPaymentStatus] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showPaymentDialog1, setShowPaymentDialog1] = useState(false);
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [studentYearId, setStudentYearId] = useState(null);
  const [selectedSchYear, setselectedSchYear] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingFees, setIsLoadingFees] = useState(false);
  const [isFetchingReceipt, setIsFetchingReceipt] = useState(false);
  const [schoolYear, setSchoolYear] = useState([]);
  const [apiError, setApiError] = useState("");
  const { axiosInstance } = useContext(AuthContext);

  const [selectedStudentName, setSelectedStudentName] = useState("");
  const [searchStudentInput, setSearchStudentInput] = useState("");
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);

  // State for per‑cycle penalties
  const [cyclePenalties, setCyclePenalties] = useState({});

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
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      student_id: "",
      cash_amount: "0",
      online_amount: "0",
      cheque_amount: "0",
      penalty: "0",
      received_by: "",
    },
  });

  const selectedStudentId = watch("student_id");

  const cashAmount = parseFloat(watch("cash_amount")) || 0;
  const onlineAmount = parseFloat(watch("online_amount")) || 0;
  const chequeAmount = parseFloat(watch("cheque_amount")) || 0;

  // Helper: Get school year name from ID
  const getSchoolYearName = () => {
    if (!selectedSchYear) return "";
    const sy = schoolYear.find(s => s.id === parseInt(selectedSchYear));
    return sy ? sy.year_name : "";
  };

  // fetch receipt – now includes receipt_number
  const fetchReceiptData = async (studentYearId, receiptNumber) => {
    try {
      const response = await axiosInstance.get(
        `${BASE_URL}/d/studentfees/grouped_receipts/?student_year_id=${studentYearId}&receipt_number=${receiptNumber}`
      );
      return response.data;
    } catch (error) {
      console.error("Failed to fetch receipt:", error);
      throw error;
    }
  };

  // Get all classes
  const getClasses = async () => {
    try {
      setIsLoading(true);
      setApiError("");
      const response = await axios.get(`${BASE_URL}/d/year-levels/`);
      setClasses(response.data);
    } catch (err) {
      console.log(err);
      setApiError("Failed to load classes");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch available fees
  const fetchAvailableFees = async (studentId) => {
    if (!studentId || !selectedSchYear) {
      setAvailableFees({ annual_fees: [], monthly_fees_by_cycle: {} });
      return;
    }

    try {
      setIsLoadingFees(true);
      const response = await axiosInstance.get(
        `${BASE_URL}/d/studentfees/fee_preview/?student_year_id=${studentId}&school_year_id=${selectedSchYear}`
      );

      const data = response.data;
      setAvailableFees({
        annual_fees: data.annual_fees || [],
        monthly_fees_by_cycle: data.monthly_fees_by_cycle || {}
      });
    } catch (error) {
      console.error("Error fetching fees:", error);
      setApiError("Failed to load fees");
      setAvailableFees({ annual_fees: [], monthly_fees_by_cycle: {} });
    } finally {
      setIsLoadingFees(false);
    }
  };

  // ✅ NEW: Fetch students by school year and class (like first component)
  const getStudentsBySchoolYearAndClass = async () => {
    if (!selectedSchYear || !selectedClassId) {
      setStudents([]);
      return;
    }

    try {
      setIsLoading(true);
      setApiError("");

      const schoolYearName = getSchoolYearName();
      if (!schoolYearName) {
        setStudents([]);
        return;
      }

      const response = await axiosInstance.get(
        `${BASE_URL}/s/studentyearlevels/?year__year_name=${encodeURIComponent(schoolYearName)}&level__id=${selectedClassId}`
      );

      const studentData = Array.isArray(response.data) ? response.data :
        (response.data.results ? response.data.results : []);

      setStudents(studentData);
    } catch (err) {
      console.log(err);
      setApiError("Failed to load students");
      setStudents([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch school_year
  const getSchool_year = async () => {
    try {
      const obj = await fetchSchoolYear();
      setSchoolYear(obj);
    } catch (err) {
      console.log("Failed to load school years. Please try again." + err);
    }
  };

  useEffect(() => {
    getClasses();
    getSchool_year();
  }, []);

  const handleClassChange = (e) => {
    const classId = e.target.value;
    setSelectedClassId(classId);
    reset({
      student_id: "",
      cash_amount: "0",
      online_amount: "0",
      cheque_amount: "0",
      penalty: "0",
      received_by: "",
    });
    setSelectedFeeIds([]);
    setSelectedStudent(null);
    setStudentYearId(null);
    setAvailableFees({ annual_fees: [], monthly_fees_by_cycle: {} });
    setApiError("");
    setSelectedStudentName("");
    setCyclePenalties({});
    setStudents([]); // Clear students when class changes
  };

  // ✅ NEW: Fetch students when school year OR class changes
  useEffect(() => {
    if (selectedSchYear && selectedClassId) {
      getStudentsBySchoolYearAndClass();
    } else {
      setStudents([]);
    }
  }, [selectedSchYear, selectedClassId]);

  // Old getStudents removed - replaced by getStudentsBySchoolYearAndClass

  useEffect(() => {
    if (selectedStudentId) {
      const student = students.find(
        (s) => s.student_id === parseInt(selectedStudentId) || s.id === parseInt(selectedStudentId)
      );
      setSelectedStudent(student || null);
      setStudentYearId(student ? student.id : null);
    } else {
      setSelectedStudent(null);
      setStudentYearId(null);
      setAvailableFees({ annual_fees: [], monthly_fees_by_cycle: {} });
      setSelectedFeeIds([]);
      setCyclePenalties({});
    }
  }, [selectedStudentId, students]);

  useEffect(() => {
    if (studentYearId && selectedSchYear) {
      fetchAvailableFees(studentYearId);
    } else {
      setAvailableFees({ annual_fees: [], monthly_fees_by_cycle: {} });
    }
  }, [studentYearId, selectedSchYear]);

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

  const isStaffOrDirector =
    role === constants.roles.officeStaff || role === constants.roles.director;

  // Handle annual fee selection
  const handleAnnualFeeSelection = (feeId, isSelected) => {
    if (isSelected) {
      setSelectedFeeIds((prev) => [...prev, `annual-${feeId}`]);
    } else {
      setSelectedFeeIds((prev) => prev.filter((id) => id !== `annual-${feeId}`));
    }
  };

  // Handle monthly fee selection (individual months)
  const handleMonthSelection = (cycleKey, month, isSelected) => {
    const key = `${cycleKey}-${month}`;
    if (isSelected) {
      setSelectedFeeIds((prev) => [...prev, key]);
    } else {
      setSelectedFeeIds((prev) => prev.filter((id) => id !== key));
    }
  };

  // Handle cycle select all
  const handleCycleSelectAll = (cycleKey, cycleData, isSelected) => {
    if (isSelected) {
      const newSelectedFees = [...selectedFeeIds];
      cycleData.forEach((feeItem) => {
        feeItem.months.forEach((monthData) => {
          const key = `${cycleKey}-${monthData.month}`;
          if (!newSelectedFees.includes(key)) {
            newSelectedFees.push(key);
          }
        });
      });
      setSelectedFeeIds(newSelectedFees);
    } else {
      const cycleMonthKeys = [];
      cycleData.forEach((feeItem) => {
        feeItem.months.forEach((monthData) => {
          cycleMonthKeys.push(`${cycleKey}-${monthData.month}`);
        });
      });
      setSelectedFeeIds((prev) =>
        prev.filter((id) => !cycleMonthKeys.includes(id))
      );
    }
  };

  // Check if all months in cycle are selected
  const isCycleFullySelected = (cycleKey, cycleData) => {
    if (!cycleData || cycleData.length === 0) return false;
    const allMonthKeys = [];
    cycleData.forEach((feeItem) => {
      if (feeItem.months) {
        feeItem.months.forEach((monthData) => {
          allMonthKeys.push(`${cycleKey}-${monthData.month}`);
        });
      }
    });
    return allMonthKeys.length > 0 && allMonthKeys.every((key) => selectedFeeIds.includes(key));
  };

  // Calculate total amounts
  const calculateTotalAmount = () => {
    let baseAmount = 0;
    let paidAmount = 0;
    let dueAmount = 0;

    if (availableFees.annual_fees) {
      availableFees.annual_fees.forEach((fee) => {
        if (selectedFeeIds.includes(`annual-${fee.fee_id}`)) {
          baseAmount += Number(fee.original_amount) || 0;
          paidAmount += Number(fee.paid_amount) || 0;
          dueAmount += Number(fee.due_amount) || 0;
        }
      });
    }

    if (availableFees.monthly_fees_by_cycle) {
      Object.entries(availableFees.monthly_fees_by_cycle).forEach(
        ([cycleKey, cycleFees]) => {
          if (Array.isArray(cycleFees)) {
            cycleFees.forEach((feeItem) => {
              if (feeItem.months && Array.isArray(feeItem.months)) {
                feeItem.months.forEach((monthData) => {
                  const key = `${cycleKey}-${monthData.month}`;
                  if (selectedFeeIds.includes(key)) {
                    baseAmount += Number(monthData.original_amount) || 0;
                    paidAmount += Number(monthData.paid_amount) || 0;
                    dueAmount += Number(monthData.due_amount) || 0;
                  }
                });
              }
            });
          }
        }
      );
    }

    const totalPenalty = Object.values(cyclePenalties).reduce((sum, val) => sum + (Number(val) || 0), 0);
    const totalPayable = dueAmount + totalPenalty;
    return { baseAmount, paidAmount, dueAmount, penalty: totalPenalty, totalPayable };
  };

  const totalAmount = calculateTotalAmount();
  const totalPaid = cashAmount + onlineAmount + chequeAmount;

  // onSubmit
  const onSubmit = async (data) => {
    if (selectedFeeIds.length === 0) {
      alert("Please select at least one fee to pay");
      return;
    }

    if (!selectedStudent || !studentYearId) {
      alert("Please select a student.");
      return;
    }

    const flatSelectedFees = [];

    // Annual
    if (availableFees.annual_fees) {
      availableFees.annual_fees.forEach((fee) => {
        const due = Number(fee.due_amount) || 0;
        if (selectedFeeIds.includes(`annual-${fee.fee_id}`) && due > 0) {
          flatSelectedFees.push({
            fee_type_id: fee.fee_id,
            due: due,
            isAnnual: true,
            cycleKey: null,
          });
        }
      });
    }

    // Monthly
    if (availableFees.monthly_fees_by_cycle) {
      Object.entries(availableFees.monthly_fees_by_cycle).forEach(
        ([cycleKey, cycleFees]) => {
          if (Array.isArray(cycleFees)) {
            const cyclePenalty = Number(cyclePenalties[cycleKey]) || 0;
            cycleFees.forEach((feeItem) => {
              const feeTypeId = feeItem.fee_id;
              if (feeItem.months && Array.isArray(feeItem.months)) {
                feeItem.months.forEach((monthData) => {
                  const due = Number(monthData.due_amount) || 0;
                  if (
                    selectedFeeIds.includes(`${cycleKey}-${monthData.month}`) &&
                    (due > 0 || (due === 0 && cyclePenalty > 0))
                  ) {
                    flatSelectedFees.push({
                      fee_type_id: feeTypeId,
                      month: monthData.month,
                      due: due,
                      isAnnual: false,
                      cycleKey: cycleKey,
                    });
                  }
                });
              }
            });
          }
        }
      );
    }

    if (flatSelectedFees.length === 0) {
      alert("No unpaid fees selected. Please select pending fees.");
      return;
    }

    const monthlyFeesByCycle = {};
    const annualFees = [];
    flatSelectedFees.forEach((fee) => {
      if (fee.isAnnual) {
        annualFees.push(fee);
      } else {
        if (!monthlyFeesByCycle[fee.cycleKey]) monthlyFeesByCycle[fee.cycleKey] = [];
        monthlyFeesByCycle[fee.cycleKey].push(fee);
      }
    });

    const flatSelectedFeesFull = [];

    annualFees.forEach((fee) => {
      flatSelectedFeesFull.push({
        ...fee,
        penaltyPortion: 0,
        fullAmount: fee.due,
      });
    });

    Object.keys(monthlyFeesByCycle).forEach((cycleKey) => {
      const feesInCycle = monthlyFeesByCycle[cycleKey];
      const totalDueCycle = feesInCycle.reduce((sum, f) => sum + f.due, 0);
      const cyclePenalty = Number(cyclePenalties[cycleKey]) || 0;

      if (totalDueCycle === 0 && feesInCycle.length > 0 && cyclePenalty > 0) {
        feesInCycle.forEach((fee, index) => {
          const penaltyPortion = index === 0 ? cyclePenalty : 0;
          flatSelectedFeesFull.push({
            ...fee,
            penaltyPortion,
            fullAmount: fee.due + penaltyPortion,
          });
        });
        return;
      }

      let remainingPenalty = cyclePenalty;
      feesInCycle.forEach((fee, index) => {
        let penaltyPortion = 0;
        if (totalDueCycle > 0) {
          const raw = (fee.due / totalDueCycle) * cyclePenalty;
          penaltyPortion = Math.round(raw * 100) / 100;
          if (index === feesInCycle.length - 1) {
            penaltyPortion = Math.round(remainingPenalty * 100) / 100;
          } else {
            remainingPenalty -= penaltyPortion;
          }
        }
        flatSelectedFeesFull.push({
          ...fee,
          penaltyPortion,
          fullAmount: fee.due + penaltyPortion,
        });
      });
    });

    const feeGroups = {};
    flatSelectedFeesFull.forEach((item) => {
      const key = item.fee_type_id;
      if (!feeGroups[key]) {
        feeGroups[key] = {
          fee_type_id: key,
          totalDue: 0,
          totalPenalty: 0,
          months: [],
          isAnnual: item.isAnnual,
        };
      }
      feeGroups[key].totalDue += item.due;
      feeGroups[key].totalPenalty += item.penaltyPortion;
      if (!item.isAnnual && item.month !== undefined) {
        feeGroups[key].months.push(item.month);
      }
    });

    const fees = Object.values(feeGroups).map((group) => {
      const feeObj = {
        fee_type_id: group.fee_type_id,
        amount: group.totalDue,
        penalty_amount: group.totalPenalty,
      };
      if (!group.isAnnual && group.months.length > 0) {
        feeObj.months = group.months;
      }
      return feeObj;
    });

    const paymentMethods = [];
    if (cashAmount > 0) paymentMethods.push({ method: "cash", amount: cashAmount });
    if (onlineAmount > 0) paymentMethods.push({ method: "online", amount: onlineAmount });
    if (chequeAmount > 0) paymentMethods.push({ method: "cheque", amount: chequeAmount });

    const payload = {
      student_year_id: studentYearId,
      school_year_id: selectedSchYear,
      fees,
      payment_methods: paymentMethods,
    };

    const hasOnline = onlineAmount > 0;

    try {
      console.log("📦 Submitting fee payload:", JSON.stringify(payload, null, 2));

      const submitRes = await axiosInstance.post(
        `${BASE_URL}/d/studentfees/submit_fee/`,
        payload
      );

      console.log("✅ submit_fee response:", submitRes.data);

      const { receipt_number, pending_online_payments } = submitRes.data;

      if (hasOnline) {
        const confirmFees = (pending_online_payments || []).map((p) => {
          const confirmItem = {
            fee_type_id: p.fee_type_id,
            amount: Number(p.amount),
          };
          if (p.month) {
            confirmItem.month = p.month;
          }
          return confirmItem;
        });

        console.log("💳 confirmFees (for online):", confirmFees);

        const { razorpay_order_id, razorpay_key_id, online_amount: onlineAmt } = submitRes.data;
        if (!razorpay_order_id) {
          throw new Error("Failed to create Razorpay order");
        }

        const amountInPaise = Math.round(parseFloat(onlineAmt) * 100);

        const isScriptLoaded = await loadRazorpayScript();
        if (!isScriptLoaded) throw new Error("Razorpay SDK failed to load");

        let paymentCompleted = false;

        const options = {
          key: razorpay_key_id,
          amount: amountInPaise,
          currency: "INR",
          name: "School Fee Payment",
          description: `Receipt: ${receipt_number}`,
          order_id: razorpay_order_id,
          modal: {
            ondismiss: async function () {
              if (paymentCompleted) return;
              setIsFetchingReceipt(true);
              try {
                const receiptData = await fetchReceiptData(studentYearId, receipt_number);
                setPaymentStatus(receiptData);
                setShowPaymentDialog1(true);
              } catch (fetchError) {
                console.error("Failed to fetch receipt after cancellation:", fetchError);
                setPaymentStatus("Payment partially completed. Receipt could not be retrieved.");
                setShowPaymentDialog1(true);
              } finally {
                setIsFetchingReceipt(false);
              }
            },
          },
          handler: async function (response) {
            paymentCompleted = true;
            const verifyPayload = {
              student_year_id: studentYearId,
              selected_fees: confirmFees,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            };

            console.log("📨 Sending confirm_payment payload:", verifyPayload);

            try {
              const confirmRes = await axiosInstance.post(
                `${BASE_URL}/d/studentfees/confirm_payment/`,
                verifyPayload
              );
              console.log("✅ confirm_payment success:", confirmRes.data);

              setIsFetchingReceipt(true);
              const receiptData = await fetchReceiptData(studentYearId, receipt_number);
              setPaymentStatus(receiptData);
              setShowPaymentDialog(true);
            } catch (error) {
              console.error("❌ confirm_payment error:", error.response?.data || error.message);
              setPaymentStatus("Payment verification failed");
              setShowPaymentDialog(true);
            } finally {
              setIsFetchingReceipt(false);
            }
          },
          prefill: {
            name: selectedStudent?.student_name || "",
            email: selectedStudent?.email || "",
          },
          theme: { color: "#5E35B1" },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        setIsFetchingReceipt(true);
        try {
          const receiptData = await fetchReceiptData(studentYearId, receipt_number);
          setPaymentStatus(receiptData);
          setShowPaymentDialog1(true);
        } catch (fetchError) {
          console.error("Failed to fetch receipt:", fetchError);
          setPaymentStatus("Payment recorded but receipt could not be retrieved. Please contact support.");
          setShowPaymentDialog1(true);
        } finally {
          setIsFetchingReceipt(false);
        }
      }
    } catch (err) {
      console.error("💥 Payment failed:", err.response?.data || err.message);
      setPaymentStatus("Payment failed. Please try again.");
    }
  };

  const stuId = window.localStorage.getItem("student_id");
  const stuYearlvlName = localStorage.getItem("stu_year_level_name");
  const stuYearlvlId = localStorage.getItem("stu_year_level_id");

  const handleRetry = () => {
    if (studentYearId) {
      fetchAvailableFees(studentYearId);
    }
  };

  // Filter students by name or scholar number
  const filteredStudents = students
    ?.filter((student) =>
      `${student?.student_name || ""} ${student?.scholar_number || ""}`
        .toLowerCase()
        .includes(searchStudentInput.trim().toLowerCase())
    )
    .sort((a, b) => (a.student_name || "").localeCompare(b.student_name || ""));

  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowStudentDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const isSubmitDisabled = isSubmitting || selectedFeeIds.length === 0 || isFetchingReceipt;

  const hasAnnualFees = availableFees.annual_fees && availableFees.annual_fees.length > 0;
  const hasMonthlyFees = availableFees.monthly_fees_by_cycle &&
    Object.keys(availableFees.monthly_fees_by_cycle).length > 0;
  const hasAnyFees = hasAnnualFees || hasMonthlyFees;

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
  }

  if (isLoadingFees && !apiError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="flex space-x-2">
          <div className="w-3 h-3 bgTheme rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bgTheme rounded-full animate-bounce [animation-delay:-0.2s]"></div>
          <div className="w-3 h-3 bgTheme rounded-full animate-bounce [animation-delay:-0.4s]"></div>
        </div>
        <p className="mt-2 text-gray-500 text-sm">Loading fees...</p>
      </div>
    );
  }

  if (apiError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-6">
        <i className="fa-solid fa-triangle-exclamation text-5xl text-red-400 mb-4"></i>
        <p className="text-lg text-red-400 font-medium">
          Failed to load data, Try Again
        </p>
        <button className="bg-red-400 btn text-white" onClick={handleRetry}>
          retry
        </button>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* School Year */}
            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center gap-1">
                  <i className="fa-solid fa-school text-sm"></i>
                  School Year <span className="text-error">*</span>
                </span>
              </label>
              <select
                className="select select-bordered w-full focus:outline-none"
                onChange={(e) => setselectedSchYear(e.target.value)}
                value={selectedSchYear || ""}
              >
                <option value="">Select Year</option>
                {schoolYear?.map((year) => (
                  <option key={year.id} value={year.id}>
                    {year.year_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Class Selection */}
            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center gap-1">
                  <i className="fa-solid fa-school text-sm"></i>
                  Class <span className="text-error">*</span>
                </span>
              </label>
              <select
                className="select select-bordered w-full focus:outline-none"
                onChange={handleClassChange}
                value={selectedClassId || ""}
              >
                <option value="">Select Class</option>
                {UserRole === "director"
                  ? classes?.map((classItem) => (
                    <option key={classItem.id} value={classItem.id}>
                      {classItem.level_name}
                    </option>
                  ))
                  : UserRole === "office staff"
                    ? classes?.map((classItem) => (
                      <option key={classItem.id} value={classItem.id}>
                        {classItem.level_name}
                      </option>
                    ))
                    : UserRole === "guardian"
                      ? classes?.map((classItem) => (
                        <option key={classItem.id} value={classItem.id}>
                          {classItem.level_name}
                        </option>
                      ))
                      : null}
                {UserRole === "student" && (
                  <option key={stuYearlvlId} value={stuYearlvlId}>
                    {stuYearlvlName}
                  </option>
                )}
              </select>
            </div>

            {/* Student Selection */}
            <div className="form-control relative" ref={dropdownRef}>
              <label className="label">
                <span className="label-text flex items-center gap-1 text-gray-700 dark:text-gray-300">
                  <i className="fa-solid fa-user-graduate text-sm"></i>
                  Student <span className="text-error">*</span>
                </span>
              </label>

              <div
                className={`input input-bordered w-full flex items-center justify-between cursor-pointer ${!selectedClassId || !selectedSchYear ? "cursor-not-allowed opacity-70" : ""
                  }`}
                disabled={!selectedClassId || !selectedSchYear}
                onClick={() => {
                  if (selectedClassId && selectedSchYear)
                    setShowStudentDropdown(!showStudentDropdown);
                }}
              >
                {selectedStudentName || "Select Student"}
                <div>
                  <span className="arrow">&#9662;</span>
                </div>
              </div>

              <input
                type="hidden"
                {...register("student_id", {
                  required: "Student selection is required",
                })}
                value={watch("student_id") || ""}
                readOnly
              />

              {showStudentDropdown && selectedClassId && selectedSchYear && (
                <div className="absolute z-10 bg-white text-gray-700 dark:bg-[#191b1b] dark:text-amber-50 rounded w-full mt-1 shadow-lg">
                  <div className="p-2 sticky top-0 dark:bg-[#1c1f1f] shadow-sm bg-base-100">
                    <input
                      type="text"
                      placeholder="Search Student by Name or Scholar No..."
                      className="input input-bordered w-full focus:outline-none"
                      value={searchStudentInput}
                      onChange={(e) => setSearchStudentInput(e.target.value)}
                      autoComplete="off"
                    />
                  </div>

                  <div className="max-h-40 overflow-y-auto">
                    {isLoading ? (
                      <p className="p-2">Loading students...</p>
                    ) : filteredStudents?.length > 0 ? (
                      filteredStudents.map((stu) => {
                        const studentId = stu.student_id || stu.id;
                        const studentName = stu.student_name || stu.name || "Unknown";
                        const scholarNo = stu.scholar_number || "";
                        const sectionDisplay = stu.section ? ` (${stu.section})` : "";
                        return (
                          <p
                            key={studentId}
                            className="p-2 hover:bg-base-200 cursor-pointer"
                            onClick={() => {
                              const displayName = `${studentName}${scholarNo ? ` - ${scholarNo}` : ''}${sectionDisplay}`;
                              setSelectedStudentName(displayName);
                              setSearchStudentInput("");
                              setShowStudentDropdown(false);
                              setValue("student_id", studentId, {
                                shouldValidate: true,
                              });
                              clearErrors("student_id");
                              setSelectedStudent(stu);
                              setStudentYearId(stu.id);
                              setSelectedFeeIds([]);
                              setCyclePenalties({});
                            }}
                          >
                            {studentName}{scholarNo ? ` - ${scholarNo}` : ''}{sectionDisplay}
                          </p>
                        );
                      })
                    ) : (
                      <p className="p-2">No students found for this class and year.</p>
                    )}
                  </div>
                </div>
              )}

              {errors.student_id && (
                <p className="text-error text-sm mt-1">
                  {errors.student_id.message}
                </p>
              )}
            </div>
          </div>

          {/* Available Fees Display */}
          {hasAnyFees && selectedStudent && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-gray-100">
                Fee Details for {selectedStudent.student_name}
              </h2>

              {/* Annual Fees Section */}
              {hasAnnualFees && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <i className="fa-solid fa-calendar-check text-primary"></i>
                    Annual Fees
                  </h3>
                  <div className="overflow-x-auto rounded-lg border">
                    <table className="table w-full">
                      <thead className="bg-base-200">
                        <tr>
                          <th>Fee Type</th>
                          <th>Original Amount</th>
                          <th>Paid</th>
                          <th>Due</th>
                          <th>Status</th>
                          <th>Select</th>
                        </tr>
                      </thead>
                      <tbody>
                        {availableFees.annual_fees.map((fee) => {
                          const isSelectable = fee.status !== "Paid";
                          const isChecked = selectedFeeIds.includes(
                            `annual-${fee.fee_id}`
                          );

                          const originalAmount = Number(fee.original_amount) || 0;
                          const paidAmount = Number(fee.paid_amount) || 0;
                          const dueAmount = Number(fee.due_amount) || 0;

                          return (
                            <tr key={fee.fee_id} className="hover">
                              <td className="font-medium">{fee.fee_type}</td>
                              <td>₹{originalAmount.toFixed(2)}</td>
                              <td>₹{paidAmount.toFixed(2)}</td>
                              <td className={dueAmount > 0 ? "text-warning" : ""}>
                                ₹{dueAmount.toFixed(2)}
                              </td>
                              <td>
                                {fee.status === "Paid" ? (
                                  <span className="badge badge-success">Paid</span>
                                ) : fee.status === "Partial" ? (
                                  <span className="badge badge-warning">Partial</span>
                                ) : (
                                  <span className="badge badge-error">Pending</span>
                                )}
                              </td>
                              <td>
                                {isSelectable ? (
                                  <input
                                    type="checkbox"
                                    className="checkbox checkbox-primary"
                                    checked={isChecked}
                                    onChange={(e) =>
                                      handleAnnualFeeSelection(fee.fee_id, e.target.checked)
                                    }
                                  />
                                ) : (
                                  <i className="fa-solid fa-check text-success"></i>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Monthly Fees by Cycle */}
              {hasMonthlyFees && (
                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <i className="fa-solid fa-calendar text-primary"></i>
                    Monthly Fees
                  </h3>

                  {Object.entries(availableFees.monthly_fees_by_cycle).map(
                    ([cycleKey, cycleFees]) => {
                      if (!Array.isArray(cycleFees)) return null;

                      return (
                        <div key={cycleKey} className="mb-8">
                          {/* Cycle header with penalty input */}
                          <div className="flex items-center gap-3 mb-4 bg-base-200 p-3 rounded-lg flex-wrap">
                            <input
                              type="checkbox"
                              className="checkbox checkbox-primary"
                              checked={isCycleFullySelected(cycleKey, cycleFees)}
                              onChange={(e) =>
                                handleCycleSelectAll(cycleKey, cycleFees, e.target.checked)
                              }
                            />
                            <h4 className="text-lg font-bold">{cycleKey}</h4>
                            <span className="text-sm text-gray-500">
                              ({cycleFees[0]?.months?.length || 0} months)
                            </span>
                            <div className="ml-auto flex items-center gap-2">
                              <span className="text-sm text-red-500 font-semibold">⚠️ Penalty:</span>
                              <input
                                type="number"
                                min="0"
                                step="any"
                                className="input input-bordered input-sm w-28 border-red-400 focus:border-red-600 focus:ring-1 focus:ring-red-200 focus:outline-none bg-red-50"
                                value={cyclePenalties[cycleKey] ?? ''}
                                onChange={(e) => {
                                  const val = e.target.value === '' ? 0 : Number(e.target.value) || 0;
                                  setCyclePenalties(prev => ({ ...prev, [cycleKey]: val }));
                                }}
                                placeholder="0"
                              />
                            </div>
                          </div>

                          <div className="overflow-x-auto rounded-lg border">
                            <table className="table w-full">
                              <thead className="bg-base-200">
                                <tr>
                                  <th>Month</th>
                                  <th>Fee Type</th>
                                  <th>Original Amount</th>
                                  <th>Paid</th>
                                  <th>Due</th>
                                  <th>Status</th>
                                  <th>Select</th>
                                </tr>
                              </thead>
                              <tbody>
                                {cycleFees.map((feeItem) => {
                                  if (!feeItem.months || !Array.isArray(feeItem.months)) return null;

                                  return feeItem.months.map((monthData, idx) => {
                                    const cyclePenalty = Number(cyclePenalties[cycleKey]) || 0;
                                    const isSelectable = monthData.status !== "Paid" || cyclePenalty > 0;
                                    const isChecked = selectedFeeIds.includes(
                                      `${cycleKey}-${monthData.month}`
                                    );

                                    const originalAmount = Number(monthData.original_amount) || 0;
                                    const paidAmount = Number(monthData.paid_amount) || 0;
                                    const dueAmount = Number(monthData.due_amount) || 0;

                                    return (
                                      <tr key={`${cycleKey}-${monthData.month}`} className="hover">
                                        <td className="font-medium">
                                          {monthData.month_label || `${monthData.month_name} ${monthData.month_year}`}
                                        </td>
                                        <td>{feeItem.fee_type}</td>
                                        <td>₹{originalAmount.toFixed(2)}</td>
                                        <td>₹{paidAmount.toFixed(2)}</td>
                                        <td className={dueAmount > 0 ? "text-warning" : ""}>
                                          ₹{dueAmount.toFixed(2)}
                                        </td>
                                        <td>
                                          {monthData.status === "Paid" ? (
                                            <span className="badge badge-success">Paid</span>
                                          ) : monthData.status === "Partial" ? (
                                            <span className="badge badge-warning">Partial</span>
                                          ) : (
                                            <span className="badge badge-error">Pending</span>
                                          )}
                                        </td>
                                        <td>
                                          {isSelectable ? (
                                            <input
                                              type="checkbox"
                                              className="checkbox checkbox-primary"
                                              checked={isChecked}
                                              onChange={(e) =>
                                                handleMonthSelection(
                                                  cycleKey,
                                                  monthData.month,
                                                  e.target.checked
                                                )
                                              }
                                            />
                                          ) : (
                                            <i className="fa-solid fa-check text-success"></i>
                                          )}
                                        </td>
                                      </tr>
                                    );
                                  });
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              )}

              {/* Payment Summary */}
              {selectedFeeIds.length > 0 && (
                <div className="bg-base-300 p-4 rounded-lg mt-6">
                  <h3 className="text-lg font-semibold mb-2">Payment Summary</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {totalAmount.baseAmount > 0 && (
                      <>
                        <div>Base Amount:</div>
                        <div className="text-right">₹{totalAmount.baseAmount.toFixed(2)}</div>
                      </>
                    )}
                    {totalAmount.paidAmount > 0 && (
                      <>
                        <div>Already Paid:</div>
                        <div className="text-right">₹{totalAmount.paidAmount.toFixed(2)}</div>
                      </>
                    )}
                    <div>Due Amount (without penalty):</div>
                    <div className="text-right">₹{totalAmount.dueAmount.toFixed(2)}</div>
                    {totalAmount.penalty > 0 && (
                      <>
                        <div className="text-red-600 font-semibold">➕ Total Penalty:</div>
                        <div className="text-right text-red-600 font-semibold">
                          ₹{totalAmount.penalty.toFixed(2)}
                        </div>
                      </>
                    )}
                    <div className="font-bold mt-2 border-t pt-2">Total Payable (including penalty):</div>
                    <div className="text-right font-bold mt-2 border-t pt-2 text-primary">
                      ₹{totalAmount.totalPayable.toFixed(2)}
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Section */}
              {selectedFeeIds.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <i className="fa-solid fa-credit-card text-primary"></i>
                    Payment Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {isStaffOrDirector && (
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text flex items-center gap-2">
                            <i className="fa-solid fa-money-bill text-sm"></i>
                            Cash Amount
                          </span>
                        </label>
                        <input
                          type="text"
                          inputmode="decimal"
                          className="input input-bordered w-full focus:outline-none"
                          {...register("cash_amount")}
                          min="0"
                          step="any"
                        />
                      </div>
                    )}

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text flex items-center gap-2">
                          <i className="fa-solid fa-globe text-sm"></i>
                          Online Amount
                        </span>
                      </label>
                      <input
                        type="text"
                        inputMode="decimal"
                        className="input input-bordered w-full focus:outline-none"
                        {...register("online_amount")}
                        min="0"
                        step="any"
                      />
                    </div>

                    {isStaffOrDirector && (
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text flex items-center gap-2">
                            <i className="fa-solid fa-money-check text-sm"></i>
                            Cheque Amount
                          </span>
                        </label>
                        <input
                          type="text"
                          inputMode="decimal"
                          className="input input-bordered w-full focus:outline-none"
                          {...register("cheque_amount")}
                          min="0"
                          step="any"
                        />
                      </div>
                    )}
                  </div>

                  <div className="mt-4 p-4 bg-base-200 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">Total Paid:</span>
                      <span className="text-2xl font-bold text-primary">
                        ₹{totalPaid.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* No Fees Message */}
          {!isLoadingFees && !hasAnyFees && selectedStudentId && (
            <div className="text-center mt-8 text-gray-500">
              No fees found for the selected student and year.
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-center mt-10">
            <button
              type="submit"
              className={`btn bgTheme text-white w-52 ${isSubmitDisabled ? "opacity-50 cursor-not-allowed" : "hover:bg-purple-700"
                }`}
              disabled={isSubmitDisabled}
            >
              {isSubmitting || isFetchingReceipt ? (
                <i className="fa-solid fa-spinner fa-spin mr-2"></i>
              ) : (
                <i className="fa-solid fa-money-bill-wave ml-2"></i>
              )}
              {isSubmitting || isFetchingReceipt ? "Processing..." : "Submit Payment"}
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