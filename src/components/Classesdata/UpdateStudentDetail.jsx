import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchStudentById, updateStudentById } from "../../services/api/Api";
import UpdateSuccessful from "../Modals/UpdateModal";
import { useForm } from "react-hook-form";

const UpdateStudentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [UpdateModal, setUpdateModal] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const fetchStudent = async () => {
    try {
      const data = await fetchStudentById(id);
      const { classes, ...rest } = data;
      Object.keys(rest).forEach((key) => {
        if (rest[key] !== null && rest[key] !== undefined) {
          setValue(key, rest[key]);
        }
      });
    } catch (err) {
      setError("Failed to load student data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudent();
  }, [id]);

  const onSubmit = async (formData) => {
    const payload = new FormData();
    for (const key in formData) {
      if (formData[key] !== null && formData[key] !== "") {
        payload.append(key, formData[key]);
      }
    }

    try {
      await updateStudentById(id, payload);
      setUpdateModal(true);
    } catch (err) {
      setError("Failed to update student details.");
    }
  };

  if (loading) {
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

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-6">
        <i className="fa-solid fa-triangle-exclamation text-5xl text-red-400 mb-4"></i>
        <p className="text-lg text-red-400 font-medium">Failed to load data, Try Again</p>
      </div>
    );
  }

  return (
    <>
      <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen mb-24 md:mb-10">
        <div className="max-w-7xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-lg shadow">
          <h1 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-gray-100">
            <i className="fa-solid fa-pen-to-square mr-2"></i> Update Student Details
          </h1>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            encType="multipart/form-data"
          >
            {/* First Name */}
            <div>
              <label className="label">First Name</label>
              <input
                type="text"
                placeholder="Enter First Name"
                {...register("first_name", {
                  required: "First name is required",
                  pattern: {
                    value: /^[A-Za-z]+$/,
                    message: "Only alphabets are allowed (A-Z)",
                  },
                })}
                className="input input-bordered w-full dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
              />
              {errors.first_name && (
                <span className="text-red-400 text-sm mt-1">{errors.first_name.message}</span>
              )}
            </div>

            {/* Middle Name */}
            <div>
              <label className="label">Middle Name</label>
              <input
                type="text"
                placeholder="Enter Middle Name"
                {...register("middle_name", {
                  pattern: {
                    value: /^[A-Za-z]+$/, // Only alphabets, no spaces allowed
                    message: "Only alphabets are allowed (no spaces)",
                  },
                })}
                onKeyDown={(e) => {
                  if (e.key === " ") {
                    e.preventDefault(); // Prevent space input
                  }
                }}
                className="input input-bordered w-full dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
              />
              {errors.middle_name && (
                <span className="text-red-400 text-sm mt-0">{errors.middle_name.message}</span>
              )}
            </div>


            {/* Last Name */}
            <div>
              <label className="label">Last Name</label>
              <input
                type="text"
                placeholder="Enter Last Name"
                {...register("last_name", {
                  required: "Last name is required",
                  pattern: {
                    value: /^[A-Za-z]+$/,
                    message: "Only alphabets are allowed (A-Z)",
                  },
                })}
                className="input input-bordered w-full dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
              />
              {errors.last_name && (
                <span className="text-red-400 text-sm mt-0">{errors.last_name.message}</span>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                placeholder="Enter Email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Invalid email format",
                  },
                })}
                className="input input-bordered w-full dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
              />
              {errors.email && (
                <span className="text-red-400 text-sm mt-0">{errors.email.message}</span>
              )}
            </div>

            {/* Date of Birth */}
            <div>
              <label className="label">Date of Birth</label>
              <input
                type="date"
                {...register("date_of_birth", {
                  required: "Date of birth is required",
                  validate: (value) =>
                    new Date(value) <= new Date() || "Future dates are not allowed",
                })}
                className="input input-bordered w-full dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
              />
              {errors.date_of_birth && (
                <span className="text-red-400 text-sm mt-0">{errors.date_of_birth.message}</span>
              )}
            </div>

            {/* Gender */}
            <div>
              <label className="label">Gender</label>
              <select
                {...register("gender", { required: "Gender is required" })}
                className="select select-bordered w-full dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {errors.gender && (
                <span className="text-red-400 text-sm mt-0">{errors.gender.message}</span>
              )}
            </div>

            {/* Height */}
            <div>
              <label className="label">Height (cm)</label>
              <input
                type="number"
                placeholder="Enter Height"
                {...register("height", {
                  min: { value: 30, message: "Height must be above 30cm" },
                  max: { value: 250, message: "Height must be below 250cm" },
                })}
                min={30}
                max={250}
                onInput={(e) => {
                  const val = parseInt(e.target.value);
                  if (val < 30) e.target.value = 30;
                  if (val > 250) e.target.value = 250;
                }}
                className="input input-bordered w-full dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
              />
              {errors.height && (
                <span className="text-red-400 text-sm mt-0">{errors.height.message}</span>
              )}
            </div>

            {/* Weight */}
            <div>
              <label className="label">Weight (kg)</label>
              <input
                type="number"
                placeholder="Enter Weight"
                {...register("weight", {
                  min: { value: 5, message: "Weight must be above 5kg" },
                  max: { value: 200, message: "Weight must be below 200kg" },
                })}
                min={5}
                max={200}
                onInput={(e) => {
                  const val = parseInt(e.target.value);
                  if (val < 5) e.target.value = 5;
                  if (val > 200) e.target.value = 200;
                }}
                className="input input-bordered w-full dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
              />
              {errors.weight && (
                <span className="text-red-400 text-sm mt-0">{errors.weight.message}</span>
              )}
            </div>

            {/* Number of Siblings */}
            <div>
              <label className="label">Number of Siblings</label>
              <input
                type="number"
                placeholder="Enter Number Of Siblings"
                {...register("number_of_siblings", {
                  validate: (value) => {
                    if (value === "" || value === undefined) return true;
                    if (parseInt(value) < 0) return "Cannot be negative";
                    if (parseInt(value) > 10) return "Maximum 10 siblings allowed";
                    return true;
                  },
                })}
                min={0}
                max={10}
                onKeyDown={(e) => {
                  const currentValue = parseInt(e.target.value) || 0;
                  if (
                    (e.key === "ArrowDown" && currentValue <= 0) ||
                    (e.key === "ArrowUp" && currentValue >= 10)
                  ) {
                    e.preventDefault();
                  }
                }}
                className="input input-bordered w-full dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
              />
              {errors.number_of_siblings && (
                <span className="text-red-400 text-sm mt-0.5">{errors.number_of_siblings.message}</span>
              )}
            </div>

            {/* Father Name */}
            <div>
              <label className="label">Father Name</label>
              <input
                type="text"
                placeholder="Enter Father Name"
                {...register("father_name", {
                  required: "Father name is required",
                })}
                className="input input-bordered w-full dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
              />
              {errors.father_name && (
                <span className="text-red-400 text-sm mt-0">{errors.father_name.message}</span>
              )}
            </div>

            {/* Mother Name */}
            <div>
              <label className="label">Mother Name</label>
              <input
                type="text"
                placeholder="Enter Mother Name"
                {...register("mother_name", {
                  required: "Mother name is required",
                })}
                className="input input-bordered w-full dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
              />
              {errors.mother_name && (
                <span className="text-red-400 text-sm mt-0">{errors.mother_name.message}</span>
              )}
            </div>

            {/* Profile Picture */}
            <div className="md:col-span-2 lg:col-span-3">
              <label className="label">Upload Profile Picture</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setValue("user_profile", e.target.files[0])} // manual handling
                className="file-input file-input-bordered w-full dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
              />
            </div>

            {/* Submit Button */}
            <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center mt-6">
              <button type="submit" className="btn bgTheme text-white">
                <i className="fa-solid fa-floppy-disk mr-2"></i> Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>

      {UpdateModal && (
        <UpdateSuccessful
          handleCloseOnly={() => setUpdateModal(false)}
          handleCloseAndNavigate={() => navigate(`/studentDetails/${id}`)}
        />
      )}
    </>
  );
};

export default UpdateStudentDetail;

