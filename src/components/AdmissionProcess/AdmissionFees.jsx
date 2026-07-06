// import { useState, useEffect, useRef, useContext } from "react";
// import { useForm } from "react-hook-form";
// import axios from "axios";
// import { constants } from "../../global/constants";
// import PaymentStatusDialog from "./PaymentStatusDialog";
// import PaymentStatusDialogOffline from "./PaymentStatusDialogOffline";
// import { fetchSchoolYear, fetchStudents1 } from "../../services/api/Api";
// import { AuthContext } from "../../context/AuthContext";

// export const AdmissionFees = () => {
//   const [students, setStudents] = useState([]);
//   const [availableFees, setAvailableFees] = useState([]);
//   const [selectedFeeIds, setSelectedFeeIds] = useState([]);
//   const [paymentStatus, setPaymentStatus] = useState([]);
//   const [selectedStudent, setSelectedStudent] = useState(null);
//   const [showPaymentDialog, setShowPaymentDialog] = useState(false);
//   const [showPaymentDialog1, setShowPaymentDialog1] = useState(false);
//   const [classes, setClasses] = useState([]);
//   const [selectedClassId, setSelectedClassId] = useState(null);
//   const [studentYearId, setStudentYearId] = useState(null);
//   const [selectedSchYear, setselectedSchYear] = useState(null);

//   const [isLoading, setIsLoading] = useState(false);
//   const [isLoadingFees, setIsLoadingFees] = useState(false);
//   const [schoolYear, setSchoolYear] = useState([]);
//   const [availableMonths, setAvailableMonths] = useState([]);
//   const [apiError, setApiError] = useState("");
//   const { axiosInstance } = useContext(AuthContext);

//   const [selectedStudentName, setSelectedStudentName] = useState("");
//   const [searchStudentInput, setSearchStudentInput] = useState("");
//   const [showStudentDropdown, setShowStudentDropdown] = useState(false);

//   const authTokens = JSON.parse(localStorage.getItem("authTokens"));
//   const accessToken = authTokens?.access; 
//   const BASE_URL = constants.baseUrl;
//   const UserRole = window.localStorage.getItem("userRole");

//   const {
//     register,
//     handleSubmit,
//     watch,
//     reset,
//     setValue,
//     clearErrors,
//     formState: { errors, isSubmitting },
//   } = useForm({
//     defaultValues: {
//       student_id: "",
//       month: "",
//       paid_amount: "",
//       payment_mode: "",
//       remarks: "",
//       received_by: "",
//     },
//   });

//   const selectedStudentId = watch("student_id");
//   const selectedPaymentMode = watch("payment_mode");

//   // Fetch all classes
//   const getClasses = async () => {
//     try {
//       setIsLoading(true);
//       setApiError("");
//       const response = await axios.get(`${BASE_URL}/d/year-levels/`);
//       setClasses(response.data);
//     } catch (err) {
//       console.log(err);
//       setApiError("Failed to load classes");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const fetchAvailableFees = async (studentId) => {
//     if (!studentId || !selectedSchYear) {
//       setAvailableFees([]);
//       return [];
//     }

//     try {
//       setIsLoadingFees(true);
//       const [feePreviewRes, structureRes] = await Promise.all([
//         axiosInstance.get(
//           `${BASE_URL}/d/studentfees/fee_preview/?student_year_id=${studentId}&school_year_id=${selectedSchYear}`
//         ),
//         axiosInstance.get(`${BASE_URL}/d/feestructures/?year_level_id=${selectedClassId}`)
//       ]);

//       let previewData = Array.isArray(feePreviewRes.data) ? feePreviewRes.data : [];
//       let structures = Array.isArray(structureRes.data) ? structureRes.data : [];

//       // Map months properly: fallback if month_id missing
//       const monthMap = {
//         January: 1,
//         February: 2,
//         March: 3,
//         April: 4,
//         May: 5,
//         June: 6,
//         July: 7,
//         August: 8,
//         September: 9,
//         October: 10,
//         November: 11,
//         December: 12,
//       };

//       // Attach fee_structure_id + ensure month_id exists
//       previewData.forEach((monthData) => {
//         monthData.month_id = monthData.month_id || monthMap[monthData.month] || null;

//         monthData.fees = monthData.fees.map((fee) => {
//           const structure = structures.find((s) => s.fee_type === fee.fee_type);
//           return {
//             ...fee,
//             fee_structure_id: structure ? structure.id : null,
//             due_amount:
//               (parseFloat(fee.original_amount || 0) || 0) -
//               (parseFloat(fee.paid_amount || 0) || 0),
//           };
//         });
//       });

//       setAvailableFees(previewData);
//       return previewData;
//     } catch (error) {
//       console.error("Error fetching fees:", error);
//       setApiError("Failed to load fees");
//       setAvailableFees([]);
//       return [];
//     } finally {
//       setIsLoadingFees(false);
//     }
//   };

//   // Fetch students for selected class
//   const getStudents = async (classId) => {
//     try {
//       setIsLoading(true);
//       setApiError("");
//       const Students = await fetchStudents1(classId);
//       setStudents(Students);
//     } catch (err) {
//       console.log(err);
//       setApiError("Failed to load students");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Fetch school_year
//   const getSchool_year = async () => {
//     try {
//       const obj = await fetchSchoolYear();
//       setSchoolYear(obj);
//     } catch (err) {
//       console.log("Failed to load school years. Please try again." + err);
//     }
//   };

