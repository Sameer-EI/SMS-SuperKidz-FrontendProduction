import React, { useContext, useEffect, useRef, useState } from "react";
import { SuccessModal } from "../../Modals/SuccessModal";
import { useForm } from "react-hook-form";
import { AuthContext } from "../../../context/AuthContext";
import { fetchSchoolYear } from "../../../services/api/Api";
import { constants } from "../../../global/constants";
import { allRouterLink } from "../../../router/AllRouterLinks";
import { useNavigate } from "react-router-dom";

export const CreateExpenses = () => {
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState([]);
  const [apiError, setApiError] = useState("");
  const [error, setError] = useState("");
  const [schoolYear, setSchoolYear] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const modalRef = useRef();

  const { axiosInstance } = useContext(AuthContext);
  const navigate = useNavigate();
  const paymentModes = ["Cash", "Cheque", "Online"];

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const getExpenseCategory = async () => {
    try {
      setError("");
      const response = await axiosInstance.get("/d/Expense-Category/");
      const sortedCategory = (response.data || []).sort((a, b) =>
        a.name.localeCompare(b.name, "en", { sensitivity: "base" })
      );
      setCategory(sortedCategory);
    } catch (err) {
      console.error("Cannot get the category:", err);
      setError("Failed to load categories. Please try again later.");
      setModalMessage("Failed to load categories. Please try again later.");
      setShowModal(true);
    }
  };

  const getSchoolYearLevel = async () => {
    try {
      const response = await fetchSchoolYear();
      setSchoolYear(response);
    } catch (error) {
      setError(error);
      setModalMessage("Failed to load School Year Level.");
      setShowModal(true);
    }
  };

  useEffect(() => {
    getSchoolYearLevel();
    getExpenseCategory();
  }, []);

  const onSubmit = async (data) => {
    if (fileError) return; // prevent submit if invalid file

    try {
      setLoading(true);
      setApiError("");

      const formData = new FormData();
      Object.keys(data).forEach((key) => {
        if (key !== "attachment") formData.append(key, data[key]);
      });

      if (selectedFile) formData.append("attachment", selectedFile);

      if (data.payment_method) {
        formData.set("payment_method", data.payment_method.toLowerCase());
      }

      if (data.payment_method.toLowerCase() === "online") {
        const orderResponse = await axiosInstance.post(
          `/d/School-Expense/initiate-expense-payment/`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        const {
          id: order_id,
          amount,
          currency,
          expense_id,
          razorpay_key,
          razorpay_order_id,
        } = orderResponse.data;

        const options = {
          key: razorpay_key,
          amount: amount * 100,
          currency,
          name: "School Expense",
          description: data.description,
          order_id: razorpay_order_id,
          handler: async function (response) {
            await axiosInstance.post(
              `/d/School-Expense/confirm-expense-payment/`,
              {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                expense_id: expense_id,
              }
            );
            modalRef.current?.show();
          },
          prefill: {
            name: data.name || "Test User",
            email: data.email || "test@example.com",
            contact: data.contact || "9876543210",
          },
          theme: { color: constants.bgTheme },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        const response = await axiosInstance.post(
          `/d/School-Expense/`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        if (response.status === 200 || response.status === 201) modalRef.current?.show();
      }
    } catch (error) {
      if (error.response?.data) {
        const errors = error.response.data;
        if (errors.non_field_errors) {
          setApiError(errors.non_field_errors.join(" "));
          setModalMessage(errors.non_field_errors.join(" "));
          setShowModal(true);
        } else {
          const fieldErrors = Object.entries(errors)
            .map(([field, messages]) => `${field}: ${messages.join(", ")}`)
            .join(" | ");
          setApiError(fieldErrors);
          setModalMessage(fieldErrors);
          setShowModal(true);
        }
      } else {
        setModalMessage("An unexpected error occurred..");
        setShowModal(true);
        setApiError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNavigation = () => navigate(`${allRouterLink.viewAllExpenses}`);

  return (
    <div className="min-h-screen p-5 bg-gray-50 dark:bg-gray-900 mb-24 md:mb-10">
      <div className="w-full max-w-7xl mx-auto p-6 bg-base-100 dark:bg-gray-800 dark:text-white rounded-box my-5 shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-8">
          Create Expense <i className="fa-solid fa-receipt ml-2"></i>
        </h1>

        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* School Year */}
            <div className="form-control">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <i className="fa-solid fa-calendar-days text-sm"></i>
                School Year <span className="text-error">*</span>
              </label>
              <select
                disabled={loading}
                className="select select-bordered w-full focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                {...register("school_year", { required: "School Year is required" })}
              >
                <option value="">Select School Year</option>
                {schoolYear
                  ?.filter((year) => {
                    const today = new Date();
                    const start = new Date(year.start_date);
                    const end = new Date(year.end_date);
                    return today >= start && today <= end;
                  })
                  .map((year) => (
                    <option key={year.id} value={year.id}>
                      {year.year_name}
                    </option>
                  ))}
              </select>

              {errors.school_year && (
                <p className="text-error text-sm mt-1">
                  {errors.school_year.message}
                </p>
              )}
            </div>
            {/* Category */}
            <div className="form-control">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <i className="fa-solid fa-tags text-sm"></i>
                Category <span className="text-error">*</span>
              </label>
              <select
                disabled={loading}
                className="select select-bordered w-full focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white capitalize"
                {...register("category", { required: "Category is required" })}
              >
                <option value="">Select Category</option>
                {category?.map((cat) => cat && (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              {errors.category && <p className="text-error text-sm mt-1">{errors.category.message}</p>}
            </div>

            {/* Amount */}
            <div className="form-control">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <i className="fa-solid fa-money-bill-wave text-sm"></i>
                Amount <span className="text-error">*</span>
              </label>
              <input
                disabled={loading}
                type="number"
                min={0}
                placeholder="Enter Amount e.g: 15000"
                className="input input-bordered w-full focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                {...register("amount", { required: "Amount is required", min: { value: 0, message: "Amount must be positive" } })}
              />
              {errors.amount && <p className="text-error text-sm mt-1">{errors.amount.message}</p>}
            </div>

            {/* Attachments */}
            <div className="form-control">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <i className="fa-solid fa-paperclip text-sm"></i> Attachments
              </label>

              {!selectedFile ? (
                <input
                  disabled={loading}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="file-input file-input-bordered w-full focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const allowedTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
                      if (!allowedTypes.includes(file.type)) {
                        setFileError("Only PDF or image files are allowed");
                        setSelectedFile(null);
                      } else {
                        setFileError("");
                        setSelectedFile(file);
                      }
                    } else {
                      setFileError("");
                      setSelectedFile(null);
                    }
                  }}
                />
              ) : (
                <div className="file-input file-input-bordered w-full flex items-center justify-between dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <span className="text-sm truncate px-3">{selectedFile.name}</span>
                  <button
                    disabled={loading}
                    type="button"
                    onClick={() => { setSelectedFile(null); setFileError(""); }}
                    className="btn btn-xs text-red-700 bg-red-50 hover:bg-red-100 border border-red-300 rounded-md dark:bg-red-200"
                  >
                    Remove
                  </button>
                </div>
              )}
              {fileError && <p className="text-error text-sm mt-1">{fileError}</p>}
            </div>

            {/* Expense Date */}
            <div className="form-control">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <i className="fa-solid fa-calendar-day text-sm"></i>
                Expense Date <span className="text-error">*</span>
              </label>
              <input
                disabled={loading}
                type="date"
                className="input input-bordered w-full focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                max={new Date().toISOString().split("T")[0]}
                {...register("expense_date", { required: "Expense Date is required" })}
              />
              {errors.expense_date && <p className="text-error text-sm mt-1">{errors.expense_date.message}</p>}
            </div>

            {/* Payment Method */}
            <div className="form-control">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <i className="fa-solid fa-credit-card text-sm"></i>
                Payment Method <span className="text-error">*</span>
              </label>
              <select
                disabled={loading}
                className="select select-bordered w-full focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                {...register("payment_method", { required: "Payment method is required" })}
              >
                <option value="">Select Payment Mode</option>
                {paymentModes.map((mode, idx) => (
                  <option key={idx} value={mode}>{mode}</option>
                ))}
              </select>
              {errors.payment_method && <p className="text-error text-sm mt-1">{errors.payment_method.message}</p>}
            </div>
          </div>

          {/* Description */}
          <div className="grid grid-cols-1 gap-6">
            <div className="form-control">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <i className="fa-solid fa-align-left text-sm"></i>
                Description
              </label>
              <textarea
                disabled={loading}
                placeholder="Enter your category description"
                className="textarea textarea-bordered w-full focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                rows={5}
                maxLength={100}
                {...register("description", {
                  maxLength: {
                    value: 100,
                    message: "Maximum 100 characters allowed",
                  },
                })}
              />
              {errors.description && (
                <p className="text-error text-sm mt-1">{errors.description.message}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-center pt-6 gap-4">
            <button type="submit" className="btn bgTheme text-white w-full md:w-40">
              {loading ? <i className="fa-solid fa-spinner fa-spin mr-2"></i> : <i className="fa-solid fa-wand-magic-sparkles mr-2"></i>}
              {loading ? "" : "Create"}
            </button>
          </div>
        </form>
      </div>

      {/* Your original modal without any changes */}
      <SuccessModal ref={modalRef} navigateTo={handleNavigation} buttonText="Continue" message="Successfully Created Expense!" />

      {showModal && (
        <dialog className="modal modal-open">
          <div className="modal-box bg-white text-black dark:bg-gray-800 dark:text-white">
            <h3 className="font-bold text-lg">Expenses Submission</h3>
            <p className="py-4 whitespace-pre-line">{modalMessage}</p>
            <div className="modal-action">
              <button className="btn bgTheme text-white w-32" onClick={() => setShowModal(false)}>OK</button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
};
