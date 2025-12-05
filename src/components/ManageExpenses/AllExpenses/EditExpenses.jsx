import React, { useContext, useEffect, useRef, useState } from "react";
import { SuccessModal } from "../../Modals/SuccessModal";
import {
  fetchExpenseCategory,
  fetchSchoolExpense,
  fetchSchoolExpenseById,
  fetchSchoolYear,
} from "../../../services/api/Api";
import { AuthContext } from "../../../context/AuthContext";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { constants } from "../../../global/constants";
import axios from "axios";
import { Error } from "../../../global/Error";
import { allRouterLink } from "../../../router/AllRouterLinks";

export const EditExpenses = () => {
  const userRole = localStorage.getItem("userRole");
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState([]);
  const [apiError, setApiError] = useState("");
  const [error, setError] = useState("");
  const modalRef = useRef();
  const [selectedFile, setSelectedFile] = useState(null);

  const [amountDisabled, setAmountDisabled] = useState(false);

  const { axiosInstance } = useContext(AuthContext);

  const Status = ["approved", "pending", "rejected"];
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
  };

  const getSchoolExpenseById = async () => {
    try {
      setError("");
      const response = await axiosInstance.get(`/d/School-Expense/${id}/`);
      const data = response.data;
      if (data) {
        setValue("category", data.category);
        setValue("amount", data.amount);
        setValue("description", data.description);
        setValue("expense_date", data.expense_date);
        setValue("attachment", data.attachment);
        setValue("status", data.status);
      }
    } catch (err) {
      setError("Failed to load expenses. Please try again later.");
    }
  };

  const getExpenseCategory = async () => {
    try {
      setError("");
      const response = await axiosInstance.get("/d/Expense-Category/");
      setCategory(response.data);
    } catch (err) {
      console.error("Cannot get the category:", err);
      setError("Failed to load categories. Please try again later.");
    }
  };
  useEffect(() => {
    getExpenseCategory();
    getSchoolExpenseById();
  }, [id]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setApiError("");

      console.log("Form data:", data);

      const formData = new FormData();

      // Append text fields
      formData.append("category", data.category);
      formData.append("amount", data.amount);
      formData.append("description", data.description || "");
      formData.append("expense_date", data.expense_date);
      formData.append("status", data.status);

      // Append file if selected
      if (selectedFile) {
        formData.append("attachment", selectedFile);
      }

      const response = await axiosInstance.patch(
        `/d/School-Expense/${id}/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        modalRef.current?.show();
      }
    } catch (error) {
      console.error("Edit expense error:", error);
      if (error.response?.data) {
        const errors = error.response.data;
        const fieldErrors = Object.entries(errors)
          .map(
            ([field, messages]) =>
              `${field}: ${Array.isArray(messages) ? messages.join(", ") : messages
              }`
          )
          .join(" | ");
        setApiError(fieldErrors);
      } else if (error.request) {
        setApiError("No response from server. Please check your connection.");
      } else {
        setApiError(error.message || "An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };


  if (error) {
    return <Error />;
  }

  const handleNavigation = () => {
    navigate(`${allRouterLink.viewAllExpenses}`);
  };

  return (
    <div className="min-h-screen p-5 bg-gray-50 dark:bg-gray-900 mb-24 md:mb-10">
      <div className="w-full max-w-7xl mx-auto p-6 bg-base-100 rounded-box my-5 shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-8">
          Edit Expense
          <i className="fa-solid fa-pen-to-square ml-2"></i>
        </h1>

        {/* Display API error message */}
        {apiError && (
          <div className="border border-error/50 rounded-lg p-4 mb-6 bg-white">
            <div className="flex items-center text-error">
              <i className="fa-solid fa-circle-exclamation mr-2"></i>
              <span className="font-medium">{apiError}</span>
            </div>
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category Selection */}
            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center gap-1">
                  <i className="fa-solid fa-list text-sm"></i>
                  Category <span className="text-error">*</span>
                </span>
              </label>
              <select
                className="select select-bordered w-full focus:outline-none"
                {...register("category", { required: "Category is required" })}
              >
                <option value="">Select Category</option>
                {category?.map(
                  (cat) =>
                    cat && (
                      <option key={cat.id} value={cat.id}>
                        {cat.name.charAt(0).toUpperCase() + cat.name.slice(1)}
                      </option>
                    )
                )}
              </select>

              {errors.category && (
                <p className="text-error text-sm mt-1">
                  {errors.category.message}
                </p>
              )}
            </div>

            {/* Amount Field */}
            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center gap-1">
                  <i className="fa-solid fa-money-bill-wave text-sm"></i>
                  Amount <span className="text-error">*</span>
                </span>
              </label>
              <input
                type="number"
                min={0}
                disabled={amountDisabled}
                placeholder="Enter Base Salary e.g: 15000"
                className="input input-bordered w-full focus:outline-none"
                {...register("amount", {
                  required: "Amount salary is required",
                  min: { value: 0, message: "Salary must be positive" },
                })}
              />
              {errors.amount && (
                <p className="text-error text-sm mt-1">
                  {errors.amount.message}
                </p>
              )}
            </div>

            {/* Expense Field */}
            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center gap-1">
                  <i className="fa-solid fa-calendar-days text-sm"></i>
                  Expense Date <span className="text-error"></span>
                </span>
              </label>
              <input
                type="date"
                className="input input-bordered w-full focus:outline-none"
                {...register("expense_date", {
                  required: "Expense Date is required",
                })}
              />
              {errors.expense_date && (
                <p className="text-error text-sm mt-1">
                  {errors.expense_date.message}
                </p>
              )}
            </div>
            {/* Status */}
            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center gap-1">
                  <i className="fa-solid fa-circle-check text-sm"></i>
                  Status <span className="text-error"></span>
                </span>
              </label>
              <select
                disabled={constants.roles.director !== userRole}
                {...register("status")}
                className="select select-bordered w-full focus:outline-none"
              >
                <option value="">Select Status</option>
                {Status?.map(
                  (sta, idx) =>
                    sta && (
                      <option key={idx} value={sta}>
                        {sta.charAt(0).toUpperCase() + sta.slice(1)}
                      </option>
                    )
                )}
              </select>

              {errors.expense_date && (
                <p className="text-error text-sm mt-1">
                  {errors.expense_date.message}
                </p>
              )}
            </div>

            {/* Attachments */}
            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center gap-1">
                  <i className="fa-solid fa-paperclip text-sm"></i>
                  Attachment <span className="text-error"></span>
                </span>
              </label>

              {!selectedFile ? (
                <input
                  type="file"
                  className="file-input file-input-bordered w-full focus:outline-none"
                  onChange={handleFileChange}
                />
              ) : (
                <div className="file-input file-input-bordered w-full flex items-center justify-between">
                  <span className="text-sm text-gray-700 truncate px-3">
                    {selectedFile.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="btn btn-xs text-red-700 bg-red-50 hover:bg-red-100 border border-red-300 rounded-md"
                  >
                    <span>Remove</span>
                  </button>
                </div>
              )}

              {errors.attachment && (
                <p className="text-error text-sm mt-1">
                  {errors.attachment.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            {/* Description Field */}
            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center gap-1">
                  <i className="fa-solid fa-file-lines text-sm"></i>
                  Description <span className="text-error"></span>
                </span>
              </label>
              <textarea
                placeholder="Enter your category description"
                className="textarea textarea-bordered w-full focus:outline-none"
                rows={5}
                {...register("description")}
              />
              {errors.description && (
                <p className="text-error text-sm mt-1">
                  {errors.description.message}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-center pt-6 gap-4">
            <button
              type="submit"
              className="btn bgTheme text-white w-full md:w-40"
            >
              {loading ? (
                <i className="fa-solid fa-spinner fa-spin mr-2"></i>
              ) : (
                <i className="fa-solid fa-floppy-disk mr-2"></i>
              )}
              {loading ? "" : "Update"}
            </button>
          </div>
        </form>
      </div>
      <SuccessModal
        ref={modalRef}
        navigateTo={handleNavigation}
        buttonText="Continue"
        message="Your profile has been updated successfully!"
      />
    </div>
  );
};