//   useEffect(() => {
//     getClasses();
//     getSchool_year();
//   }, []);

//   const handleClassChange = (e) => {
//     const classId = e.target.value;
//     setSelectedClassId(classId);
//     reset({
//       student_id: "",
//       month: "",
//       paid_amount: "",
//       payment_mode: "",
//       remarks: "",
//       received_by: "",
//     });
//     setSelectedFeeIds([]);
//     setSelectedStudent(null);
//     setStudentYearId(null);
//     setAvailableFees([]);
//     setAvailableMonths([]);
//     setApiError("");
//     setSelectedStudentName("");
//   };

//   useEffect(() => {
//     if (selectedClassId) {
//       getStudents(selectedClassId);
//       setSelectedStudent(null);
//       setSelectedStudentName("");
//     } else {
//       setStudents([]);
//     }
//   }, [selectedClassId]);

 
//   useEffect(() => {
//     if (selectedStudentId) {
//       const student = students.find(
//         (s) => s.student_id === parseInt(selectedStudentId)
//       );
//       setSelectedStudent(student || null);
//       setStudentYearId(student ? student.id : null); 
//     } else {
//       setSelectedStudent(null);
//       setStudentYearId(null);
//       setAvailableFees([]);
//       setSelectedFeeIds([]);
//     }
//   }, [selectedStudentId, students]);

//   // Fetch fees whenever studentYearId or school year changes
//   useEffect(() => {
//     if (studentYearId && selectedSchYear) {
//       fetchAvailableFees(studentYearId);
//     } else {
//       setAvailableFees([]);
//     }
//   }, [studentYearId, selectedSchYear, selectedClassId]);

//   const role = localStorage.getItem("userRole");
//   const loadRazorpayScript = () => {
//     return new Promise((resolve) => {
//       const script = document.createElement("script");
//       script.src = "https://checkout.razorpay.com/v1/checkout.js";
//       script.onload = () => resolve(true);
//       script.onerror = () => resolve(false);
//       document.body.appendChild(script);
//     });
//   };

//   // Fix role condition
//   const isStaffOrDirector =
//     role === constants.roles.officeStaff || role === constants.roles.director;

//   const paymentModes = isStaffOrDirector
//     ? ["cash", "cheque", "online"]
//     : ["online"];

//   // Optional legacy function (kept if needed elsewhere)
//   const displayRazorpay = async (payload) => {
//     try {
//       const isScriptLoaded = await loadRazorpayScript();
//       if (!isScriptLoaded) throw new Error("Razorpay SDK failed to load");

