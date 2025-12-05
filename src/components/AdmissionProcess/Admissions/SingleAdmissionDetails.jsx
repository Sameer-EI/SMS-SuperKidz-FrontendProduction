import React, { useEffect, useState } from "react";
import { fetchAdmissionDetailsById } from "../../../services/api/Api";
import { useParams } from "react-router-dom";

export const SingleAdmissionDetails = () => {
  const { id } = useParams();
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const getAdmissionDetailsById = async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await fetchAdmissionDetailsById(id);
      setDetails(data);
    } catch (err) {
      console.error("Failed to fetch admission details", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAdmissionDetailsById();
  }, [id]);

  // Loader UI
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="flex space-x-2">
          <div className="w-3 h-3 bgTheme rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bgTheme rounded-full animate-bounce [animation-delay:-0.2s]"></div>
          <div className="w-3 h-3 bgTheme rounded-full animate-bounce [animation-delay:-0.4s]"></div>
        </div>
        <p className="mt-2 text-gray-500 text-sm">Loading admission details...</p>
      </div>
    );
  }

  // Error UI with retry
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-6">
        <i className="fa-solid fa-triangle-exclamation text-5xl text-red-400 mb-4"></i>
        <p className="text-lg text-red-400 font-medium mb-4">
          Failed to load admission details.
        </p>
        <button
          onClick={getAdmissionDetailsById}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="p-4 text-center">
        No admission details available.
      </div>
    );
  }

  // Function to safely display nested data
  const getValue = (obj, key, fallback = "N/A") =>
    obj && obj[key] !== undefined && obj[key] !== null ? obj[key] : fallback;

  return (
    <div className="p-3 bg-gray-100 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100 mb-24 md:mb-10">
      <div className="max-w-7xl mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
        {/* Header Section */}
        <div className="bgTheme text-white px-6 py-4">
          <h1 className="text-2xl font-bold capitalize">
            {getValue(details.student_input, "first_name", "Unknown")}{" "}
            {getValue(details.student_input, "last_name", "")}'s Admission Details
          </h1>
        </div>

        <div className="p-6">
          {/* Student Information */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold border-b pb-2 mb-4 border-gray-200 dark:border-gray-700">
              Student Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="font-medium">Full Name:</p>
                <p className="capitalize">
                  {getValue(details.student_input, "first_name", "Unknown")}{" "}
                  {getValue(details.student_input, "middle_name", "")}{" "}
                  {getValue(details.student_input, "last_name", "")}
                </p>
              </div>
              <div>
                <p className="font-medium">Father's Name:</p>
                {/* <p>{getValue(details.student_input, "father_name")}</p> */}
                <p>{getValue(details.student_input, "father_name") || "N/A"}</p>

              </div>
              <div>
                <p className="font-medium">Mother's Name:</p>
                <p>{getValue(details.student_input, "mother_name") || "N/A"}</p>
              </div>
              <div>
                <p className="font-medium">Roll No:</p>
                <p>{getValue(details.student_input, "roll_number") || "N/A"}</p>
              </div>
              <div>
                <p className="font-medium">Date of Birth:</p>
                <p>{getValue(details.student_input, "date_of_birth")|| "N/A"}</p>
              </div>
              <div>
                <p className="font-medium">Gender:</p>
                <p>{getValue(details.student_input, "gender")|| "N/A"}</p>
              </div>
              <div>
                <p className="font-medium">Email:</p>
                <p>{getValue(details.student_input, "email")|| "N/A"}</p>
              </div>
              <div>
                <p className="font-medium">Blood Group:</p>
                <p>{getValue(details.student_input, "blood_group")|| "N/A"}</p>
              </div>
              <div>
                <p className="font-medium">Religion:</p>
                <p>{getValue(details.student_input, "religion")|| "N/A"}</p>
              </div>
              <div>
                <p className="font-medium">Category:</p>
                <p>{getValue(details.student_input, "category")|| "N/A"}</p>
              </div>
              <div>
                <p className="font-medium">Height/Weight:</p>
                <p>
                  {getValue(details.student_input, "height")|| "N/A"} cm /{" "}
                  {getValue(details.student_input, "weight")|| "N/A"} kg
                </p>
              </div>
              <div>
                <p className="font-medium">Siblings:</p>
                <p>{details.student_input.number_of_siblings ?? "N/A"}</p>
              </div>
              <div>
                <p className="font-medium">Contact number:</p>
                <p>{getValue(details.student_input, "contact_number") || "N/A"}</p>
              </div>
              <div>
                <p className="font-medium">Scholar Number:</p>
                <p>{details.student_input.scholar_number && details.student_input.scholar_number !== "null"
                  ? details.student_input.scholar_number
                  : "N/A"}
                </p>
              </div>
              <div>
                <p className="font-medium">Has RTE?</p>
                {details.is_rte ? (
                  <p>YES</p>
                ) : (
                  <p>NO</p>
                )}
              </div>
              <div>
                <p className="font-medium">RTE Number:</p>
                <p>{details.is_rte ? details.rte_number : "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Parent/Guardian Information */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold border-b pb-2 mb-4 border-gray-200 dark:border-gray-700">
              Parent/Guardian Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="font-medium">Guardian Type:</p>
                <p>{details.guardian_type || "N/A"}</p>
              </div>
              <div>
                <p className="font-medium">Name:</p>
                <p>
                  {getValue(details.guardian_input, "first_name", "Unknown")}{" "}
                  {getValue(details.guardian_input, "last_name", "")}
                </p>
              </div>
              <div>
                <p className="font-medium">Phone:</p>
                <p>{getValue(details.guardian_input, "phone_no") || "N/A"}</p>
              </div>
              <div>
                <p className="font-medium">Email:</p>
                <p>{getValue(details.guardian_input, "email") || "N/A"}</p>
              </div>
              <div>
                <p className="font-medium">Occupation:</p>
                <p>{getValue(details.guardian_input, "occupation") || "N/A"}</p>
              </div>
              <div>
                <p className="font-medium">Annual Income:</p>
                <p>
                  {details.guardian_input.annual_income
                    ? `₹${details.guardian_input.annual_income.toLocaleString()}`
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="font-medium">Qualification:</p>
                <p>{getValue(details.guardian_input, "qualification") || "N/A"}</p>
              </div>
              <div>
                <p className="font-medium">Designation:</p>
                <p>{getValue(details.guardian_input, "designation") || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold border-b pb-2 mb-4 border-gray-200 dark:border-gray-700">
              Address Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="font-medium">Address:</p>
                <p>
                  {getValue(details.address, "house_no")},{" "}
                  {getValue(details.address, "address_line")}
                </p>
              </div>
              <div>
                <p className="font-medium">Habitation:</p>
                <p>{getValue(details.address, "habitation") || "N/A"}</p>
              </div>
              <div>
                <p className="font-medium">City/State:</p>
                <p>
                  {getValue(details.address, "city_name")},{" "}
                  {getValue(details.address, "state_name")}
                </p>
              </div>
              <div>
                <p className="font-medium">Country:</p>
                <p>{getValue(details.address, "country_name")}</p>
              </div>
              <div>
                <p className="font-medium">District:</p>
                <p>{getValue(details.address, "district") || "N/A"}</p>
              </div>
              <div>
                <p className="font-medium">Division:</p>
                <p>{getValue(details.address, "division") || "N/A"}</p>
              </div>
              <div>
                <p className="font-medium">Pin Code:</p>
                <p>{getValue(details.address, "area_code") || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Admission Details */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold border-b pb-2 mb-4 border-gray-200 dark:border-gray-700">
              Admission Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="font-medium">Year Level:</p>
                <p>{details.year_level || "N/A"}</p>
              </div>
              <div>
                <p className="font-medium">School Year:</p>
                <p>{details.school_year || "N/A"}</p>
              </div>
              <div>
                <p className="font-medium">Admission Date:</p>
                <p>{details.admission_date || "N/A"}</p>
              </div>
              <div>
                <p className="font-medium">Enrollment No:</p>
                <p>{details.enrollment_no || "N/A"}</p>
              </div>
              <div>
                <p className="font-medium">Distance to School:</p>
                <p>{details.entire_road_distance_from_home_to_school || "N/A"}</p>
              </div>
              <div>
                <p className="font-medium">Previous School:</p>
                <p>{details.previous_school_name || "N/A"}</p>
              </div>
              <div>
                <p className="font-medium">Previous Standard:</p>
                <p>{details.previous_standard_studied || "N/A"}</p>
              </div>
              <div>
                <p className="font-medium">Previous Percentage:</p>
                <p>
                  {details.previous_percentage != null
                    ? `${details.previous_percentage.toFixed(2)}%`
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="font-medium">TC Letter:</p>
                <p>{details.tc_letter || "N/A"}</p>
              </div>
              <div>
                <p className="font-medium">Emergency Contact:</p>
                <p>{details.emergency_contact_no || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Banking Details */}
          <div>
            <h2 className="text-xl font-semibold border-b pb-2 mb-4 border-gray-200 dark:border-gray-700">
              Banking Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="font-medium">Account Holder:</p>
                <p>{getValue(details.banking_detail, "holder_name")|| "N/A"}</p>
              </div>
              <div>
                <p className="font-medium">Account Number:</p>
                <p>{getValue(details.banking_detail, "account_no")|| "N/A"}</p>
              </div>
              <div>
                <p className="font-medium">IFSC Code:</p>
                <p>{getValue(details.banking_detail, "ifsc_code")|| "N/A"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