//       const orderResponse = await axiosInstance.post(
//         `${BASE_URL}/d/fee-record/initiate-payment/`,
//         payload,
//         {
//           headers: {
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       const {
//         razorpay_order_id: orderId,
//         currency,
//         receipt_number,
//         paid_amount: orderAmount,
//       } = orderResponse.data;
//       const {
//         student_id,
//         received_by,
//         payment_mode,
//         paid_amount,
//         selected_fees,
//       } = payload;

//       const options = {
//         key: "rzp_test_4h2aRSAPbYw3f8",
//         amount: orderAmount,
//         currency: currency,
//         name: "School Fee Payment",
//         description: `Receipt: ${receipt_number}`,
//         order_id: orderId,
//         handler: async function (response) {
//           try {
//             const verificationPayload = {
//               razorpay_order_id: response.razorpay_order_id,
//               razorpay_payment_id: response.razorpay_payment_id,
//               razorpay_signature: response.razorpay_signature,
//               student_id: parseInt(student_id),
//               month: selected_fees,
//               received_by: received_by,
//               payment_mode: payment_mode,
//               paid_amount: paid_amount,
//             };

//             const verificationResponse = await axiosInstance.post(
//               `${BASE_URL}/d/fee-record/confirm-payment/`,
//               verificationPayload,
//               {
//                 headers: {
//                   "Content-Type": "application/json",
//                 },
//               }
//             );

//             if (verificationResponse.data) {
//               setPaymentStatus(verificationResponse.data);
//               setShowPaymentDialog(true);
//             } else {
//               setPaymentStatus("Payment verification failed - No data received");
//             }
//           } catch (error) {
//             console.log(
//               " VERIFICATION ERROR:",
//               error.response?.data || error.message
//             );
//             setPaymentStatus("Payment verification failed");
//           }
//         },
//         prefill: {
//           name: selectedStudent?.student_name || "",
//           email: selectedStudent?.email || "",
//         },
//         notes: {
//           student_id: student_id,
//           receipt_number: receipt_number,
//         },
//         theme: { color: "#5E35B1" },
//       };

//       const rzp = new window.Razorpay(options);
//       rzp.open();
//     } catch (error) {
//       console.log(
//         " PAYMENT INITIATION ERROR:",
//         error.response?.data || error.message
//       );
//       setPaymentStatus("Payment failed. Please try again.");
//     }
//   };

//   const onSubmit = async (data) => {
//     if (selectedFeeIds.length === 0) {
//       alert("Please select at least one fee to pay");
//       return;
//     }

//     const paymentMode = data.payment_mode.toLowerCase();
//     const schoolYearId = selectedSchYear;
//     const paidAmount = parseFloat(data.paid_amount) || 0;

//     if (!selectedStudent || !studentYearId) {
//       alert("Please select a student.");
//       return;
//     }

//     // Build a list of all selected fees with due amounts
//     const selectedFeeObjects = [];
//     availableFees.forEach((monthData) => {
//       const monthId = monthData.month_id;

//       monthData.fees.forEach((fee) => {
//         const rowKey = `${monthData.month}-${fee.fee_id}`;

//         if (selectedFeeIds.includes(rowKey)) {
//           const original = parseFloat(fee.original_amount) || 0;
//           const paid = parseFloat(fee.paid_amount) || 0;
//           const due = Math.max(original - paid, 0);

//           selectedFeeObjects.push({
//             fee_structure_id: fee.fee_structure_id || fee.fee_id, // fallback fixed
//             month: monthId,
//             due_amount: due,
//           });
//         }
//       });
//     });

//     // Sort fees by highest due amount
//     selectedFeeObjects.sort((a, b) => b.due_amount - a.due_amount);

//     // Distribute paid amount across selected fees
//     let remainingAmount = paidAmount;
//     const distributedFees = [];

//     selectedFeeObjects.forEach((feeObj) => {
//       const amountToPay = Math.min(remainingAmount, feeObj.due_amount);
//       remainingAmount -= amountToPay;

//       distributedFees.push({
//         fee_type_id: feeObj.fee_structure_id,
//         month: feeObj.month,
//         amount: parseFloat(amountToPay.toFixed(2)),
//       });
//     });

//     if (remainingAmount > 0) {
//       console.log(
//         "Remaining amount after distributing to fees:",
//         remainingAmount
//       );
//     }

//     // Prepare payload with distributed fees
//     const payload = {
//       student_year_id: studentYearId,
//       school_year_id: schoolYearId,
//       payment_method: paymentMode,
//       // due_date: new Date().toISOString().split("T")[0],
//       paid_amount: paidAmount,
//       fees: distributedFees,
//     };

//     try {
//       // Submit payment request
    

//       if (paymentMode === "online") {
//           const submitResInitial = await axiosInstance.post(
//         `${BASE_URL}/d/studentfees/initiate_payment/`,
//         payload
//       );
//         const { razorpay_order_id, amount, currency, receipt } = submitResInitial.data;

//         const options = {
//           key: "rzp_test_4h2aRSAPbYw3f8",
//           amount: paidAmount * 100,
//           currency: "INR",
//           name: "School Fee Payment",
//           description: `Receipt: ${receipt}`,
//           order_id: razorpay_order_id,
//           handler: async function (response) {
//             const verifyPayload = {
//               student_year_id: studentYearId,
//               selected_fees: distributedFees,
//               paid_amount: paidAmount,
//               payment_mode: paymentMode,
//               received_by: 2, // adjust as needed
//               razorpay_order_id: response.razorpay_order_id,
//               razorpay_payment_id: response.razorpay_payment_id,
//               razorpay_signature: response.razorpay_signature,
//             };

//             const confirmRes = await axiosInstance.post(
//               `${BASE_URL}/d/studentfees/confirm_payment/`,
//               verifyPayload
//             );

//             setPaymentStatus(confirmRes.data);
//             setShowPaymentDialog(true);
//           },
//           prefill: {
//             name: selectedStudent?.student_name || "",
//             email: selectedStudent?.email || "",
//           },
//           theme: { color: "#5E35B1" },
//         };

//         const rzp = new window.Razorpay(options);
//         rzp.open();
//       } else {
//         const submitRes = await axiosInstance.post(
//         `${BASE_URL}/d/studentfees/submit_fee/`,
//         payload
//       );
//         setPaymentStatus(submitRes.data);
//         setShowPaymentDialog1(true);
//       }
//     } catch (err) {
//       console.error("Payment failed", err);
//       setPaymentStatus("Payment failed. Please try again.");
//     }
//   };

//   const calculateTotalAmount = () => {
//     let baseAmount = 0;
//     let paidAmount = 0;
//     let dueAmount = 0;

//     availableFees.forEach((monthData) => {
//       monthData.fees.forEach((fee) => {
//         const rowKey = `${monthData.month}-${fee.fee_id}`;
//         if (selectedFeeIds.includes(rowKey)) {
//           const original = parseFloat(fee.original_amount) || 0;
//           const paid = parseFloat(fee.paid_amount) || 0;
//           baseAmount += original;
//           paidAmount += paid;
//           dueAmount += Math.max(original - paid, 0);
//         }
//       });
//     });

//     return {
//       baseAmount,
//       paidAmount,
//       dueAmount,
//       totalAmount: dueAmount,
//     };
//   };

//   const totalAmount = calculateTotalAmount();

//   const handleFeeSelection = (feeId, isSelected) => {
//     if (isSelected) setSelectedFeeIds((prev) => [...prev, feeId]);
//     else setSelectedFeeIds((prev) => prev.filter((id) => id !== feeId));
//   };

//   // Keep paid_amount synced to total selected due
//   useEffect(() => {
//     const totals = calculateTotalAmount();
//     setValue("paid_amount", totals.totalAmount.toFixed(2), {
//       shouldValidate: true,
//       shouldDirty: true,
//     });
//   }, [selectedFeeIds, availableFees, setValue]);

//   const stuId = window.localStorage.getItem("student_id");
//   const stuYearlvlName = localStorage.getItem("stu_year_level_name");
//   const stuYearlvlId = localStorage.getItem("stu_year_level_id");

//   const handleRetry = () => {
//     if (studentYearId) {
//       fetchAvailableFees(studentYearId);
//     }
//   };

//   // Filter students by name or scholar number
//   const filteredStudents = students
//     ?.filter((student) =>
//       `${student?.student_name || ""} ${student?.scholar_number || ""}`
//         .toLowerCase()
//         .includes(searchStudentInput.trim().toLowerCase())
//     )
//     .sort((a, b) => a.student_name.localeCompare(b.student_name));

//   const dropdownRef = useRef(null);

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//         setShowStudentDropdown(false);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);

//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);

//   const handleMonthSelection = (monthData, isChecked) => {
//     const updatedSelectedFeeIds = [...selectedFeeIds];

//     monthData.fees.forEach((fee) => {
//       const rowKey = `${monthData.month}-${fee.fee_id}`;
//       const isSelectable = fee.status !== "Paid";

//       if (isSelectable) {
//         const index = updatedSelectedFeeIds.indexOf(rowKey);

//         if (isChecked && index === -1) {
//           updatedSelectedFeeIds.push(rowKey);
//         } else if (!isChecked && index !== -1) {
//           updatedSelectedFeeIds.splice(index, 1);
//         }
//       }
//     });

//     setSelectedFeeIds(updatedSelectedFeeIds);
//   };

//   // Gate for disabling bottom inputs and button until payment mode selected
//   const isPaymentModeSelected = !!selectedPaymentMode;
//   const isSubmitDisabled =
//     isSubmitting || selectedFeeIds.length === 0 || !isPaymentModeSelected;

//   if (isLoading && !apiError) {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-screen">
//         <div className="flex space-x-2">
//           <div className="w-3 h-3 bgTheme rounded-full animate-bounce"></div>
//           <div className="w-3 h-3 bgTheme rounded-full animate-bounce [animation-delay:-0.2s]"></div>
//           <div className="w-3 h-3 bgTheme rounded-full animate-bounce [animation-delay:-0.4s]"></div>
//         </div>
//         <p className="mt-2 text-gray-500 text-sm">Loading data...</p>
//       </div>
//     );
//   }

//   if (isLoadingFees && !apiError) {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-screen">
//         <div className="flex space-x-2">
//           <div className="w-3 h-3 bgTheme rounded-full animate-bounce"></div>
//           <div className="w-3 h-3 bgTheme rounded-full animate-bounce [animation-delay:-0.2s]"></div>
//           <div className="w-3 h-3 bgTheme rounded-full animate-bounce [animation-delay:-0.4s]"></div>
//         </div>
//         <p className="mt-2 text-gray-500 text-sm">Loading data...</p>
//       </div>
//     );
//   }

//   if (apiError) {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-screen text-center p-6">
//         <i className="fa-solid fa-triangle-exclamation text-5xl text-red-400 mb-4"></i>
//         <p className="text-lg text-red-400 font-medium">Failed to load data, Try Again</p>
//         <button className="bg-red-400 btn text-white" onClick={handleRetry}>
//           retry
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="mb-24 md:mb-10">
//       <div className="min-h-screen p-5 bg-gray-50 dark:bg-gray-900">
//         <form
//           className="w-full max-w-7xl mx-auto p-6 bg-base-100 rounded-box my-5 shadow-sm focus:outline-none"
//           onSubmit={handleSubmit(onSubmit)}
//         >
//           <h1 className="text-3xl font-bold text-center mb-8">
//             Fee Payment
//             <i className="fa-solid fa-money-bill-wave ml-2"></i>
//           </h1>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
//             {/* School Year */}
//             <div className="form-control">
//               <label className="label">
//                 <span className="label-text flex items-center gap-1">
//                   <i className="fa-solid fa-school text-sm"></i>
//                   School Year <span className="text-error">*</span>
//                 </span>
//               </label>
//               <select
//                 className="select select-bordered w-full focus:outline-none"
//                 onChange={(e) => setselectedSchYear(e.target.value)}
//                 value={selectedSchYear || ""}
//               >
//                 <option value="">Select Year</option>
//                 {schoolYear?.map((year) => (
//                   <option key={year.id} value={year.id}>
//                     {year.year_name}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* Class Selection */}
//             <div className="form-control">
//               <label className="label">
//                 <span className="label-text flex items-center gap-1">
//                   <i className="fa-solid fa-school text-sm"></i>
//                   Class <span className="text-error">*</span>
//                 </span>
//               </label>
//               <select
//                 className="select select-bordered w-full focus:outline-none"
//                 onChange={handleClassChange}
//                 value={selectedClassId || ""}
//               >
//                 <option value="">Select Class</option>
//                 {UserRole === "director"
//                   ? classes?.map((classItem) => (
//                       <option key={classItem.id} value={classItem.id}>
//                         {classItem.level_name}
//                       </option>
//                     ))
//                   : UserRole === "office staff"
//                   ? classes?.map((classItem) => (
//                       <option key={classItem.id} value={classItem.id}>
//                         {classItem.level_name}
//                       </option>
//                     ))
//                   : UserRole === "guardian"
//                   ? classes?.map((classItem) => (
//                       <option key={classItem.id} value={classItem.id}>
//                         {classItem.level_name}
//                       </option>
//                     ))
//                   : null}
//                 {UserRole === "student" && (
//                   <option key={stuYearlvlId} value={stuYearlvlId}>
//                     {stuYearlvlName}
//                   </option>
//                 )}
//               </select>
//             </div>

//             {/* Student Selection */}
//             <div className="form-control relative" ref={dropdownRef}>
//               <label className="label">
//                 <span className="label-text flex items-center gap-1 text-gray-700 dark:text-gray-300">
//                   <i className="fa-solid fa-user-graduate text-sm"></i>
//                   Student <span className="text-error">*</span>
//                 </span>
//               </label>

//               <div
//                 className={`input input-bordered w-full flex items-center justify-between cursor-pointer ${
//                   !selectedClassId ? "cursor-not-allowed opacity-70" : ""
//                 }`}
//                 disabled={!selectedClassId}
//                 onClick={() => {
//                   if (selectedClassId) setShowStudentDropdown(!showStudentDropdown);
              
//                 }}
//               >
//                 {selectedStudentName || "Select Student"}
//                 <div>
//                   <span className="arrow">&#9662;</span>
//                 </div>
//               </div>

//               {/* Hidden input for form submission */}
//               <input
//                 type="hidden"
//                 {...register("student_id", {
//                   required: "Student selection is required",
//                 })}
//                 value={watch("student_id") || ""}
//                 readOnly
//               />

//               {/* Dropdown with search and list */}
//               {showStudentDropdown && selectedClassId && (
//                 <div className="absolute z-10 bg-white text-gray-700 dark:bg-[#191b1b] dark:text-amber-50 rounded w-full mt-1 shadow-lg">
//                   {/* Search input */}
//                   <div className="p-2 sticky top-0 dark:bg-[#1c1f1f] shadow-sm bg-base-100">
//                     <input
//                       type="text"
//                       placeholder="Search Student by Name or Scholar No..."
//                       className="input input-bordered w-full focus:outline-none"
//                       value={searchStudentInput}
//                       onChange={(e) => setSearchStudentInput(e.target.value)}
//                       autoComplete="off"
//                     />
//                   </div>

//                   {/* Student results */}
//                   <div className="max-h-40 overflow-y-auto">
//                     {isLoading ? (
//                       <p className="p-2">Loading students...</p>
//                     ) : filteredStudents?.length > 0 ? (
//                       filteredStudents.map((stu) => (
//                         <p
//                           key={stu.student_id}
//                           className="p-2 hover:bg-base-200 cursor-pointer"
//                           onClick={() => {
//                             const displayName = `${stu.student_name} - ${stu.scholar_number} (Scholar No)`;
//                             setSelectedStudentName(displayName);
//                             setSearchStudentInput("");
//                             setShowStudentDropdown(false);
//                             setValue("student_id", stu.student_id, { shouldValidate: true });
//                             clearErrors("student_id");
//                             setSelectedStudent(stu);
//                             setStudentYearId(stu.id); // set student_year_id
//                             setSelectedFeeIds([]);
//                           }}
//                         >
//                           {stu.student_name} - {stu.scholar_number} (Scholar No)
//                         </p>
//                       ))
//                     ) : (
//                       <p className="p-2">No students found.</p>
//                     )}
//                   </div>
//                 </div>
//               )}

//               {/* Error message */}
//               {errors.student_id && (
//                 <p className="text-error text-sm mt-1">{errors.student_id.message}</p>
//               )}
//             </div>

//             {/* Payment Mode Selection */}
//             <div className="form-control">
//               <label className="label">
//                 <span className="label-text flex items-center gap-2">
//                   <i className="fa-solid fa-credit-card text-sm"></i>
//                   Payment Mode <span className="text-error">*</span>
//                 </span>
//               </label>
//               <select
//                 className={`select w-full focus:outline-none ${
//                   errors.payment_mode ? "select-error" : "select-bordered"
//                 }`}
//                 {...register("payment_mode", {
//                   required: "Payment mode is required",
//                 })}
//                 disabled={!selectedStudentId}
//               >
//                 <option value="">Select Payment Mode</option>
//                 {paymentModes.map((mode) => (
//                   <option key={mode} value={mode}>
//                     {mode}
//                   </option>
//                 ))}
//               </select>
//               {errors.payment_mode && (
//                 <label className="label">
//                   <span className="label-text-alt text-error">
//                     {errors.payment_mode.message}
//                   </span>
//                 </label>
//               )}
//             </div>
//           </div>

//           {/* Available Fees Display */}
//           {availableFees.length > 0 && selectedStudent && (
//             <div className="mt-8">
//               <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-gray-100">
//                 Fee Details for {selectedStudent.student_name}
//               </h2>

//               {/* Fee Table */}
//               <div className="overflow-x-auto">
//                 <div className="max-h-[500px] overflow-y-auto rounded-lg border">
//                   <table className="table w-full">
//                     <thead className="sticky top-0 bg-base-200 z-3">
//                       <tr>
//                         <th>Month</th>
//                         <th>Fee Type</th>
//                         <th>Original Amount</th>
//                         <th>Paid</th>
//                         <th>Due</th>
//                         <th>Status</th>
//                         <th>Select</th>
//                       </tr>
//                     </thead>

//                     <tbody>
//                       {Array.isArray(availableFees) &&
//                         availableFees.map((monthData) =>
//                           monthData.fees.map((fee, index) => {
//                             const rowKey = `${monthData.month}-${fee.fee_id}`;
//                             const isSelectable = fee.status !== "Paid";
//                             const isChecked = selectedFeeIds.includes(rowKey);

//                             const original = parseFloat(fee.original_amount) || 0;
//                             const paid = parseFloat(fee.paid_amount) || 0;
//                             const due = Math.max(original - paid, 0);

//                             return (
//                               <tr key={rowKey} className="hover">
//                                 {/* Month Column */}
//                                 {index === 0 && (
//                                   <td
//                                     rowSpan={monthData.fees.length}
//                                     className="font-semibold bg-base-100 align-top px-4 py-2"
//                                   >
//                                     <div className="flex items-center gap-2">
//                                       <span>{monthData.month}</span>
//                                       <input
//                                         type="checkbox"
//                                         className="checkbox checkbox-sm checkbox-primary"
//                                         checked={monthData.fees
//                                           .filter((f) => f.status !== "Paid")
//                                           .every((f) =>
//                                             selectedFeeIds.includes(`${monthData.month}-${f.fee_id}`)
//                                           )}
//                                         onChange={(e) =>
//                                           handleMonthSelection(monthData, e.target.checked)
//                                         }
//                                       />
//                                     </div>
//                                   </td>
//                                 )}

//                                 {/* Fee Type */}
//                                 <td>{fee.fee_type}</td>

//                                 {/* Amounts */}
//                                 <td>₹{original.toFixed(2)}</td>
//                                 <td>₹{paid.toFixed(2)}</td>
//                                 <td className={due > 0 ? "text-warning" : ""}>
//                                   ₹{due.toFixed(2)}
//                                 </td>

//                                 {/* Status */}
//                                 <td>
//                                   {fee.status === "Paid" ? (
//                                     <span className="badge badge-success text-gray-900 dark:text-white">
//                                       Paid
//                                     </span>
//                                   ) : fee.status === "Partial" ? (
//                                     <span className="badge badge-warning text-gray-900 dark:text-white">
//                                       Partial
//                                     </span>
//                                   ) : (
//                                     <span className="badge badge-error text-gray-900 dark:text-white">
//                                       Pending
//                                     </span>
//                                   )}
//                                 </td>

//                                 {/* Select */}
//                                 <td>
//                                   {isSelectable ? (
//                                     <input
//                                       type="checkbox"
//                                       className="checkbox checkbox-primary"
//                                       checked={isChecked}
//                                       onChange={(e) =>
//                                         handleFeeSelection(rowKey, e.target.checked)
//                                       }
//                                     />
//                                   ) : (
//                                     <i className="fa-solid fa-check text-success"></i>
//                                   )}
//                                 </td>
//                               </tr>
//                             );
//                           })
//                         )}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>

//               {/* Payment Summary */}
//               {selectedFeeIds.length > 0 && (
//                 <div className="bg-base-300 p-4 rounded-lg mt-6">
//                   <h3 className="text-lg font-semibold mb-2">Payment Summary</h3>

//                   <div className="grid grid-cols-2 gap-2">
//                     {parseFloat(totalAmount.baseAmount) > 0 && (
//                       <>
//                         <div>Base Amount:</div>
//                         <div className="text-right">
//                           ₹{parseFloat(totalAmount.baseAmount).toFixed(2)}
//                         </div>
//                       </>
//                     )}

//                     {parseFloat(totalAmount.paidAmount) > 0 && (
//                       <>
//                         <div>Already Paid:</div>
//                         <div className="text-right">
//                           ₹{parseFloat(totalAmount.paidAmount).toFixed(2)}
//                         </div>
//                       </>
//                     )}

//                     {parseFloat(totalAmount.dueAmount) > 0 && (
//                       <>
//                         <div>Due Amount:</div>
//                         <div className="text-right">
//                           ₹{parseFloat(totalAmount.dueAmount).toFixed(2)}
//                         </div>
//                       </>
//                     )}

//                     <div className="font-bold mt-2 border-t pt-2">Total Payable Now:</div>
//                     <div className="text-right font-bold mt-2 border-t pt-2">
//                       ₹{parseFloat(totalAmount.totalAmount).toFixed(2)}
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}

//           {/* No Fees Message */}
//           {!isLoadingFees &&
//             availableFees.length === 0 &&
//             selectedStudentId && (
//               <div className="text-center mt-8 text-gray-500">
//                 No fees found for the selected student and year.
//               </div>
//             )}

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
//             {/* Paid Amount */}
//             <div className="form-control">
//               <label className="label">
//                 <span className="label-text flex items-center gap-2">
//                   <i className="fa-solid fa-calculator text-sm"></i>
//                   Paid Amount <span className="text-error">*</span>
//                 </span>
//               </label>
//               <input
//                 type="number"
//                 className={`input w-full focus:outline-none ${
//                   errors.paid_amount ? "input-error" : "input-bordered"
//                 }`}
//                 {...register("paid_amount", {
//                   required: "Amount is required",
//                   min: { value: 0, message: "Amount must be positive" },
//                   max: {
//                     value: totalAmount.totalAmount,
//                     message: `Amount cannot exceed ₹${totalAmount.totalAmount.toFixed(
//                       2
//                     )}`,
//                   },
//                 })}
//                 value={watch("paid_amount")}
//                 disabled={selectedFeeIds.length === 0 || !isPaymentModeSelected}
//                 onChange={(e) => {
//                   const value = parseFloat(e.target.value);
//                   if (value > totalAmount.totalAmount) {
//                     setValue("paid_amount", totalAmount.totalAmount.toFixed(2));
//                   } else {
//                     setValue("paid_amount", e.target.value);
//                   }
//                 }}
//                 step="1"
//                 max={totalAmount.totalAmount}
//               />

//               {errors.paid_amount && (
//                 <label className="label">
//                   <span className="label-text-alt text-error">
//                     {errors.paid_amount.message}
//                   </span>
//                 </label>
//               )}
//             </div>

//             {/* Remarks */}
//             <div className="form-control">
//               <label className="label">
//                 <span className="label-text flex items-center gap-2">
//                   <i className="fa-solid fa-comment text-sm"></i>
//                   Remarks <span className="text-error">*</span>
//                 </span>
//               </label>
//               <input
//                 type="text"
//                 maxLength={25}
//                 className={`input w-full focus:outline-none ${
//                   errors.remarks ? "input-error" : "input-bordered"
//                 }`}
//                 {...register("remarks", {
//                   required: "Remarks are required",
//                   minLength: {
//                     value: 3,
//                     message: "Remarks must be at least 3 characters long",
//                   },
//                   maxLength: {
//                     value: 25,
//                     message: "Remarks cannot exceed 25 characters",
//                   },
//                 })}
//                 placeholder="Enter any remarks"
//                 disabled={selectedFeeIds.length === 0 || !isPaymentModeSelected}
//               />
//               {errors.remarks && (
//                 <label className="label">
//                   <span className="label-text-alt text-sm text-error">
//                     {errors.remarks.message}
//                   </span>
//                 </label>
//               )}
//             </div>
//           </div>

//           {/* Submit Button */}
//           <div className="flex justify-center mt-10">
//             <button
//               type="submit"
//               className={`btn bgTheme text-white w-52 ${
//                 isSubmitDisabled ? "opacity-50 cursor-not-allowed" : "hover:bg-purple-700"
//               }`}
//               disabled={isSubmitDisabled}
//             >
//               {isSubmitting ? (
//                 <i className="fa-solid fa-spinner fa-spin mr-2"></i>
//               ) : (
//                 <i className="fa-solid fa-money-bill-wave ml-2"></i>
//               )}
//               {isSubmitting ? "Processing..." : "Submit Payment"}
//             </button>
//           </div>
//         </form>

//         {/* Payment Status Dialogs */}
//         {showPaymentDialog && paymentStatus && (
//           <PaymentStatusDialog
//             paymentStatus={paymentStatus}
//             onClose={() => {
//               setShowPaymentDialog(false);
//               setPaymentStatus(null);
//               window.location.reload();
//             }}
//           />
//         )}

//         {showPaymentDialog1 && paymentStatus && (
//           <PaymentStatusDialogOffline
//             paymentStatus={paymentStatus}
//             onClose={() => {
//               setShowPaymentDialog1(false);
//               setPaymentStatus(null);
//               window.location.reload();
//             }}
//           />
//         )}
//       </div>
//     </div>
//   );
// };








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
      remarks: "",
      received_by: "",
    },
  });

  const selectedStudentId = watch("student_id");

  const cashAmount = parseFloat(watch("cash_amount")) || 0;
  const onlineAmount = parseFloat(watch("online_amount")) || 0;
  const chequeAmount = parseFloat(watch("cheque_amount")) || 0;

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
      // Reset cycle penalties when fees change
      // setCyclePenalties({});
    } catch (error) {
      console.error("Error fetching fees:", error);
      setApiError("Failed to load fees");
      setAvailableFees({ annual_fees: [], monthly_fees_by_cycle: {} });
    } finally {
      setIsLoadingFees(false);
    }
  };

  // Fetch students for selected class
  const getStudents = async (classId) => {
    try {
      setIsLoading(true);
      setApiError("");
      const Students = await fetchStudents1(classId);
      setStudents(Students);
    } catch (err) {
      console.log(err);
      setApiError("Failed to load students");
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
      remarks: "",
      received_by: "",
    });
    setSelectedFeeIds([]);
    setSelectedStudent(null);
    setStudentYearId(null);
    setAvailableFees({ annual_fees: [], monthly_fees_by_cycle: {} });
    setApiError("");
    setSelectedStudentName("");
    setCyclePenalties({});
  };

  useEffect(() => {
    if (selectedClassId) {
      getStudents(selectedClassId);
      setSelectedStudent(null);
      setSelectedStudentName("");
    } else {
      setStudents([]);
    }
  }, [selectedClassId]);

  useEffect(() => {
    if (selectedStudentId) {
      const student = students.find(
        (s) => s.student_id === parseInt(selectedStudentId)
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

  // ✅ Calculate total amounts – NO ROUNDING, use raw Number values
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

    // Sum all cycle penalties from state
    const totalPenalty = Object.values(cyclePenalties).reduce((sum, val) => sum + (Number(val) || 0), 0);
    const totalPayable = dueAmount + totalPenalty;
    return { baseAmount, paidAmount, dueAmount, penalty: totalPenalty, totalPayable };
  };

  const totalAmount = calculateTotalAmount();
  const totalPaid = cashAmount + onlineAmount + chequeAmount;

  // ===================================================================
  //  onSubmit – fully corrected
  // ===================================================================
  const onSubmit = async (data) => {
    if (selectedFeeIds.length === 0) {
      alert("Please select at least one fee to pay");
      return;
    }

    if (!selectedStudent || !studentYearId) {
      alert("Please select a student.");
      return;
    }

    // ---------- Build flat selected fees ----------
    const flatSelectedFees = [];

    // Annual – include only if due > 0
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

    // Monthly – include if due > 0 OR (due === 0 AND penalty > 0)
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

    // ---------- Distribute penalties per cycle ----------
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

    // Annual – no penalty
    annualFees.forEach((fee) => {
      flatSelectedFeesFull.push({
        ...fee,
        penaltyPortion: 0,
        fullAmount: fee.due,
      });
    });

    // Monthly cycles – distribute penalty
    Object.keys(monthlyFeesByCycle).forEach((cycleKey) => {
      const feesInCycle = monthlyFeesByCycle[cycleKey];
      const totalDueCycle = feesInCycle.reduce((sum, f) => sum + f.due, 0);
      const cyclePenalty = Number(cyclePenalties[cycleKey]) || 0;

      // Special case: all due = 0 but penalty > 0
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

      // Normal proportional distribution
      let remainingPenalty = cyclePenalty;
      feesInCycle.forEach((fee, index) => {
        let penaltyPortion = 0;
        if (totalDueCycle > 0) {
          const raw = (fee.due / totalDueCycle) * cyclePenalty;
          penaltyPortion = Math.round(raw * 100) / 100;
          if (index === feesInCycle.length - 1) {
            // give remaining to last to avoid rounding errors
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

    // ---------- Build `fees` for submit ----------
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
        amount: group.totalDue,               // ✅ only due (may be 0)
        penalty_amount: group.totalPenalty,   // ✅ penalty separately
      };
      if (!group.isAnnual && group.months.length > 0) {
        feeObj.months = group.months;
      }
      return feeObj;
    });

    // ---------- Payment methods ----------
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

      // ---------- ONLINE FLOW (Razorpay) ----------
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
        // ---------- OFFLINE ONLY (Cash / Cheque) ----------
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
    .sort((a, b) => a.student_name.localeCompare(b.student_name));

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

  // Check if we have any fees to display
  const hasAnnualFees = availableFees.annual_fees && availableFees.annual_fees.length > 0;
  const hasMonthlyFees = availableFees.monthly_fees_by_cycle &&
    Object.keys(availableFees.monthly_fees_by_cycle).length > 0;
  const hasAnyFees = hasAnnualFees || hasMonthlyFees;

  // Loading states
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

  // Render
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
                className={`input input-bordered w-full flex items-center justify-between cursor-pointer ${!selectedClassId ? "cursor-not-allowed opacity-70" : ""
                  }`}
                disabled={!selectedClassId}
                onClick={() => {
                  if (selectedClassId)
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

              {showStudentDropdown && selectedClassId && (
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
                      filteredStudents.map((stu) => (
                        <p
                          key={stu.student_id}
                          className="p-2 hover:bg-base-200 cursor-pointer"
                          onClick={() => {
                            const displayName = `${stu.student_name} - ${stu.scholar_number} (Scholar No)`;
                            setSelectedStudentName(displayName);
                            setSearchStudentInput("");
                            setShowStudentDropdown(false);
                            setValue("student_id", stu.student_id, {
                              shouldValidate: true,
                            });
                            clearErrors("student_id");
                            setSelectedStudent(stu);
                            setStudentYearId(stu.id);
                            setSelectedFeeIds([]);
                            setCyclePenalties({});
                          }}
                        >
                          {stu.student_name} - {stu.scholar_number} (Scholar No)
                        </p>
                      ))
                    ) : (
                      <p className="p-2">No students found.</p>
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
                              {/* <input
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
                              /> */}
<input
  type="number"
  min="0"
  step="any"
  className="input input-bordered input-sm w-28 border-red-400 ..."
  defaultValue={cyclePenalties[cycleKey] ?? ''}
  onChange={(e) => {
    const val = parseFloat(e.target.value) || 0;
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

                  <div className="form-control mt-4">
                    <label className="label">
                      <span className="label-text flex items-center gap-2">
                        <i className="fa-solid fa-comment text-sm"></i>
                        Remarks <span className="text-error">*</span>
                      </span>
                    </label>
                    <input
                      type="text"
                      maxLength={25}
                      className={`input w-full focus:outline-none ${errors.remarks ? "input-error" : "input-bordered"
                        }`}
                      {...register("remarks", {
                        required: "Remarks are required",
                        minLength: {
                          value: 3,
                          message: "Remarks must be at least 3 characters long",
                        },
                        maxLength: {
                          value: 25,
                          message: "Remarks cannot exceed 25 characters",
                        },
                      })}
                      placeholder="Enter any remarks"
                    />
                    {errors.remarks && (
                      <label className="label">
                        <span className="label-text-alt text-sm text-error">
                          {errors.remarks.message}
                        </span>
                      </label>
                    )}
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