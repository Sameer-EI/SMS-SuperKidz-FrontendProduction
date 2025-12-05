import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import {
  fetchGuardianType,
  fetchSchoolYear,
  fetchYearLevels,
  fetchCountry,
  fetchState,
  fetchCity,
  handleAdmissionForm,
} from "../../services/api/Api";
import { constants } from "../../global/constants";
import { data, useNavigate } from "react-router-dom";
import AdmissionSuccessful from "../Modals/AdmissionSuccessful";

export const AdmissionForm = () => {
  const navigate = useNavigate();
  const [yearLevel, setYearLevel] = useState([]);
  const [schoolYears, setSchoolYear] = useState([]);
  const [guardianTypes, setGuardianType] = useState([]);
  const [showPassword, setShowPassword] = useState(true);
  const [showGuardianPassword, setShowGuardianPassword] = useState(true);
  const [country, setCountry] = useState([]);
  const [state, setState] = useState([]);
  const [city, setCity] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [selectedGuardianType, setSelectedGuardianType] = useState("");
  const formRef = useRef(null);
  const [showAdmissionSuccessModal, setShowAdmissionSuccessModal] =
    useState(false);
  const [isRTE, setIsRTE] = useState(false);

  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [selectedCityName, setSelectedCityName] = useState("");
  const [citySearchInput, setCitySearchInput] = useState("");

  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [selectedCountryName, setSelectedCountryName] = useState("");
  const [countrySearchInput, setCountrySearchInput] = useState("");

  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [selectedStateName, setSelectedStateName] = useState("");
  const [stateSearchInput, setStateSearchInput] = useState("");



  const {
    register,
    watch,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    resetField,
  } = useForm({
    mode: "onChange",
    defaultValues: {
      student: {
        first_name: "",
        middle_name: "",
        last_name: "",
        email: "",
        password: "",
        father_name: "",
        mother_name: "",
        date_of_birth: "",
        gender: "",
        religion: "",
        category: null,
        height: null,
        weight: null,
        blood_group: "",
        number_of_siblings: "",
        roll_number: null,
        scholar_number: null,
        contact_number: "",
      },
      guardian: {
        first_name: "",
        middle_name: "",
        last_name: "",
        email: "",
        password: "",
        phone_no: "",
        annual_income: "",
        means_of_livelihood: "",
        qualification: "",
        occupation: "",
        designation: "",
      },
      address_input: {
        house_no: "",
        habitation: "",
        ward_no: "",
        zone_no: "",
        block: "",
        district: "",
        division: "",
        area_code: "",
        country: "",
        state: "",
        city: "",
        address_line: "",
      },
      banking_detail_input: {
        account_no: "",
        ifsc_code: "",
        holder_name: "",
      },
      guardian_type_input: "",
      year_level: "",
      school_year: "",
      previous_school_name: "",
      previous_standard_studied: "",
      tc_letter: "",
      emergency_contact_no: "",
      entire_road_distance_from_home_to_school: "",
      obtain_marks: "",
      total_marks: "",
      is_rte: false,
      rte_number: "",
    },
  });

  const handleShowPassword = () => setShowPassword(!showPassword);
  const handleShowGuardianPassword = () =>
    setShowGuardianPassword(!showGuardianPassword);
  const handleGuardianTypesChange = (e) => {
    setSelectedGuardianType(e.target.value);
    setValue("guardian_type_input", e.target.value);
  };

  const handleRTECheckboxChange = (e) => {
    const isChecked = e.target.checked;
    setIsRTE(isChecked);
    setValue("is_rte", isChecked);

    // Clear RTE number field when unchecked
    if (!isChecked) {
      resetField("rte_number");
    }
  };

  const getYearLevels = async () => {
    try {
      const yearLevels = await fetchYearLevels();
      setYearLevel(yearLevels);
    } catch (err) {
      console.log("Failed to load year levels. Please try again.");
    }
  };

  const getSchoolYears = async () => {
    try {
      const schoolYears = await fetchSchoolYear();
      setSchoolYear(schoolYears);
    } catch (err) {
      console.log("Failed to load school years. Please try again.");
    }
  };

  const getGuardianType = async () => {
    try {
      const guardianType = await fetchGuardianType();
      setGuardianType(guardianType);
    } catch (error) {
      console.log("Failed to load guardian type. Please try again.");
    }
  };

  const getCountry = async () => {
    try {
      const countryList = await fetchCountry();
      setCountry(countryList);
    } catch (err) {
      console.log("Failed to load countries. Please try again.");
    }
  };

  const getState = async () => {
    try {
      const stateList = await fetchState();
      setState(stateList);
    } catch (err) {
      console.log("Failed to load states. Please try again.");
    }
  };

  const getCity = async () => {
    try {
      const cityList = await fetchCity();
      setCity(cityList);
    } catch (err) {
      console.log("Failed to load cities. Please try again.");
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true); // loader start
        setError(null);

        await Promise.all([
          getYearLevels(),
          getSchoolYears(),
          getGuardianType(),
          getCountry(),
          getState(),
          getCity(),
        ]);
      } catch (err) {
        setError("Failed to fetch data");
      } finally {
        setLoading(false); // loader stop
      }
    };

    fetchAllData();
  }, []);

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      const toNumberOrNull = (val) => {
        if (val === "" || val === undefined || val === null) return null;
        const num = Number(val);
        return isNaN(num) ? null : num;
      };

      const toNumberOrZero = (val) => {
        if (val === "" || val === undefined || val === null) return 0;
        const num = Number(val);
        return isNaN(num) ? 0 : num;
      };

      // Calculate percentage if marks are provided
      const obtainMarks = toNumberOrZero(data.obtain_marks);
      const totalMarks = toNumberOrZero(data.total_marks);
      const previousPercentage = totalMarks > 0
        ? parseFloat(((obtainMarks / totalMarks) * 100).toFixed(2))
        : 0;

      const payload = {
        student: {
          first_name: data.student?.first_name || "",
          middle_name: data.student?.middle_name || "",
          last_name: data.student?.last_name || "",
          email: data.student?.email || "",
          password: data.student?.password || "",
          user_profile: null,
          father_name: data.student?.father_name || "",
          mother_name: data.student?.mother_name || "",
          date_of_birth: data.student?.date_of_birth || null,
          gender: data.student?.gender || null,
          religion: data.student?.religion || "",
          category: data.student?.category || null,
          height: toNumberOrNull(data.student?.height),
          weight: toNumberOrNull(data.student?.weight),
          blood_group: data.student?.blood_group || "",
          number_of_siblings: toNumberOrNull(data.student?.number_of_siblings),
          roll_number: "",
          contact_number: data.guardian?.phone_no || "",
          classes: []
        },
        guardian: {
          first_name: data.guardian?.first_name || "",
          middle_name: data.guardian?.middle_name || "",
          last_name: data.guardian?.last_name || "",
          email: data.guardian?.email || "",
          password: data.guardian?.password || "",
          user_profile: null,
          phone_no: data.guardian?.phone_no || "",
          annual_income: toNumberOrNull(data.guardian?.annual_income),
          means_of_livelihood: data.guardian?.means_of_livelihood || null,
          qualification: data.guardian?.qualification || "",
          occupation: data.guardian?.occupation || "",
          designation: data.guardian?.designation || "",
          is_active: false
        },
        address_input: {
          house_no: toNumberOrNull(data.address_input?.house_no),
          habitation: data.address_input?.habitation || "",
          ward_no: toNumberOrNull(data.address_input?.ward_no),
          zone_no: toNumberOrNull(data.address_input?.zone_no),
          block: data.address_input?.block || "",
          district: data.address_input?.district || "",
          division: data.address_input?.division || "",
          area_code: toNumberOrNull(data.address_input?.area_code),
          country: toNumberOrNull(data.address_input?.country),
          state: toNumberOrNull(data.address_input?.state),
          city: toNumberOrNull(data.address_input?.city),
          address_line: data.address_input?.address_line || ""
        },
        banking_detail_input: {
          account_no: data.banking_detail_input?.account_no || null,
          ifsc_code: data.banking_detail_input?.ifsc_code || "",
          holder_name: data.banking_detail_input?.holder_name || "",
          bank_name: null
        },
        guardian_type_input: data.guardian_type_input || null,
        year_level: data.year_level || null,
        school_year: data.school_year || null,
        previous_school_name: data.previous_school_name || "",
        previous_standard_studied: data.previous_standard_studied || "",
        tc_letter: data.tc_letter || "",
        emergency_contact_no: data.emergency_contact_no || "",
        entire_road_distance_from_home_to_school: data.entire_road_distance_from_home_to_school || "",
        obtain_marks: obtainMarks,
        total_marks: totalMarks,
        previous_percentage: previousPercentage,
        is_rte: data.is_rte || false,
        rte_number: data.rte_number || ""
      };

      console.log("JSON Payload:", payload);

      const response = await handleAdmissionForm(payload);

      console.log(" Response:", response);

      setShowAdmissionSuccessModal(true);
      reset();
      setSelectedGuardianType("");
      setIsRTE(false);
    } catch (error) {
      console.error(" Submission error:", error);

      let errorMessage = "Failed to submit the form";

      if (error.response) {
        console.log("Error response:", error.response);

        if (typeof error.response.data === 'string' && error.response.data.includes('<!DOCTYPE')) {
          errorMessage = "Server error: Received HTML instead of JSON. Please check the API endpoint.";
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data) {
          // Handle validation errors
          if (typeof error.response.data === 'object') {
            const errors = Object.entries(error.response.data)
              .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
              .join('\n');
            errorMessage = errors || errorMessage;
          }
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      setAlertMessage(errorMessage);
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };


  const handleCloseOnly = () => {
    setShowAdmissionSuccessModal(false);
  };

  const handleCloseAndNavigate = () => {
    setShowAdmissionSuccessModal(false);
    navigate("/addmissionDetails");
  };

  const filteredCities = city
    .filter((c) =>
      c.name.toLowerCase().includes(citySearchInput.toLowerCase())
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  const filteredCountries = country
    .filter((c) =>
      c.name.toLowerCase().includes(countrySearchInput.toLowerCase())
    )
    .sort((a, b) => a.name.localeCompare(b.name));



  const filteredStates = state
    .filter((s) =>
      s.name.toLowerCase().includes(stateSearchInput.toLowerCase())
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  // useEffect(() => {
  //   register("address_input.country", { required: "Country is required" });
  //   register("address_input.state", { required: "State is required" });
  //   register("address_input.city", { required: "City is required" });
  // }, [register]);

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
        <p className="text-lg text-red-400 font-medium">
          Failed to load data, Try Again
        </p>
      </div>
    );
  }

  return (
    <div className="mb-24 md:mb-10">
      <style>{constants.hideEdgeRevealStyle}</style>
      <form
        ref={formRef}
        className="w-full max-w-7xl mx-auto p-6 bg-base-100 rounded-box my-5 shadow-sm focus:outline-none mb-10"
        onSubmit={handleSubmit(onSubmit)}
      >
        <h1 className="text-3xl font-bold text-center mb-8">
          Admission Form<i className="fa-solid fa-graduation-cap ml-2"></i>
        </h1>

        {/* Student Information Section */}
        <div className="bg-base-200 p-6 rounded-box mb-6">
          <h2 className="text-2xl font-bold mb-4">Student Information</h2>

          {/* RTE Checkbox */}
          <div className="grid grid-cols-1 md:grid-cols-1 mb-3">
            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text flex items-center gap-2">
                  <i className="fa-solid fa-child-reaching text-sm"></i>
                  Is RTE Student?
                </span>
                <input
                  type="checkbox"
                  {...register("is_rte")}
                  onChange={handleRTECheckboxChange}
                  className="checkbox checkbox-primary"
                />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* First Name */}
            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <i className="fa-solid fa-user text-sm"></i>
                  First Name <span className="text-error">*</span>
                </span>
              </label>
              <input
                type="text"
                {...register("student.first_name", {
                  required: "First name is required",
                  maxLength: { value: 100, message: "First name cannot exceed 100 characters" },
                  pattern: { value: /^[A-Za-z]+(?: [A-Za-z]+)*$/, message: "Enter a valid name" },
                })}
                placeholder="First Name"
                className={`input input-bordered w-full focus:outline-none ${errors.student?.first_name ? "input-error" : ""}`}
                onInput={(e) => {
                  e.target.value = e.target.value
                    .replace(/[^A-Za-z\s]/g, "")
                    .replace(/\s+/g, " ")
                    .trimStart();
                }}
              />
              {errors.student?.first_name && (
                <span className="text-error text-sm">{errors.student.first_name.message}</span>
              )}
            </div>

            {/* Middle Name */}
            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <i className="fa-solid fa-user-pen text-sm"></i>
                  Middle Name
                </span>
              </label>
              <input
                type="text"
                {...register("student.middle_name", {
                  maxLength: { value: 100, message: "Middle name cannot exceed 100 characters" },
                  validate: (value) => {
                    if (!value) return true;
                    if (!/^[A-Za-z]+(?: [A-Za-z]+)*$/.test(value))
                      return "Enter a valid name";
                    return true;
                  },
                })}
                placeholder="Middle Name (optional)"
                className={`input input-bordered w-full focus:outline-none ${errors.student?.middle_name ? "input-error" : ""}`}
                onInput={(e) => {
                  e.target.value = e.target.value
                    .replace(/[^A-Za-z\s]/g, "")
                    .replace(/\s+/g, " ")
                    .trimStart();
                }}
              />
              {errors.student?.middle_name && (
                <span className="text-error text-sm">{errors.student.middle_name.message}</span>
              )}
            </div>

            {/* Last Name */}
            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <i className="fa-solid fa-user-tag text-sm"></i>
                  Last Name <span className="text-error">*</span>
                </span>
              </label>
              <input
                type="text"
                {...register("student.last_name", {
                  required: "Last name is required",
                  maxLength: { value: 100, message: "Last name cannot exceed 100 characters" },
                  pattern: { value: /^[A-Za-z]+(?: [A-Za-z]+)*$/, message: "Enter a valid name" },
                })}
                placeholder="Last Name"
                className={`input input-bordered w-full focus:outline-none ${errors.student?.last_name ? "input-error" : ""}`}
                onInput={(e) => {
                  e.target.value = e.target.value
                    .replace(/[^A-Za-z\s]/g, "")
                    .replace(/\s+/g, " ")
                    .trimStart();
                }}
              />
              {errors.student?.last_name && (
                <span className="text-error text-sm">{errors.student.last_name.message}</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Email */}
            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <i className="fa-solid fa-envelope text-sm"></i>
                  Email
                </span>
              </label>
              <input
                type="email"
                {...register("student.email", {
                  pattern: { value: /^\S+@\S+\.\S+$/, message: "Invalid email format" },
                })}
                placeholder="student@example.com (optional)"
                className={`input input-bordered w-full focus:outline-none ${errors.student?.email ? "input-error" : ""}`}
              />
              {errors.student?.email && (
                <span className="text-error text-sm">{errors.student.email.message}</span>
              )}
            </div>
            {/* Password */}
            <div className="form-control relative">
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <i className="fa-solid fa-lock text-sm"></i>
                  Password
                </span>
              </label>
              <input
                type={showPassword ? "text" : "password"}
                {...register("student.password")}
                placeholder="Password (optional)"
                className="input input-bordered w-full pr-10 focus:outline-none"
              />
              <button
                type="button"
                className="passwordEyes text-gray-500"
                onClick={handleShowPassword}
              >
                <i className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* DOB */}
            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <i className="fa-solid fa-calendar-days text-sm"></i>
                  Date of Birth
                </span>
              </label>
              <input
                type="date"
                max={new Date().toISOString().split("T")[0]}
                {...register("student.date_of_birth")}
                className="input input-bordered w-full focus:outline-none"
              />
            </div>
            {/* Gender */}
            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <i className="fa-solid fa-venus-mars text-sm"></i>
                  Gender
                </span>
              </label>
              <select {...register("student.gender")} className="select select-bordered w-full">
                <option value="">Select Gender (optional)</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            {/* Father Name  */}
            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <i className="fa-solid fa-user text-sm"></i>
                  Father's Name
                </span>
              </label>
              <input
                type="text"
                {...register("student.father_name")}
                placeholder="Father's Name (optional)"
                className="input input-bordered w-full focus:outline-none"
              />
            </div>
            {/* Mother Name  */}
            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <i className="fa-solid fa-user text-sm"></i>
                  Mother's Name
                </span>
              </label>
              <input
                type="text"
                {...register("student.mother_name")}
                placeholder="Mother's Name (optional)"
                className="input input-bordered w-full focus:outline-none"
              />
            </div>
            {/* Religion  */}
            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <i className="fa-solid fa-hands-praying text-sm"></i>
                  Religion
                </span>
              </label>
              <input
                type="text"
                {...register("student.religion")}
                placeholder="Religion (optional)"
                className="input input-bordered w-full focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
            {/* Category */}
            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <i className="fa-solid fa-tag text-sm"></i>
                  Category
                </span>
              </label>
              <select {...register("student.category")} className="select select-bordered w-full">
                <option value="">Select Category (optional)</option>
                <option value="GEN">General</option>
                <option value="OBC">OBC</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
              </select>
            </div>
            {/* Height */}
            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <i className="fa-solid fa-ruler-vertical text-sm"></i>
                  Height (cm)
                </span>
              </label>
              <input
                type="number"
                {...register("student.height")}
                placeholder="Height (optional)"
                className="input input-bordered w-full focus:outline-none"
              />
            </div>
            {/*  Weight */}
            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <i className="fa-solid fa-weight-scale text-sm"></i>
                  Weight (kg)
                </span>
              </label>
              <input
                type="number"
                {...register("student.weight")}
                placeholder="Weight (optional)"
                className="input input-bordered w-full focus:outline-none"
              />
            </div>
            {/*  Blood */}
            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <i className="fa-solid fa-heart-pulse text-sm"></i>
                  Blood Group
                </span>
              </label>
              <select {...register("student.blood_group")} className="select select-bordered w-full">
                <option value="">Select Blood Group (optional)</option>
                <option>A+</option>
                <option>A-</option>
                <option>B+</option>
                <option>B-</option>
                <option>O+</option>
                <option>O-</option>
                <option>AB+</option>
                <option>AB-</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Siblings*/}
            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <i className="fa-solid fa-people-group text-sm"></i>
                  Number of Siblings
                </span>
              </label>
              <input
                type="number"
                {...register("student.number_of_siblings")}
                placeholder="Number of Siblings (optional)"
                className="input input-bordered w-full focus:outline-none"
              />
            </div>
            {/* RTE Number  */}
            {isRTE && (
              <div className="form-control">
                <label className="label">
                  <span className="label-text flex items-center gap-2">
                    <i className="fa-solid fa-id-card text-sm"></i>
                    RTE Number <span className="text-error">*</span>
                  </span>
                </label>
                <input
                  type="text"
                  maxLength={50}
                  {...register("rte_number", {
                    required: "RTE number is required for RTE students",
                  })}
                  placeholder="RTE Number"
                  className={`input input-bordered w-full focus:outline-none ${errors.rte_number ? "input-error" : ""}`}
                />
                {errors.rte_number && (
                  <span className="text-error text-sm">{errors.rte_number.message}</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Guardian Information Section */}
        <div className="bg-base-200 p-6 rounded-box mb-6">
          <h2 className="text-2xl font-bold mb-4">Guardian Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* First Name */}
            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <i className="fa-solid fa-user text-sm"></i>
                  First Name <span className="text-error">*</span>
                </span>
              </label>
              <input
                type="text"
                {...register("guardian.first_name", {
                  required: "First name is required",
                  maxLength: {
                    value: 100,
                    message: "First name cannot exceed 100 characters",
                  },
                })}
                placeholder="First Name"
                className={`input input-bordered w-full focus:outline-none ${errors.guardian?.first_name ? "input-error" : ""
                  }`}
              />
              {errors.guardian?.first_name && (
                <span className="text-error text-sm">
                  {errors.guardian.first_name.message}
                </span>
              )}
            </div>

            {/* Middle Name */}
            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <i className="fa-solid fa-user-pen text-sm"></i>
                  Middle Name
                </span>
              </label>
              <input
                type="text"
                {...register("guardian.middle_name", {
                  maxLength: { value: 100, message: "Middle name cannot exceed 100 characters" },
                  validate: (v) => !v || /^[A-Za-z]+(?: [A-Za-z]+)*$/.test(v) || "Enter a valid name",
                })}
                placeholder="Middle Name (optional)"
                className={`input input-bordered w-full focus:outline-none ${errors.guardian?.middle_name ? "input-error" : ""}`}
                onInput={(e) => {
                  e.target.value = e.target.value.replace(/[^A-Za-z\s]/g, "").replace(/\s+/g, " ").trimStart();
                }}
              />
              {errors.guardian?.middle_name && <span className="text-error text-sm">{errors.guardian.middle_name.message}</span>}
            </div>

            {/* Last Name */}
            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <i className="fa-solid fa-user-tag text-sm"></i>
                  Last Name <span className="text-error">*</span>
                </span>
              </label>
              <input
                type="text"
                {...register("guardian.last_name", {
                  required: "Last name is required",
                  maxLength: {
                    value: 100,
                    message: "Last name cannot exceed 100 characters",
                  },
                })}
                placeholder="Last Name"
                className={`input input-bordered w-full focus:outline-none ${errors.guardian?.last_name ? "input-error" : ""
                  }`}
              />
              {errors.guardian?.last_name && (
                <span className="text-error text-sm">
                  {errors.guardian.last_name.message}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Email */}
            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <i className="fa-solid fa-envelope text-sm"></i>
                  Email
                </span>
              </label>
              <input
                type="email"
                {...register("guardian.email", {
                  validate: (v) => !v || /^\S+@\S+\.\S+$/.test(v) || "Invalid email format",
                })}
                placeholder="guardian@example.com (optional)"
                className={`input input-bordered w-full focus:outline-none ${errors.guardian?.email ? "input-error" : ""}`}
              />
              {errors.guardian?.email && <span className="text-error text-sm">{errors.guardian.email.message}</span>}
            </div>

            {/* Password */}
            <div className="form-control relative">
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <i className="fa-solid fa-lock text-sm"></i>
                  Password
                </span>
              </label>
              <input
                type={showGuardianPassword ? "text" : "password"}
                {...register("guardian.password", {
                  validate: (v) =>
                    !v ||
                    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(v) ||
                    "Must contain uppercase, lowercase, number & symbol (min 8 chars)",
                })}
                placeholder="eg: Password@123 (optional)"
                className={`input input-bordered w-full pr-10 focus:outline-none ${errors.guardian?.password ? "input-error" : ""}`}
              />
              <button type="button" className="passwordEyes text-gray-500" onClick={handleShowGuardianPassword}>
                <i className={`fa-solid ${showGuardianPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
              </button>
              {errors.guardian?.password && <span className="text-error text-sm">{errors.guardian.password.message}</span>}
            </div>

            {/* Guardian Type */}
            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <i className="fa-solid fa-user-shield text-sm"></i>
                  Guardian Type
                </span>
              </label>
              <select
                {...register("guardian_type_input")}
                className="select select-bordered w-full focus:outline-none cursor-pointer"
                value={selectedGuardianType}
                onChange={handleGuardianTypesChange}
              >
                <option value="">Select Guardian Type (optional)</option>
                {guardianTypes.map((g) => (
                  <option value={g.name} key={g.id}>{g.name}</option>
                ))}
              </select>
            </div>

            {/* Phone */}
            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <i className="fa-solid fa-phone text-sm"></i>
                  Phone Number
                </span>
              </label>
              <input
                type="tel"
                {...register("guardian.phone_no", {
                  validate: (v) => {
                    if (!v) return true;
                    if (!/^[6789]\d{9}$/.test(v)) return "Must start with 6,7,8,9 and be 10 digits";
                    return true;
                  },
                })}
                placeholder="Phone Number (optional)"
                className={`input input-bordered w-full focus:outline-none ${errors.guardian?.phone_no ? "input-error" : ""}`}
                onInput={(e) => {
                  e.target.value = e.target.value.replace(/\D/g, "").slice(0, 10);
                }}
              />
              {errors.guardian?.phone_no && <span className="text-error text-sm">{errors.guardian.phone_no.message}</span>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            {/* Annual Income */}
            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <i className="fa-solid fa-money-bill-wave text-sm"></i>
                  Annual Income
                </span>
              </label>
              <input
                type="number"
                {...register("guardian.annual_income", {
                  validate: (v) => !v || v >= 0 || "Annual income cannot be negative",
                })}
                placeholder="Annual Income (optional)"
                className={`input input-bordered w-full focus:outline-none ${errors.guardian?.annual_income ? "input-error" : ""}`}
                onKeyDown={(e) => (e.key === "-" || e.key === "e") && e.preventDefault()}
              />
              {errors.guardian?.annual_income && <span className="text-error text-sm">{errors.guardian.annual_income.message}</span>}
            </div>

            {/* Means of Livelihood */}
            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <i className="fa-solid fa-briefcase text-sm"></i>
                  Means of Livelihood
                </span>
              </label>
              <select {...register("guardian.means_of_livelihood")} className="select select-bordered w-full focus:outline-none">
                <option value="">Select (optional)</option>
                <option value="Govt">Government</option>
                <option value="Non-Govt">Non-Government</option>
              </select>
            </div>

            {/* Qualification */}
            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <i className="fa-solid fa-graduation-cap text-sm"></i>
                  Qualification
                </span>
              </label>
              <input
                type="text"
                {...register("guardian.qualification", {
                  maxLength: { value: 300, message: "Qualification cannot exceed 300 characters" },
                })}
                placeholder="Qualification (optional)"
                className={`input input-bordered w-full focus:outline-none ${errors.guardian?.qualification ? "input-error" : ""}`}
              />
              {errors.guardian?.qualification && <span className="text-error text-sm">{errors.guardian.qualification.message}</span>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Occupation */}
            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <i className="fa-solid fa-briefcase text-sm"></i>
                  Occupation
                </span>
              </label>
              <input
                type="text"
                {...register("guardian.occupation", {
                  maxLength: { value: 300, message: "Occupation cannot exceed 300 characters" },
                })}
                placeholder="Occupation (optional)"
                className={`input input-bordered w-full focus:outline-none ${errors.guardian?.occupation ? "input-error" : ""}`}
              />
              {errors.guardian?.occupation && <span className="text-error text-sm">{errors.guardian.occupation.message}</span>}
            </div>

            {/* Designation */}
            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <i className="fa-solid fa-id-card text-sm"></i>
                  Designation
                </span>
              </label>
              <input
                type="text"
                {...register("guardian.designation", {
                  maxLength: { value: 300, message: "Designation cannot exceed 300 characters" },
                })}
                placeholder="Designation (optional)"
                className={`input input-bordered w-full focus:outline-none ${errors.guardian?.designation ? "input-error" : ""}`}
              />
              {errors.guardian?.designation && <span className="text-error text-sm">{errors.guardian.designation.message}</span>}
            </div>
          </div>
        </div>



        {/* Academic Information Section */}
        <div className="bg-base-200 p-6 rounded-box mb-6">
          <h2 className="text-2xl font-bold mb-4">Academic Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Year Level */}
            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <i className="fa-solid fa-graduation-cap text-sm"></i>
                  Year Level <span className="text-error">*</span>
                </span>
              </label>
              <select
                {...register("year_level", {
                  required: "Year Level is required",
                })}
                className={`select select-bordered w-full focus:outline-none cursor-pointer ${errors.year_level ? "select-error" : ""
                  }`}
              >
                <option value="">Select Year Level</option>
                {yearLevel.map((yearlev) => (
                  <option value={yearlev.level_name} key={yearlev.id}>
                    {yearlev.level_name}
                  </option>
                ))}
              </select>
              {errors.year_level && (
                <span className="text-error text-sm">{errors.year_level.message}</span>
              )}
            </div>


            {/* School Year */}
            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <i className="fa-solid fa-calendar text-sm"></i>
                  School Year <span className="text-error">*</span>
                </span>
              </label>
              <select
                {...register("school_year", {
                  required: "School year is required",
                })}
                className={`select select-bordered w-full focus:outline-none cursor-pointer ${errors.school_year ? "select-error" : ""
                  }`}
              >
                <option value="">Select School Year</option>
                {schoolYears.map((schoolYear) => (
                  <option value={schoolYear.year_name} key={schoolYear.id}>
                    {schoolYear.year_name}
                  </option>
                ))}
              </select>
              {errors.school_year && (
                <span className="text-error text-sm">
                  {errors.school_year.message}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Previous School Name */}
            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <i className="fa-solid fa-school text-sm"></i>
                  Previous School Name
                </span>
              </label>
              <input
                type="text"
                {...register("previous_school_name", {
                  maxLength: {
                    value: 200,
                    message: "School name cannot exceed 200 characters",
                  },
                })}
                placeholder="Previous School Name (optional)"
                className={`input input-bordered w-full focus:outline-none ${errors.previous_school_name ? "input-error" : ""
                  }`}
              />
              {errors.previous_school_name && (
                <span className="text-error text-sm">
                  {errors.previous_school_name.message}
                </span>
              )}
            </div>

            {/* Previous Class/Grade */}
            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <i className="fa-solid fa-book text-sm"></i>
                  Previous Class/Grade
                </span>
              </label>
              <input
                type="text"
                {...register("previous_standard_studied", {
                  maxLength: {
                    value: 200,
                    message: "Class/grade cannot exceed 200 characters",
                  },
                })}
                placeholder="Previous Class/Grade (optional)"
                className={`input input-bordered w-full focus:outline-none ${errors.previous_standard_studied ? "input-error" : ""
                  }`}
              />
              {errors.previous_standard_studied && (
                <span className="text-error text-sm">
                  {errors.previous_standard_studied.message}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Admission Date */}
            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <i className="fa-solid fa-calendar-check text-sm"></i>
                  Admission Date
                </span>
              </label>
              <input
                type="date"
                max={new Date().toISOString().split("T")[0]}
                {...register("admission_date", {
                  validate: (value) => {
                    if (!value) return true;
                    const selectedDate = new Date(value);
                    const today = new Date();
                    if (selectedDate > today) {
                      return "Future dates are not allowed";
                    }
                    return true;
                  },
                })}
                className={`input input-bordered w-full focus:outline-none ${errors.admission_date ? "input-error" : ""
                  }`}
              />
              {errors.admission_date && (
                <span className="text-error text-sm">
                  {errors.admission_date.message}
                </span>
              )}
            </div>

            {/* TC Letter  */}
            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <i className="fa-solid fa-file text-sm"></i>
                  TC Letter
                </span>
              </label>
              <select
                {...register("tc_letter")}
                className="select select-bordered w-full focus:outline-none cursor-pointer"
              >
                <option value="">Select (optional)</option>
                <option value="no">No</option>
                <option value="not_applicable">Not Applicable</option>
                <option value="yes">Yes</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Emergency Contact  */}
            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <i className="fa-solid fa-phone text-sm"></i>
                  Emergency Contact
                </span>
              </label>
              <input
                type="tel"
                {...register("emergency_contact_no", {
                  validate: (value) => {
                    if (!value) return true;
                    if (!/^[6789]\d{9}$/.test(value)) {
                      return "Must start with 6–9 and be 10 digits";
                    }
                    return true;
                  },
                })}
                placeholder="Emergency Contact (optional)"
                className={`input input-bordered w-full focus:outline-none ${errors.emergency_contact_no ? "input-error" : ""
                  }`}
                onInput={(e) => {
                  e.target.value = e.target.value.replace(/\D/g, "").slice(0, 10);
                }}
              />
              {errors.emergency_contact_no && (
                <span className="text-error text-sm">
                  {errors.emergency_contact_no.message}
                </span>
              )}
            </div>

            {/* Distance to School*/}
            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <i className="fa-solid fa-road text-sm"></i>
                  Distance to School (km)
                </span>
              </label>
              <input
                type="number"
                {...register("entire_road_distance_from_home_to_school", {
                  validate: (value) => {
                    if (!value) return true;
                    if (value < 0) return "Distance cannot be negative";
                    return true;
                  },
                })}
                placeholder="Distance in km (optional)"
                className={`input input-bordered w-full focus:outline-none ${errors.entire_road_distance_from_home_to_school
                  ? "input-error"
                  : ""
                  }`}
              />
              {errors.entire_road_distance_from_home_to_school && (
                <span className="text-error text-sm">
                  {errors.entire_road_distance_from_home_to_school.message}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            {/* Marks Obtained */}
            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <i className="fa-solid fa-marker text-sm"></i>
                  Marks Obtained
                </span>
              </label>
              <input
                type="number"
                {...register("obtain_marks", {
                  validate: (value) => {
                    if (!value) return true;
                    if (value < 0) return "Marks cannot be negative";
                    return true;
                  },
                })}
                placeholder="Marks Obtained (optional)"
                className={`input input-bordered w-full focus:outline-none ${errors.obtain_marks ? "input-error" : ""
                  }`}
              />
              {errors.obtain_marks && (
                <span className="text-error text-sm">
                  {errors.obtain_marks.message}
                </span>
              )}
            </div>

            {/* Total Marks */}
            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <i className="fa-solid fa-chart-simple text-sm"></i>
                  Total Marks
                </span>
              </label>
              <input
                type="number"
                {...register("total_marks", {
                  validate: (value) => {
                    if (!value) return true;
                    if (value < 0) return "Total marks cannot be negative";
                    return true;
                  },
                })}
                placeholder="Total Marks (optional)"
                className={`input input-bordered w-full focus:outline-none ${errors.total_marks ? "input-error" : ""
                  }`}
              />
              {errors.total_marks && (
                <span className="text-error text-sm">
                  {errors.total_marks.message}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="bg-base-200 p-6 rounded-box mb-6">
          <h2 className="text-2xl font-bold mb-4">Residential Address</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* House Number */}
            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <i className="fa-solid fa-home text-sm"></i>
                  House Number
                </span>
              </label>
              <input
                type="number"
                {...register("address_input.house_no", {
                  min: { value: -2147483648, message: "Invalid house number" },
                  max: { value: 2147483647, message: "Invalid house number" },
                })}
                placeholder="House Number"
                className={`input input-bordered w-full focus:outline-none ${errors.address?.house_no ? "input-error" : ""
                  }`}
              />
              {errors.address?.house_no && (
                <span className="text-error text-sm">
                  {errors.address.house_no.message}
                </span>
              )}
            </div>

            {/* Habitation */}
            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <i className="fa-solid fa-map-location text-sm"></i>
                  Habitation
                </span>
              </label>
              <input
                type="text"
                {...register("address_input.habitation", {
                  maxLength: {
                    value: 100,
                    message: "Habitation cannot exceed 100 characters",
                  },
                })}
                placeholder="Habitation"
                className={`input input-bordered w-full focus:outline-none ${errors.address?.habitation ? "input-error" : ""
                  }`}
              />
              {errors.address?.habitation && (
                <span className="text-error text-sm">
                  {errors.address.habitation.message}
                </span>
              )}
            </div>

            {/* Block */}
            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <i className="fa-solid fa-building text-sm"></i>
                  Block
                </span>
              </label>
              <input
                type="text"
                {...register("address_input.block", {
                  maxLength: {
                    value: 100,
                    message: "Block cannot exceed 100 characters",
                  },
                })}
                placeholder="Block"
                className={`input input-bordered w-full focus:outline-none ${errors.address?.block ? "input-error" : ""
                  }`}
              />
              {errors.address?.block && (
                <span className="text-error text-sm">
                  {errors.address.block.message}
                </span>
              )}
            </div>

            {/* Ward Number */}
            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <i className="fa-solid fa-map text-sm"></i>
                  Ward Number
                </span>
              </label>
              <input
                type="number"
                placeholder="Ward Number"
                min={0}
                className="input input-bordered w-full focus:outline-none"
                {...register("address_input.ward_no")}
                onKeyDown={(e) => {
                  if (e.key === "-" || e.key === "e") e.preventDefault();
                }}
                onWheel={(e) => e.target.blur()}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
            {/* Zone */}
            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <i className="fa-solid fa-map-pin text-sm"></i>
                  Zone
                </span>
              </label>
              <input
                type="number"
                placeholder="Zone"
                min={0}
                className="input input-bordered w-full focus:outline-none"
                {...register("address_input.zone_no")}
                onKeyDown={(e) => {
                  if (e.key === "-" || e.key === "e") e.preventDefault();
                }}
                onWheel={(e) => e.target.blur()}
              />
            </div>

            {/* District */}
            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <i className="fa-solid fa-map text-sm"></i>
                  District
                </span>
              </label>
              <input
                type="text"
                {...register("address_input.district", {
                  maxLength: {
                    value: 50,
                    message: "District cannot exceed 100 characters",
                  },
                })}
                placeholder="District"
                className={`input input-bordered w-full focus:outline-none ${errors.address?.district ? "input-error" : ""
                  }`}
              />
              {errors.address?.district && (
                <span className="text-error text-sm">
                  {errors.address.district.message}
                </span>
              )}
            </div>

            {/* City */}
            <div className="form-control relative">
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <i className="fa-solid fa-city text-sm"></i>
                  City
                </span>
              </label>

              <div
                className={`input input-bordered w-full flex items-center justify-between cursor-pointer`}
                onClick={() => setShowCityDropdown(!showCityDropdown)}
              >
                <span className="text-gray-700 dark:text-gray-200">
                  {selectedCityName || "Select City (optional)"}
                </span>
                <i
                  className={`fa-solid fa-chevron-${showCityDropdown ? "up" : "down"} ml-2 text-gray-500`}
                ></i>
              </div>

              {showCityDropdown && (
                <div className="absolute z-10 bg-white dark:bg-[#242627] rounded w-full mt-1 shadow-lg border border-gray-300 dark:border-gray-600">
                  <div className="p-2 sticky top-0 shadow-sm bg-white dark:bg-[#242627]">
                    <input
                      type="text"
                      placeholder="Search City..."
                      className="input input-bordered w-full focus:outline-none bg-white dark:bg-[#242627] text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-500"
                      value={citySearchInput}
                      onChange={(e) => setCitySearchInput(e.target.value)}
                    />
                  </div>

                  <div className="max-h-40 overflow-y-auto">
                    {filteredCities.length > 0 ? (
                      filteredCities.map((city) => (
                        <p
                          key={city.id}
                          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer text-gray-800 dark:text-gray-200 capitalize"
                          onClick={() => {
                            setValue("address_input.city", city.id.toString());
                            setSelectedCityName(city.name);
                            setCitySearchInput("");
                            setShowCityDropdown(false);
                          }}
                        >
                          {city.name}
                        </p>
                      ))
                    ) : (
                      <p className="p-2 text-gray-500 dark:text-gray-400">No cities found</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Division */}
            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <i className="fa-solid fa-map-signs text-sm"></i>
                  Division
                </span>
              </label>
              <input
                type="text"
                {...register("address_input.division", {
                  maxLength: {
                    value: 20,
                    message: "Division cannot exceed 20 characters",
                  },
                })}
                placeholder="Division"
                className={`input input-bordered w-full focus:outline-none ${errors.address?.division ? "input-error" : ""
                  }`}
              />
              {errors.address?.division && (
                <span className="text-error text-sm">
                  {errors.address.division.message}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            {/* State */}
            <div className="form-control relative">
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <i className="fa-solid fa-flag text-sm"></i>
                  State
                </span>
              </label>

              <div
                className={`input input-bordered w-full flex items-center justify-between cursor-pointer`}
                onClick={() => setShowStateDropdown(!showStateDropdown)}
              >
                <span className="text-gray-700 dark:text-gray-200">
                  {selectedStateName || "Select State (optional)"}
                </span>
                <i
                  className={`fa-solid fa-chevron-${showStateDropdown ? "up" : "down"} ml-2 text-gray-500`}
                ></i>
              </div>

              {showStateDropdown && (
                <div className="absolute z-10 bg-white dark:bg-[#242627] rounded w-full mt-1 shadow-lg border border-gray-300 dark:border-gray-600">
                  <div className="p-2 sticky top-0 shadow-sm bg-white dark:bg-[#242627]">
                    <input
                      type="text"
                      placeholder="Search State..."
                      className="input input-bordered w-full focus:outline-none bg-white dark:bg-[#242627] text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-500"
                      value={stateSearchInput}
                      onChange={(e) => setStateSearchInput(e.target.value)}
                    />
                  </div>

                  <div className="max-h-40 overflow-y-auto">
                    {filteredStates.length > 0 ? (
                      filteredStates.map((state) => (
                        <p
                          key={state.id}
                          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer text-gray-800 dark:text-gray-200 capitalize"
                          onClick={() => {
                            setValue("address_input.state", state.id.toString());
                            setSelectedStateName(state.name);
                            setStateSearchInput("");
                            setShowStateDropdown(false);
                          }}
                        >
                          {state.name}
                        </p>
                      ))
                    ) : (
                      <p className="p-2 text-gray-500 dark:text-gray-400">No states found</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Country */}
            <div className="form-control relative">
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <i className="fa-solid fa-globe text-sm"></i>
                  Country
                </span>
              </label>

              <div
                className={`input input-bordered w-full flex items-center justify-between cursor-pointer`}
                onClick={() => setShowCountryDropdown(!showCountryDropdown)}
              >
                <span className="text-gray-700 dark:text-gray-200">
                  {selectedCountryName || "Select Country (optional)"}
                </span>
                <i
                  className={`fa-solid fa-chevron-${showCountryDropdown ? "up" : "down"} ml-2 text-gray-500`}
                ></i>
              </div>

              {showCountryDropdown && (
                <div className="absolute z-10 bg-white dark:bg-[#242627] rounded w-full mt-1 shadow-lg border border-gray-300 dark:border-gray-600">
                  <div className="p-2 sticky top-0 shadow-sm bg-white dark:bg-[#242627]">
                    <input
                      type="text"
                      placeholder="Search Country..."
                      className="input input-bordered w-full focus:outline-none bg-white dark:bg-[#242627] text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-500"
                      value={countrySearchInput}
                      onChange={(e) => setCountrySearchInput(e.target.value)}
                    />
                  </div>

                  <div className="max-h-40 overflow-y-auto">
                    {filteredCountries.length > 0 ? (
                      filteredCountries.map((country) => (
                        <p
                          key={country.id}
                          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer text-gray-800 dark:text-gray-200 capitalize"
                          onClick={() => {
                            setValue("address_input.country", country.id.toString());
                            setSelectedCountryName(country.name);
                            setCountrySearchInput("");
                            setShowCountryDropdown(false);
                          }}
                        >
                          {country.name}
                        </p>
                      ))
                    ) : (
                      <p className="p-2 text-gray-500 dark:text-gray-400">No countries found</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Pincode */}
            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <i className="fa-solid fa-mailbox text-sm"></i>
                  Pin Code
                </span>
              </label>
              <input
                type="number"
                {...register("address_input.area_code", {
                  min: { value: 0, message: "Invalid pin code" },
                  max: { value: 999999, message: "Invalid pin code" },
                })}
                placeholder="Pin Code"
                className={`input input-bordered w-full focus:outline-none ${errors.address?.area_code ? "input-error" : ""
                  }`}
              />
              {errors.address?.area_code && (
                <span className="text-error text-sm">
                  {errors.address.area_code.message}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 mt-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <i className="fa-solid fa-location-dot text-sm"></i>
                  Full Address Line
                </span>
              </label>
              <textarea
                maxLength={250}
                {...register("address_input.address_line", {
                  maxLength: {
                    value: 250,
                    message: "Address line cannot exceed 250 characters",
                  },
                })}
                placeholder="Full Address"
                className={`textarea textarea-bordered w-full focus:outline-none ${errors.address?.address_line ? "textarea-error" : ""
                  }`}
              ></textarea>
              {errors.address?.address_line && (
                <span className="text-error text-sm">
                  {errors.address.address_line.message}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Bank Details Section */}
        <div className="bg-base-200 p-6 rounded-box mb-6">
          <h2 className="text-2xl font-bold mb-4">Bank Account Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Account Holder Name */}
            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <i className="fa-solid fa-user text-sm"></i>
                  Account Holder Name
                </span>
              </label>
              <input
                type="text"
                {...register("banking_detail_input.holder_name", {
                  maxLength: {
                    value: 50,
                    message: "Holder name cannot exceed 50 characters",
                  },
                  validate: (value) => {
                    if (!value) return true;
                    if (!/^[A-Za-z]+(?: [A-Za-z]+)*$/.test(value)) {
                      return "Enter a valid name (alphabets & single spaces only)";
                    }
                    return true;
                  },
                })}
                placeholder="Full Name as in Bank (optional)"
                className={`input input-bordered w-full focus:outline-none ${errors.banking_detail_input?.holder_name ? "input-error" : ""
                  }`}
                onInput={(e) => {
                  e.target.value = e.target.value
                    .replace(/[^A-Za-z\s]/g, "")
                    .replace(/\s+/g, " ")
                    .replace(/^\s+/g, "");
                }}
              />
              {errors.banking_detail_input?.holder_name && (
                <span className="text-error text-sm">
                  {errors.banking_detail_input.holder_name.message}
                </span>
              )}
            </div>

            {/* Account Number */}
            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <i className="fa-solid fa-credit-card text-sm"></i>
                  Account Number
                </span>
              </label>
              <input
                type="text"
                {...register("banking_detail_input.account_no", {
                  validate: (value) => {
                    if (!value) return true;
                    if (!/^[0-9]{9,18}$/.test(value)) {
                      return "Account number must be 9 to 18 digits";
                    }
                    return true;
                  },
                })}
                placeholder="Account Number (optional)"
                className={`input input-bordered w-full focus:outline-none ${errors.banking_detail_input?.account_no ? "input-error" : ""
                  }`}
                onInput={(e) => {
                  e.target.value = e.target.value.replace(/[^0-9]/g, "");
                }}
              />
              {errors.banking_detail_input?.account_no && (
                <span className="text-error text-sm">
                  {errors.banking_detail_input.account_no.message}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* IFSC Code */}
            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <i className="fa-solid fa-code text-sm"></i>
                  IFSC Code
                </span>
              </label>
              <input
                type="text"
                {...register("banking_detail_input.ifsc_code", {
                  validate: (value) => {
                    if (!value) return true;
                    if (!/^[A-Z]{4}[0-9A-Z][A-Z0-9]{6}$/.test(value)) {
                      return "Invalid IFSC code format (e.g. SBIN0001234)";
                    }
                    return true;
                  },
                })}
                placeholder="eg: SBIN0001234 (optional)"
                className={`input input-bordered w-full focus:outline-none ${errors.banking_detail_input?.ifsc_code ? "input-error" : ""
                  }`}
                onInput={(e) => {
                  e.target.value = e.target.value
                    .toUpperCase()
                    .replace(/[^A-Z0-9]/g, "");
                }}
                maxLength={11}
              />
              {errors.banking_detail_input?.ifsc_code && (
                <span className="text-error text-sm">
                  {errors.banking_detail_input.ifsc_code.message}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center mt-10">
          <button type="submit" className="btn bgTheme text-white w-40">
            {loading ? (
              <i className="fa-solid fa-spinner fa-spin mr-2"></i>
            ) : (
              <i className="fa-solid fa-paper-plane mr-2"></i>
            )}
            {loading ? "" : "Register"}
          </button>
        </div>
      </form>
      {showAdmissionSuccessModal && (
        <AdmissionSuccessful
          handleCloseOnly={handleCloseOnly}
          handleCloseAndNavigate={handleCloseAndNavigate}
        />
      )}
      {/* Modal */}
      {showAlert && (
        <dialog open className="modal modal-open">
          <div className="modal-box dark:bg-gray-800 dark:text-gray-100">
            <h3 className="font-bold text-lg">Admission Form</h3>
            <p className="py-4">{alertMessage}</p>
            <div className="modal-action">
              <button
                className="btn bgTheme text-white w-30"
                onClick={() => setShowAlert(false)}
              >
                OK
              </button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
};





// import React, { useEffect, useRef, useState } from "react";
// import { useForm } from "react-hook-form";
// import {
//   fetchGuardianType,
//   fetchSchoolYear,
//   fetchYearLevels,
//   fetchCountry,
//   fetchState,
//   fetchCity,
//   handleAdmissionForm,
// } from "../../services/api/Api";
// import { constants } from "../../global/constants";
// import { data, useNavigate } from "react-router-dom";
// import AdmissionSuccessful from "../Modals/AdmissionSuccessful";

// export const AdmissionForm = () => {
//   const navigate = useNavigate();
//   const [yearLevel, setYearLevel] = useState([]);
//   const [schoolYears, setSchoolYear] = useState([]);
//   const [guardianTypes, setGuardianType] = useState([]);
//   const [showPassword, setShowPassword] = useState(true);
//   const [showGuardianPassword, setShowGuardianPassword] = useState(true);
//   const [country, setCountry] = useState([]);
//   const [state, setState] = useState([]);
//   const [city, setCity] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [showAlert, setShowAlert] = useState(false);
//   const [alertMessage, setAlertMessage] = useState("");
//   const [selectedGuardianType, setSelectedGuardianType] = useState("");
//   const formRef = useRef(null);
//   const [showAdmissionSuccessModal, setShowAdmissionSuccessModal] =
//     useState(false);
//   const [isRTE, setIsRTE] = useState(false);

//   const [showCityDropdown, setShowCityDropdown] = useState(false);
//   const [selectedCityName, setSelectedCityName] = useState("");
//   const [citySearchInput, setCitySearchInput] = useState("");

//   const [showCountryDropdown, setShowCountryDropdown] = useState(false);
//   const [selectedCountryName, setSelectedCountryName] = useState("");
//   const [countrySearchInput, setCountrySearchInput] = useState("");

//   const [showStateDropdown, setShowStateDropdown] = useState(false);
//   const [selectedStateName, setSelectedStateName] = useState("");
//   const [stateSearchInput, setStateSearchInput] = useState("");



//   const {
//     register,
//     watch,
//     handleSubmit,
//     formState: { errors },
//     setValue,
//     reset,
//     resetField,
//   } = useForm({
//     mode: "onChange",
//     defaultValues: {
//       student: {
//         first_name: "",
//         middle_name: "",
//         last_name: "",
//         email: "",
//         password: "",
//         father_name: "",
//         mother_name: "",
//         date_of_birth: "",
//         gender: "",
//         religion: "",
//         category: null,
//         height: null,
//         weight: null,
//         blood_group: "",
//         number_of_siblings: "",
//         roll_number: null,
//         scholar_number: null,
//         contact_number: "",
//       },
//       guardian: {
//         first_name: "",
//         middle_name: "",
//         last_name: "",
//         email: "",
//         password: "",
//         phone_no: "",
//         annual_income: "",
//         means_of_livelihood: "",
//         qualification: "",
//         occupation: "",
//         designation: "",
//       },
//       address_input: {
//         house_no: "",
//         habitation: "",
//         ward_no: "",
//         zone_no: "",
//         block: "",
//         district: "",
//         division: "",
//         area_code: "",
//         country: "",
//         state: "",
//         city: "",
//         address_line: "",
//       },
//       banking_detail_input: {
//         account_no: "",
//         ifsc_code: "",
//         holder_name: "",
//       },
//       guardian_type_input: "",
//       year_level: "",
//       school_year: "",
//       previous_school_name: "",
//       previous_standard_studied: "",
//       tc_letter: "",
//       emergency_contact_no: "",
//       entire_road_distance_from_home_to_school: "",
//       obtain_marks: "",
//       total_marks: "",
//       is_rte: false,
//       rte_number: "",
//     },
//   });

//   const handleShowPassword = () => setShowPassword(!showPassword);
//   const handleShowGuardianPassword = () =>
//     setShowGuardianPassword(!showGuardianPassword);
//   const handleGuardianTypesChange = (e) => {
//     setSelectedGuardianType(e.target.value);
//     setValue("guardian_type_input", e.target.value);
//   };

//   const handleRTECheckboxChange = (e) => {
//     const isChecked = e.target.checked;
//     setIsRTE(isChecked);
//     setValue("is_rte", isChecked);

//     // Clear RTE number field when unchecked
//     if (!isChecked) {
//       resetField("rte_number");
//     }
//   };

//   const getYearLevels = async () => {
//     try {
//       const yearLevels = await fetchYearLevels();
//       setYearLevel(yearLevels);
//     } catch (err) {
//       console.log("Failed to load year levels. Please try again.");
//     }
//   };

//   const getSchoolYears = async () => {
//     try {
//       const schoolYears = await fetchSchoolYear();
//       setSchoolYear(schoolYears);
//     } catch (err) {
//       console.log("Failed to load school years. Please try again.");
//     }
//   };

//   const getGuardianType = async () => {
//     try {
//       const guardianType = await fetchGuardianType();
//       setGuardianType(guardianType);
//     } catch (error) {
//       console.log("Failed to load guardian type. Please try again.");
//     }
//   };

//   const getCountry = async () => {
//     try {
//       const countryList = await fetchCountry();
//       setCountry(countryList);
//     } catch (err) {
//       console.log("Failed to load countries. Please try again.");
//     }
//   };

//   const getState = async () => {
//     try {
//       const stateList = await fetchState();
//       setState(stateList);
//     } catch (err) {
//       console.log("Failed to load states. Please try again.");
//     }
//   };

//   const getCity = async () => {
//     try {
//       const cityList = await fetchCity();
//       setCity(cityList);
//     } catch (err) {
//       console.log("Failed to load cities. Please try again.");
//     }
//   };

//   useEffect(() => {
//     const fetchAllData = async () => {
//       try {
//         setLoading(true); // loader start
//         setError(null);

//         await Promise.all([
//           getYearLevels(),
//           getSchoolYears(),
//           getGuardianType(),
//           getCountry(),
//           getState(),
//           getCity(),
//         ]);
//       } catch (err) {
//         setError("Failed to fetch data");
//       } finally {
//         setLoading(false); // loader stop
//       }
//     };

//     fetchAllData();
//   }, []);

//   // const onSubmit = async (data) => {
//   //   setLoading(true);
//   //   const submitFormData = new FormData();

//   //   data.student.roll_number = null;
//   //   data.student.scholar_number = null;
//   //   data.student.contact_number = data.guardian.phone_no;

//   //   // Append all payload data to FormData
//   //   Object.entries(data).forEach(([key, value]) => {
//   //     if (typeof value === "object" && value !== null) {
//   //       Object.entries(value).forEach(([subKey, subValue]) => {
//   //         submitFormData.append(`${key}[${subKey}]`, subValue);
//   //       });
//   //     } else {
//   //       submitFormData.append(key, value);
//   //     }
//   //   });

//   //   // Append files separately
//   //   if (data.student_user_profile) {
//   //     submitFormData.append(
//   //       "student[profile_picture]",
//   //       data.student_user_profile[0]
//   //     );
//   //   }
//   //   if (data.guardian_user_profile) {
//   //     submitFormData.append(
//   //       "guardian[profile_picture]",
//   //       data.guardian_user_profile[0]
//   //     );
//   //   }

//   //   try {
//   //     const debugPayload = {};
//   //     for (let [key, value] of submitFormData.entries()) {
//   //       debugPayload[key] = value;
//   //     }
//   //     console.log("FormData Payload:", debugPayload);
//   //     await handleAdmissionForm(submitFormData);
//   //     // Show success modal after successful submission
//   //     setShowAdmissionSuccessModal(true);
//   //     reset();
//   //     setSelectedGuardianType("");
//   //     setIsRTE(false);
//   //   } catch (error) {
//   //     setAlertMessage(
//   //       `Failed to submit the form: ${error.response?.data?.message || error.message
//   //       }`
//   //     );
//   //     setShowAlert(true);
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };

//   const onSubmit = async (data) => {
//     setLoading(true);
//     const submitFormData = new FormData();

//     data.student.roll_number = null;
//     data.student.scholar_number = null;
//     data.student.contact_number = data.guardian.phone_no;

//     let accountNoValue = data.banking_detail_input.account_no?.trim();
//     if (accountNoValue) {
//       accountNoValue = parseInt(accountNoValue, 10);
//       data.banking_detail_input.account_no = accountNoValue;
//     } else {
//       delete data.banking_detail_input.account_no;
//     }

//     // Append all payload data to FormData
//     Object.entries(data).forEach(([key, value]) => {
//       if (typeof value === "object" && value !== null) {
//         Object.entries(value).forEach(([subKey, subValue]) => {
//           if (key === "banking_detail_input" && subKey === "account_no" && subValue === undefined) {
//             return;
//           }
//           submitFormData.append(`${key}[${subKey}]`, subValue);
//         });
//       } else {
//         submitFormData.append(key, value);
//       }
//     });

//     if (data.student_user_profile) {
//       submitFormData.append(
//         "student[profile_picture]",
//         data.student_user_profile[0]
//       );
//     }
//     if (data.guardian_user_profile) {
//       submitFormData.append(
//         "guardian[profile_picture]",
//         data.guardian_user_profile[0]
//       );
//     }

//     try {
//       const debugPayload = {};
//       for (let [key, value] of submitFormData.entries()) {
//         debugPayload[key] = value;
//       }
//       console.log("FormData Payload:", debugPayload);

//       await handleAdmissionForm(submitFormData);
//       setShowAdmissionSuccessModal(true);
//       reset();
//       setSelectedGuardianType("");
//       setIsRTE(false);
//     } catch (error) {
//       setAlertMessage(
//         `Failed to submit the form: ${error.response?.data?.message || error.message
//         }`
//       );
//       setShowAlert(true);
//     } finally {
//       setLoading(false);
//     }
//   };


//   const handleCloseOnly = () => {
//     setShowAdmissionSuccessModal(false);
//   };

//   const handleCloseAndNavigate = () => {
//     setShowAdmissionSuccessModal(false);
//     navigate("/addmissionDetails");
//   };

//   const filteredCities = city
//     .filter((c) =>
//       c.name.toLowerCase().includes(citySearchInput.toLowerCase())
//     )
//     .sort((a, b) => a.name.localeCompare(b.name));

//   const filteredCountries = country
//     .filter((c) =>
//       c.name.toLowerCase().includes(countrySearchInput.toLowerCase())
//     )
//     .sort((a, b) => a.name.localeCompare(b.name));



//   const filteredStates = state
//     .filter((s) =>
//       s.name.toLowerCase().includes(stateSearchInput.toLowerCase())
//     )
//     .sort((a, b) => a.name.localeCompare(b.name));

//   useEffect(() => {
//     register("address_input.country", { required: "Country is required" });
//     register("address_input.state", { required: "State is required" });
//     register("address_input.city", { required: "City is required" });
//   }, [register]);

//   if (loading) {
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

//   if (error) {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-screen text-center p-6">
//         <i className="fa-solid fa-triangle-exclamation text-5xl text-red-400 mb-4"></i>
//         <p className="text-lg text-red-400 font-medium">
//           Failed to load data, Try Again
//         </p>
//       </div>
//     );
//   }

//   return (
//     <div className="mb-24 md:mb-10">
//       <style>{constants.hideEdgeRevealStyle}</style>
//       <form
//         ref={formRef}
//         className="w-full max-w-7xl mx-auto p-6 bg-base-100 rounded-box my-5 shadow-sm focus:outline-none mb-10"
//         onSubmit={handleSubmit(onSubmit)}
//       >
//         <h1 className="text-3xl font-bold text-center mb-8">
//           Admission Form<i className="fa-solid fa-graduation-cap ml-2"></i>
//         </h1>

//         {/* Student Information Section */}
//         <div className="bg-base-200 p-6 rounded-box mb-6">
//           <h2 className="text-2xl font-bold mb-4">Student Information</h2>
//           <div className="grid grid-cols-1 md:grid-cols-1 mb-3">
//             <div className="form-control">
//               <label className="label cursor-pointer">
//                 <span className="label-text flex items-center gap-2">
//                   <i className="fa-solid fa-child-reaching text-sm"></i>
//                   Is RTE Student?
//                 </span>
//                 <input
//                   type="checkbox"
//                   {...register("is_rte")}
//                   onChange={handleRTECheckboxChange}
//                   className="checkbox checkbox-primary"
//                 />
//               </label>
//             </div>
//           </div>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//             <div className="form-control">
//               <label className="label">
//                 <span className="label-text flex items-center gap-2">
//                   <i className="fa-solid fa-user text-sm"></i>
//                   First Name <span className="text-error">*</span>
//                 </span>
//               </label>
//               <input
//                 type="text"
//                 {...register("student.first_name", {
//                   required: "First name is required",
//                   maxLength: {
//                     value: 100,
//                     message: "First name cannot exceed 100 characters",
//                   },
//                 })}
//                 placeholder="First Name"
//                 className={`input input-bordered w-full focus:outline-none ${errors.student?.first_name ? "input-error" : ""
//                   }`}
//               />
//               {errors.student?.first_name && (
//                 <span className="text-error text-sm">
//                   {errors.student.first_name.message}
//                 </span>
//               )}
//             </div>
//             <div className="form-control">
//               <label className="label">
//                 <span className="label-text flex items-center gap-2">
//                   <i className="fa-solid fa-user-pen text-sm"></i>
//                   Middle Name
//                 </span>
//               </label>
//               <input
//                 type="text"
//                 {...register("student.middle_name", {
//                   maxLength: {
//                     value: 100,
//                     message: "Middle name cannot exceed 100 characters",
//                   },
//                 })}
//                 placeholder="Middle Name"
//                 className="input input-bordered w-full focus:outline-none"
//               />
//               {errors.student?.middle_name && (
//                 <span className="text-error text-sm">
//                   {errors.student.middle_name.message}
//                 </span>
//               )}
//             </div>
//             <div className="form-control">
//               <label className="label">
//                 <span className="label-text flex items-center gap-2">
//                   <i className="fa-solid fa-user-tag text-sm"></i>
//                   Last Name <span className="text-error">*</span>
//                 </span>
//               </label>
//               <input
//                 type="text"
//                 {...register("student.last_name", {
//                   required: "Last name is required",
//                   maxLength: {
//                     value: 100,
//                     message: "Last name cannot exceed 100 characters",
//                   },
//                 })}
//                 placeholder="Last Name"
//                 className={`input input-bordered w-full focus:outline-none ${errors.student?.last_name ? "input-error" : ""
//                   }`}
//               />
//               {errors.student?.last_name && (
//                 <span className="text-error text-sm">
//                   {errors.student.last_name.message}
//                 </span>
//               )}
//             </div>
//           </div>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
//             <div className="form-control">
//               <label className="label">
//                 <span className="label-text flex items-center gap-2">
//                   <i className="fa-solid fa-envelope text-sm"></i>
//                   Email <span className="text-error">*</span>
//                 </span>
//               </label>
//               <input
//                 type="email"
//                 {...register("student.email", {
//                   required: "Email is required",
//                   pattern: {
//                     value: /^\S+@\S+\.\S+$/,
//                     message: "Invalid email format",
//                   },
//                 })}
//                 placeholder="student@example.com"
//                 className={`input input-bordered w-full focus:outline-none ${errors.student?.email ? "input-error" : ""
//                   }`}
//               />
//               {errors.student?.email && (
//                 <span className="text-error text-sm">
//                   {errors.student.email.message}
//                 </span>
//               )}
//             </div>
//             <div className="form-control relative">
//               <label className="label">
//                 <span className="label-text flex items-center gap-2">
//                   <i className="fa-solid fa-lock text-sm"></i>
//                   Password <span className="text-error">*</span>
//                 </span>
//               </label>
//               <input
//                 type={showPassword ? "password" : "text"}
//                 {...register("student.password", {
//                   required: "Password is required",
//                   maxLength: {
//                     value: 100,
//                     message: "Password cannot exceed 100 characters",
//                   },
//                   pattern: {
//                     value:
//                       /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
//                     message:
//                       "Password must be 8+ chars with uppercase, lowercase, number and special character",
//                   },
//                 })}
//                 placeholder="eg : Password@123"
//                 className={`input input-bordered w-full pr-10 focus:outline-none ${errors.student?.password ? "input-error" : ""
//                   }`}
//               />
//               <button
//                 type="button"
//                 className="passwordEyes text-gray-500"
//                 onClick={handleShowPassword}
//               >
//                 <i
//                   className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"
//                     }`}
//                 ></i>
//               </button>
//               {errors.student?.password && (
//                 <span className="text-error text-sm">
//                   {errors.student.password.message}
//                 </span>
//               )}
//             </div>
//           </div>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
//             <div className="form-control">
//               <label className="label">
//                 <span className="label-text flex items-center gap-2">
//                   <i className="fa-solid fa-calendar-days text-sm"></i>
//                   Date of Birth <span className="text-error">*</span>
//                 </span>
//               </label>
//               <input
//                 type="date"
//                 max={new Date().toISOString().split("T")[0]}
//                 {...register("student.date_of_birth", {
//                   required: "Date of birth is required",
//                   validate: (value) => {
//                     const selectedDate = new Date(value);
//                     const today = new Date();
//                     if (selectedDate > today) {
//                       return "Future dates are not allowed";
//                     }
//                     return true;
//                   },
//                 })}
//                 className={`input input-bordered w-full focus:outline-none ${errors.student?.date_of_birth ? "input-error" : ""
//                   }`}
//               />
//               {errors.student?.date_of_birth && (
//                 <span className="text-error text-sm">
//                   {errors.student.date_of_birth.message}
//                 </span>
//               )}
//             </div>

//             <div className="form-control">
//               <label className="label">
//                 <span className="label-text flex items-center gap-2">
//                   <i className="fa-solid fa-venus-mars text-sm"></i>
//                   Gender <span className="text-error">*</span>
//                 </span>
//               </label>
//               <select
//                 {...register("student.gender", {
//                   required: "Gender is required",
//                 })}
//                 className={`select select-bordered w-full focus:outline-none cursor-pointer ${errors.student?.gender ? "select-error" : ""
//                   }`}
//               >
//                 <option value="">Select Gender</option>
//                 <option value="Female">Female</option>
//                 <option value="Male">Male</option>
//                 <option value="Other">Other</option>
//               </select>

//               {errors.student?.gender && (
//                 <span className="text-error text-sm">
//                   {errors.student.gender.message}
//                 </span>
//               )}
//             </div>
//           </div>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
//             <div className="form-control">
//               <label className="label">
//                 <span className="label-text flex items-center gap-2">
//                   <i className="fa-solid fa-user text-sm"></i>
//                   Father's Name <span className="text-error">*</span>
//                 </span>
//               </label>
//               <input
//                 type="text"
//                 {...register("student.father_name", {
//                   required: "Father's name is required",
//                   maxLength: {
//                     value: 100,
//                     message: "Father's name cannot exceed 100 characters",
//                   },
//                 })}
//                 placeholder="Father's Name"
//                 className={`input input-bordered w-full focus:outline-none ${errors.student?.father_name ? "input-error" : ""
//                   }`}
//               />
//               {errors.student?.father_name && (
//                 <span className="text-error text-sm">
//                   {errors.student.father_name.message}
//                 </span>
//               )}
//             </div>
//             <div className="form-control">
//               <label className="label">
//                 <span className="label-text flex items-center gap-2">
//                   <i className="fa-solid fa-user text-sm"></i>
//                   Mother's Name <span className="text-error">*</span>
//                 </span>
//               </label>
//               <input
//                 type="text"
//                 {...register("student.mother_name", {
//                   required: "Mother's name is required",
//                   maxLength: {
//                     value: 100,
//                     message: "Mother's name cannot exceed 100 characters",
//                   },
//                 })}
//                 placeholder="Mother's Name"
//                 className={`input input-bordered w-full focus:outline-none ${errors.student?.mother_name ? "input-error" : ""
//                   }`}
//               />
//               {errors.student?.mother_name && (
//                 <span className="text-error text-sm">
//                   {errors.student.mother_name.message}
//                 </span>
//               )}
//             </div>
//             <div className="form-control">
//               <label className="label">
//                 <span className="label-text flex items-center gap-2">
//                   <i className="fa-solid fa-hands-praying text-sm"></i>
//                   Religion <span className="text-error">*</span>
//                 </span>
//               </label>
//               <input
//                 type="text"
//                 {...register("student.religion", {
//                   required: "Religion is required",
//                   maxLength: {
//                     value: 100,
//                     message: "Religion cannot exceed 100 characters",
//                   },
//                 })}
//                 placeholder="Religion"
//                 className={`input input-bordered w-full focus:outline-none ${errors.student?.religion ? "input-error" : ""
//                   }`}
//               />
//               {errors.student?.religion && (
//                 <span className="text-error text-sm">
//                   {errors.student.religion.message}
//                 </span>
//               )}
//             </div>
//           </div>
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
//             <div className="form-control">
//               <label className="label">
//                 <span className="label-text flex items-center gap-2">
//                   <i className="fa-solid fa-tag text-sm"></i>
//                   Category <span className="text-error">*</span>
//                 </span>
//               </label>
//               <select
//                 {...register("student.category", {
//                   required: "Category is required",
//                 })}
//                 className={`select select-bordered w-full focus:outline-none cursor-pointer ${errors.student?.category ? "select-error" : ""
//                   }`}
//               >
//                 <option value="">Select Category</option>
//                 <option value="GEN">General</option>
//                 <option value="OBC">Other Backward Class</option>
//                 <option value="SC">Scheduled Caste</option>
//                 <option value="ST">Scheduled Tribe</option>
//               </select>
//               {errors.student?.category && (
//                 <span className="text-error text-sm">
//                   {errors.student.category.message}
//                 </span>
//               )}
//             </div>
//             <div className="form-control">
//               <label className="label">
//                 <span className="label-text flex items-center gap-2">
//                   <i className="fa-solid fa-ruler-vertical text-sm"></i>
//                   Height (cm)
//                 </span>
//               </label>
//               <input
//                 type="number"
//                 {...register("student.height", {
//                   min: { value: 0, message: "Height must be positive" },
//                 })}
//                 placeholder="Height"
//                 className={`input input-bordered w-full focus:outline-none ${errors.student?.height ? "input-error" : ""
//                   }`}
//                 min={0} // prevents down arrow from going negative
//                 onKeyDown={(e) => {
//                   if (e.key === "-" || e.key === "e") e.preventDefault(); // prevents typing negative or 'e'
//                 }}
//                 onWheel={(e) => e.target.blur()} // prevents scroll changing value
//               />
//               {errors.student?.height && (
//                 <span className="text-error text-sm">
//                   {errors.student.height.message}
//                 </span>
//               )}
//             </div>

//             <div className="form-control">
//               <label className="label">
//                 <span className="label-text flex items-center gap-2">
//                   <i className="fa-solid fa-weight-scale text-sm"></i>
//                   Weight (kg)
//                 </span>
//               </label>
//               <input
//                 type="number"
//                 {...register("student.weight", {
//                   min: { value: 0, message: "Weight must be positive" },
//                 })}
//                 placeholder="Weight"
//                 className={`input input-bordered w-full focus:outline-none ${errors.student?.weight ? "input-error" : ""
//                   }`}
//               />
//               {errors.student?.weight && (
//                 <span className="text-error text-sm">
//                   {errors.student.weight.message}
//                 </span>
//               )}
//             </div>
//             <div className="form-control">
//               <label className="label">
//                 <span className="label-text flex items-center gap-2">
//                   <i className="fa-solid fa-heart-pulse text-sm"></i>
//                   Blood Group
//                 </span>
//               </label>
//               <select
//                 {...register("student.blood_group")}
//                 className="select select-bordered w-full focus:outline-none cursor-pointer"
//               >
//                 <option value="">Select Blood Group</option>
//                 <option value="A+">A+</option>
//                 <option value="A-">A-</option>
//                 <option value="B+">B+</option>
//                 <option value="B-">B-</option>
//                 <option value="O+">O+</option>
//                 <option value="O-">O-</option>
//                 <option value="AB+">AB+</option>
//                 <option value="AB-">AB-</option>
//               </select>
//             </div>
//           </div>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
//             <div className="form-control">
//               <label className="label">
//                 <span className="label-text flex items-center gap-2">
//                   <i className="fa-solid fa-people-group text-sm"></i>
//                   Number of Siblings
//                 </span>
//               </label>
//               <input
//                 type="number"
//                 {...register("student.number_of_siblings", {
//                   required: "Number of siblings is required",
//                   min: {
//                     value: 0,
//                     message: "Number of siblings cannot be negative",
//                   },
//                   max: {
//                     value: 15,
//                     message: "Sibling cannot exceed more than 15",
//                   },
//                   validate: (value) => {
//                     if (value < 0) return "Number of siblings cannot be negative";
//                     if (value > 15) return "Sibling cannot exceed more than 15";
//                     return true;
//                   },
//                 })}
//                 placeholder="Number of Siblings"
//                 onInput={(e) => {
//                   const value = e.target.value;
//                   // Negative and 15+ value block
//                   if (value < 0) e.target.value = 0;
//                   if (value > 15) e.target.value = 15;
//                 }}
//                 className={`input input-bordered w-full focus:outline-none ${errors.student?.number_of_siblings ? "input-error" : ""
//                   }`}
//               />
//               {errors.student?.number_of_siblings && (
//                 <span className="text-error text-sm">
//                   {errors.student.number_of_siblings.message}
//                 </span>
//               )}
//             </div>

//             {/*RTE number field Render only when isRTE is true */}
//             {isRTE && (
//               <div className="form-control">
//                 <label className="label">
//                   <span className="label-text flex items-center gap-2">
//                     <i className="fa-solid fa-id-card text-sm"></i>
//                     RTE Number <span className="text-error">*</span>
//                   </span>
//                 </label>
//                 <input
//                   type="text"
//                   maxLength={50}
//                   {...register("rte_number", {
//                     required: "RTE number is required for RTE students",
//                     maxLength: {
//                       value: 50,
//                       message: "RTE number cannot exceed 50 characters",
//                     },
//                   })}
//                   placeholder="RTE Number"
//                   className={`input input-bordered w-full focus:outline-none ${errors.rte_number ? "input-error" : ""
//                     }`}
//                 />
//                 {errors.rte_number && (
//                   <span className="text-error text-sm">
//                     {errors.rte_number.message}
//                   </span>
//                 )}
//               </div>
//             )}
//           </div>
//         </div>

// {/* Guardian Information Section */}
// <div className="bg-base-200 p-6 rounded-box mb-6">
//   <h2 className="text-2xl font-bold mb-4">Guardian Information</h2>
//   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//     <div className="form-control">
//       <label className="label">
//         <span className="label-text flex items-center gap-2">
//           <i className="fa-solid fa-user text-sm"></i>
//           First Name <span className="text-error">*</span>
//         </span>
//       </label>
//       <input
//         type="text"
//         {...register("guardian.first_name", {
//           required: "First name is required",
//           maxLength: {
//             value: 100,
//             message: "First name cannot exceed 100 characters",
//           },
//         })}
//         placeholder="First Name"
//         className={`input input-bordered w-full focus:outline-none ${errors.guardian?.first_name ? "input-error" : ""
//           }`}
//       />
//       {errors.guardian?.first_name && (
//         <span className="text-error text-sm">
//           {errors.guardian.first_name.message}
//         </span>
//       )}
//     </div>
//     <div className="form-control">
//       <label className="label">
//         <span className="label-text flex items-center gap-2">
//           <i className="fa-solid fa-user-pen text-sm"></i>
//           Middle Name
//         </span>
//       </label>
//       <input
//         type="text"
//         {...register("guardian.middle_name", {
//           maxLength: {
//             value: 100,
//             message: "Middle name cannot exceed 100 characters",
//           },
//         })}
//         placeholder="Middle Name"
//         className="input input-bordered w-full focus:outline-none"
//       />
//       {errors.guardian?.middle_name && (
//         <span className="text-error text-sm">
//           {errors.guardian.middle_name.message}
//         </span>
//       )}
//     </div>
//     <div className="form-control">
//       <label className="label">
//         <span className="label-text flex items-center gap-2">
//           <i className="fa-solid fa-user-tag text-sm"></i>
//           Last Name <span className="text-error">*</span>
//         </span>
//       </label>
//       <input
//         type="text"
//         {...register("guardian.last_name", {
//           required: "Last name is required",
//           maxLength: {
//             value: 100,
//             message: "Last name cannot exceed 100 characters",
//           },
//         })}
//         placeholder="Last Name"
//         className={`input input-bordered w-full focus:outline-none ${errors.guardian?.last_name ? "input-error" : ""
//           }`}
//       />
//       {errors.guardian?.last_name && (
//         <span className="text-error text-sm">
//           {errors.guardian.last_name.message}
//         </span>
//       )}
//     </div>
//   </div>
//   <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
//     <div className="form-control">
//       <label className="label">
//         <span className="label-text flex items-center gap-2">
//           <i className="fa-solid fa-envelope text-sm"></i>
//           Email <span className="text-error">*</span>
//         </span>
//       </label>
//       <input
//         type="email"
//         {...register("guardian.email", {
//           required: "Email is required",
//           pattern: {
//             value: /^\S+@\S+\.\S+$/,
//             message: "Invalid email format",
//           },
//         })}
//         placeholder="guardian@example.com"
//         className={`input input-bordered w-full focus:outline-none ${errors.guardian?.email ? "input-error" : ""
//           }`}
//       />
//       {errors.guardian?.email && (
//         <span className="text-error text-sm">
//           {errors.guardian.email.message}
//         </span>
//       )}
//     </div>
//     <div className="form-control relative">
//       <label className="label">
//         <span className="label-text flex items-center gap-2">
//           <i className="fa-solid fa-lock text-sm"></i>
//           Password <span className="text-error">*</span>
//         </span>
//       </label>
//       <input
//         type={showGuardianPassword ? "password" : "text"}
//         {...register("guardian.password", {
//           required: "Password is required",
//           maxLength: {
//             value: 100,
//             message: "Password cannot exceed 100 characters",
//           },
//           pattern: {
//             value:
//               /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
//             message:
//               "Password must be 8+ chars with uppercase, lowercase, number and special character",
//           },
//         })}
//         placeholder="eg: Password@123"
//         className={`input input-bordered w-full pr-10 focus:outline-none ${errors.guardian?.password ? "input-error" : ""
//           }`}
//       />
//       <button
//         type="button"
//         className="passwordEyes text-gray-500"
//         onClick={handleShowGuardianPassword}
//       >
//         <i
//           className={`fa-solid ${showGuardianPassword ? "fa-eye-slash" : "fa-eye"
//             }`}
//         ></i>
//       </button>
//       {errors.guardian?.password && (
//         <span className="text-error text-sm">
//           {errors.guardian.password.message}
//         </span>
//       )}
//     </div>
//     <div className="form-control">
//       <label className="label">
//         <span className="label-text flex items-center gap-2">
//           <i className="fa-solid fa-user-shield text-sm"></i>
//           Guardian Type <span className="text-error">*</span>
//         </span>
//       </label>
//       <select
//         {...register("guardian_type_input", {
//           required: "Guardian type is required",
//         })}
//         className={`select select-bordered w-full focus:outline-none cursor-pointer ${errors.guardian_type_input ? "select-error" : ""
//           }`}
//         value={selectedGuardianType}
//         onChange={handleGuardianTypesChange}
//       >
//         <option value="">Select Guardian Type</option>
//         {guardianTypes.map((guardianTy) => (
//           <option value={guardianTy.name} key={guardianTy.id}>
//             {guardianTy.name}
//           </option>
//         ))}
//       </select>
//       {errors.guardian_type_input && (
//         <span className="text-error text-sm">
//           {errors.guardian_type_input.message}
//         </span>
//       )}
//     </div>
//     <div className="form-control">
//       <label className="label">
//         <span className="label-text flex items-center gap-2">
//           <i className="fa-solid fa-phone text-sm"></i>
//           Phone Number <span className="text-error">*</span>
//         </span>
//       </label>
//       <input
//         type="tel"
//         {...register("guardian.phone_no", {
//           required: "Phone number is required",
//           pattern: {
//             value: /^[6789]\d{9}$/,
//             message:
//               "Phone number must start with 6, 7, 8, or 9 and be exactly 10 digits",
//           },
//           minLength: {
//             value: 10,
//             message: "Phone number must be exactly 10 digits",
//           },
//           maxLength: {
//             value: 10,
//             message: "Phone number must be exactly 10 digits",
//           },
//           validate: {
//             validStart: (value) =>
//               /^[6789]/.test(value) ||
//               "Phone number must start with 6, 7, 8, or 9",
//           },
//         })}
//         placeholder="Phone Number"
//         className={`input input-bordered w-full focus:outline-none ${errors.guardian?.phone_no ? "input-error" : ""
//           }`}
//         onInput={(e) => {
//           // Remove any non-digit characters
//           e.target.value = e.target.value.replace(/\D/g, "");
//           // Limit to 10 digits
//           if (e.target.value.length > 10) {
//             e.target.value = e.target.value.slice(0, 10);
//           }
//         }}
//         onKeyDown={(e) => {
//           // Prevent typing of non-numeric characters except Backspace, Tab, Delete, Arrow keys
//           if (
//             !/[\d]|Backspace|Tab|Delete|ArrowLeft|ArrowRight|ArrowUp|ArrowDown/.test(
//               e.key
//             )
//           ) {
//             e.preventDefault();
//           }

//           // Prevent typing if first character is not 6,7,8,9 when at position 0
//           if (e.target.selectionStart === 0 && /[0-5]/.test(e.key)) {
//             e.preventDefault();
//           }
//         }}
//         onPaste={(e) => {
//           // Get pasted data
//           const pastedData = e.clipboardData
//             .getData("text")
//             .replace(/\D/g, "");

//           // Check if pasted data starts with valid digit
//           if (!/^[6789]/.test(pastedData)) {
//             e.preventDefault();
//             // Optional: Show a temporary message
//             alert("Pasted phone number must start with 6, 7, 8, or 9");
//           }
//         }}
//       />
//       {errors.guardian?.phone_no && (
//         <span className="text-error text-sm">
//           {errors.guardian.phone_no.type === "validStart"
//             ? errors.guardian.phone_no.message
//             : errors.guardian.phone_no.message}
//         </span>
//       )}
//     </div>
//   </div>
//   <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
//     <div className="form-control">
//       <label className="label">
//         <span className="label-text flex items-center gap-2">
//           <i className="fa-solid fa-money-bill-wave text-sm"></i>
//           Annual Income <span className="text-error">*</span>
//         </span>
//       </label>
//       <input
//         type="number"
//         {...register("guardian.annual_income", {
//           required: "Annual income is required",
//           min: {
//             value: 0,
//             message: "Annual income cannot be negative",
//           },
//         })}
//         placeholder="Annual Income"
//         className={`input input-bordered w-full focus:outline-none ${errors.guardian?.annual_income ? "input-error" : ""
//           }`}
//       />
//       {errors.guardian?.annual_income && (
//         <span className="text-error text-sm">
//           {errors.guardian.annual_income.message}
//         </span>
//       )}
//     </div>
//     <div className="form-control">
//       <label className="label">
//         <span className="label-text flex items-center gap-2">
//           <i className="fa-solid fa-briefcase text-sm"></i>
//           Means of Livelihood
//         </span>
//       </label>
//       <select
//         {...register("guardian.means_of_livelihood")}
//         className="select select-bordered w-full focus:outline-none cursor-pointer"
//       >
//         <option value="">Select</option>
//         <option value="Govt">Government</option>
//         <option value="Non-Govt">Non-Government</option>
//       </select>
//     </div>
//     <div className="form-control">
//       <label className="label">
//         <span className="label-text flex items-center gap-2">
//           <i className="fa-solid fa-graduation-cap text-sm"></i>
//           Qualification <span className="text-error">*</span>
//         </span>
//       </label>
//       <input
//         type="text"
//         {...register("guardian.qualification", {
//           required: "Qualification is required",
//           maxLength: {
//             value: 300,
//             message: "Qualification cannot exceed 300 characters",
//           },
//         })}
//         placeholder="Qualification"
//         className={`input input-bordered w-full focus:outline-none ${errors.guardian?.qualification ? "input-error" : ""
//           }`}
//       />
//       {errors.guardian?.qualification && (
//         <span className="text-error text-sm">
//           {errors.guardian.qualification.message}
//         </span>
//       )}
//     </div>
//   </div>
//   <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
//     <div className="form-control">
//       <label className="label">
//         <span className="label-text flex items-center gap-2">
//           <i className="fa-solid fa-briefcase text-sm"></i>
//           Occupation <span className="text-error">*</span>
//         </span>
//       </label>
//       <input
//         type="text"
//         {...register("guardian.occupation", {
//           required: "Occupation is required",
//           maxLength: {
//             value: 300,
//             message: "Occupation cannot exceed 300 characters",
//           },
//         })}
//         placeholder="Occupation"
//         className={`input input-bordered w-full focus:outline-none ${errors.guardian?.occupation ? "input-error" : ""
//           }`}
//       />
//       {errors.guardian?.occupation && (
//         <span className="text-error text-sm">
//           {errors.guardian.occupation.message}
//         </span>
//       )}
//     </div>
//     <div className="form-control">
//       <label className="label">
//         <span className="label-text flex items-center gap-2">
//           <i className="fa-solid fa-id-card text-sm"></i>
//           Designation
//         </span>
//       </label>
//       <input
//         type="text"
//         {...register("guardian.designation", {
//           maxLength: {
//             value: 300,
//             message: "Designation cannot exceed 300 characters",
//           },
//         })}
//         placeholder="Designation"
//         className="input input-bordered w-full focus:outline-none"
//       />
//       {errors.guardian?.designation && (
//         <span className="text-error text-sm">
//           {errors.guardian.designation.message}
//         </span>
//       )}
//     </div>
//   </div>
// </div>

//         {/* Academic Information Section */}
//         <div className="bg-base-200 p-6 rounded-box mb-6">
//           <h2 className="text-2xl font-bold mb-4">Academic Information</h2>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <div className="form-control">
//               <label className="label">
//                 <span className="label-text flex items-center gap-2">
//                   <i className="fa-solid fa-graduation-cap text-sm"></i>
//                   Year Level <span className="text-error">*</span>
//                 </span>
//               </label>
//               <select
//                 {...register("year_level", {
//                   required: "Year level is required",
//                 })}
//                 className={`select select-bordered w-full focus:outline-none cursor-pointer ${errors.year_level ? "select-error" : ""
//                   }`}
//               >
//                 <option value="">Select Year Level</option>
//                 {yearLevel.map((yearlev) => (
//                   <option value={yearlev.level_name} key={yearlev.id}>
//                     {yearlev.level_name}
//                   </option>
//                 ))}
//               </select>
//               {errors.year_level && (
//                 <span className="text-error text-sm">
//                   {errors.year_level.message}
//                 </span>
//               )}
//             </div>
//             <div className="form-control">
//               <label className="label">
//                 <span className="label-text flex items-center gap-2">
//                   <i className="fa-solid fa-calendar text-sm"></i>
//                   School Year <span className="text-error">*</span>
//                 </span>
//               </label>
//               <select
//                 {...register("school_year", {
//                   required: "School year is required",
//                 })}
//                 className={`select select-bordered w-full focus:outline-none cursor-pointer ${errors.school_year ? "select-error" : ""
//                   }`}
//               >
//                 <option value="">Select School Year</option>
//                 {schoolYears.map((schoolYear) => (
//                   <option value={schoolYear.year_name} key={schoolYear.id}>
//                     {schoolYear.year_name}
//                   </option>
//                 ))}
//               </select>
//               {errors.school_year && (
//                 <span className="text-error text-sm">
//                   {errors.school_year.message}
//                 </span>
//               )}
//             </div>
//           </div>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
//             <div className="form-control">
//               <label className="label">
//                 <span className="label-text flex items-center gap-2">
//                   <i className="fa-solid fa-school text-sm"></i>
//                   Previous School Name <span className="text-error">*</span>
//                 </span>
//               </label>
//               <input
//                 type="text"
//                 {...register("previous_school_name", {
//                   required: "Previous school name is required",
//                   maxLength: {
//                     value: 200,
//                     message: "School name cannot exceed 200 characters",
//                   },
//                 })}
//                 placeholder="Previous School Name"
//                 className={`input input-bordered w-full focus:outline-none ${errors.previous_school_name ? "input-error" : ""
//                   }`}
//               />
//               {errors.previous_school_name && (
//                 <span className="text-error text-sm">
//                   {errors.previous_school_name.message}
//                 </span>
//               )}
//             </div>
//             <div className="form-control">
//               <label className="label">
//                 <span className="label-text flex items-center gap-2">
//                   <i className="fa-solid fa-book text-sm"></i>
//                   Previous Class/Grade <span className="text-error">*</span>
//                 </span>
//               </label>
//               <input
//                 type="text"
//                 {...register("previous_standard_studied", {
//                   required: "Previous class/grade is required",
//                   maxLength: {
//                     value: 200,
//                     message: "Class/grade cannot exceed 200 characters",
//                   },
//                 })}
//                 placeholder="Previous Class/Grade"
//                 className={`input input-bordered w-full focus:outline-none ${errors.previous_standard_studied ? "input-error" : ""
//                   }`}
//               />
//               {errors.previous_standard_studied && (
//                 <span className="text-error text-sm">
//                   {errors.previous_standard_studied.message}
//                 </span>
//               )}
//             </div>
//           </div>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
//             <div className="form-control">
//               <label className="label">
//                 <span className="label-text flex items-center gap-2">
//                   <i className="fa-solid fa-calendar-check text-sm"></i>
//                   Admission Date
//                 </span>
//               </label>
//               <input
//                 type="date"
//                 max={new Date().toISOString().split("T")[0]} // 👈 Prevent future dates
//                 {...register("admission_date", {
//                   required: "Admission date is required",
//                   validate: (value) => {
//                     const selectedDate = new Date(value);
//                     const today = new Date();
//                     if (selectedDate > today) {
//                       return "Future dates are not allowed";
//                     }
//                     return true;
//                   },
//                 })}
//                 className={`input input-bordered w-full focus:outline-none ${errors.admission_date ? "input-error" : ""
//                   }`}
//               />
//               {errors.admission_date && (
//                 <span className="text-error text-sm">
//                   {errors.admission_date.message}
//                 </span>
//               )}
//             </div>

//             <div className="form-control">
//               <label className="label">
//                 <span className="label-text flex items-center gap-2">
//                   <i className="fa-solid fa-file text-sm"></i>
//                   TC Letter <span className="text-error">*</span>
//                 </span>
//               </label>
//               <select
//                 {...register("tc_letter", {
//                   required: "TC letter status is required",
//                 })}
//                 className={`select select-bordered w-full focus:outline-none cursor-pointer ${errors.tc_letter ? "select-error" : ""
//                   }`}
//               >
//                 <option value="">Select</option>
//                 <option value="no">No</option>
//                 <option value="not_applicable">Not Applicable</option>
//                 <option value="yes">Yes</option>
//               </select>
//               {errors.tc_letter && (
//                 <span className="text-error text-sm">
//                   {errors.tc_letter.message}
//                 </span>
//               )}
//             </div>
//           </div>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
//             <div className="form-control">
//               <label className="label">
//                 <span className="label-text flex items-center gap-2">
//                   <i className="fa-solid fa-phone text-sm"></i>
//                   Emergency Contact <span className="text-error">*</span>
//                 </span>
//               </label>
//               <input
//                 type="tel"
//                 {...register("emergency_contact_no", {
//                   required: "Emergency contact is required",
//                   pattern: {
//                     value: /^[6789]\d{9}$/,
//                     message:
//                       "Emergency contact must start with 6, 7, 8, or 9 and be exactly 10 digits",
//                   },
//                   minLength: {
//                     value: 10,
//                     message: "Emergency contact must be exactly 10 digits",
//                   },
//                   maxLength: {
//                     value: 10,
//                     message: "Emergency contact must be exactly 10 digits",
//                   },
//                   validate: {
//                     validStart: (value) =>
//                       /^[6789]/.test(value) ||
//                       "Emergency contact must start with 6, 7, 8, or 9",
//                   },
//                 })}
//                 placeholder="Emergency Contact"
//                 className={`input input-bordered w-full focus:outline-none ${errors.emergency_contact_no ? "input-error" : ""
//                   }`}
//                 onInput={(e) => {
//                   // Remove any non-digit characters
//                   e.target.value = e.target.value.replace(/\D/g, "");
//                   // Limit to 10 digits
//                   if (e.target.value.length > 10) {
//                     e.target.value = e.target.value.slice(0, 10);
//                   }
//                 }}
//                 onKeyDown={(e) => {
//                   // Prevent typing of non-numeric characters except Backspace, Tab, Delete, Arrow keys
//                   if (
//                     !/[\d]|Backspace|Tab|Delete|ArrowLeft|ArrowRight|ArrowUp|ArrowDown/.test(
//                       e.key
//                     )
//                   ) {
//                     e.preventDefault();
//                   }

//                   // Prevent typing if first character is not 6,7,8,9 when at position 0
//                   if (e.target.selectionStart === 0 && /[0-5]/.test(e.key)) {
//                     e.preventDefault();
//                   }
//                 }}
//                 onPaste={(e) => {
//                   // Get pasted data
//                   const pastedData = e.clipboardData
//                     .getData("text")
//                     .replace(/\D/g, "");

//                   // Check if pasted data starts with valid digit
//                   if (!/^[6789]/.test(pastedData)) {
//                     e.preventDefault();
//                     // Optional: Show a temporary message
//                     alert("Pasted phone number must start with 6, 7, 8, or 9");
//                   }
//                 }}
//               />
//               {errors.emergency_contact_no && (
//                 <span className="text-error text-sm">
//                   {errors.emergency_contact_no.type === "validStart"
//                     ? errors.emergency_contact_no.message
//                     : errors.emergency_contact_no.message}
//                 </span>
//               )}
//             </div>
//             <div className="form-control">
//               <label className="label">
//                 <span className="label-text flex items-center gap-2">
//                   <i className="fa-solid fa-road text-sm"></i>
//                   Distance to School (km) <span className="text-error">*</span>
//                 </span>
//               </label>
//               <input
//                 type="number"
//                 {...register("entire_road_distance_from_home_to_school", {
//                   required: "Distance is required",
//                   min: { value: 0, message: "Distance cannot be negative" },
//                   maxLength: {
//                     value: 100,
//                     message: "Distance cannot exceed 100 characters",
//                   },
//                 })}
//                 placeholder="Distance in km"
//                 className={`input input-bordered w-full focus:outline-none ${errors.entire_road_distance_from_home_to_school
//                   ? "input-error"
//                   : ""
//                   }`}
//               />
//               {errors.entire_road_distance_from_home_to_school && (
//                 <span className="text-error text-sm">
//                   {errors.entire_road_distance_from_home_to_school.message}
//                 </span>
//               )}
//             </div>
//           </div>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
//             <div className="form-control">
//               <label className="label">
//                 <span className="label-text flex items-center gap-2">
//                   <i className="fa-solid fa-marker text-sm"></i>
//                   Marks Obtained
//                 </span>
//               </label>
//               <input
//                 type="number"
//                 {...register("obtain_marks", {
//                   required: "Marks obtained is required",
//                   min: { value: 0, message: "Marks cannot be negative" },
//                 })}
//                 placeholder="Marks Obtained"
//                 className={`input input-bordered w-full focus:outline-none ${errors.obtain_marks ? "input-error" : ""
//                   }`}
//               />
//               {errors.obtain_marks && (
//                 <span className="text-error text-sm">
//                   {errors.obtain_marks.message}
//                 </span>
//               )}
//             </div>
//             <div className="form-control">
//               <label className="label">
//                 <span className="label-text flex items-center gap-2">
//                   <i className="fa-solid fa-chart-simple text-sm"></i>
//                   Total Marks
//                 </span>
//               </label>
//               <input
//                 type="number"
//                 {...register("total_marks", {
//                   required: "Total marks is required",
//                   min: { value: 0, message: "Total marks cannot be negative" },
//                 })}
//                 placeholder="Total Marks"
//                 className={`input input-bordered w-full focus:outline-none ${errors.total_marks ? "input-error" : ""
//                   }`}
//               />
//               {errors.total_marks && (
//                 <span className="text-error text-sm">
//                   {errors.total_marks.message}
//                 </span>
//               )}
//             </div>
//           </div>
//         </div>
// <div className="bg-base-200 p-6 rounded-box mb-6">
//   <h2 className="text-2xl font-bold mb-4">Residential Address</h2>
//   <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//     {/* House Number */}
//     <div className="form-control">
//       <label className="label">
//         <span className="label-text flex items-center gap-2">
//           <i className="fa-solid fa-home text-sm"></i>
//           House Number
//         </span>
//       </label>
//       <input
//         type="number"
//         {...register("address_input.house_no", {
//           required: "House number is required",
//           min: { value: -2147483648, message: "Invalid house number" },
//           max: { value: 2147483647, message: "Invalid house number" },
//         })}
//         placeholder="House Number"
//         className={`input input-bordered w-full focus:outline-none ${errors.address?.house_no ? "input-error" : ""
//           }`}
//       />
//       {errors.address?.house_no && (
//         <span className="text-error text-sm">
//           {errors.address.house_no.message}
//         </span>
//       )}
//     </div>

//     {/* Habitation */}
//     <div className="form-control">
//       <label className="label">
//         <span className="label-text flex items-center gap-2">
//           <i className="fa-solid fa-map-location text-sm"></i>
//           Habitation
//         </span>
//       </label>
//       <input
//         type="text"
//         {...register("address_input.habitation", {
//           required: "Habitation is required",
//           maxLength: {
//             value: 100,
//             message: "Habitation cannot exceed 100 characters",
//           },
//         })}
//         placeholder="Habitation"
//         className={`input input-bordered w-full focus:outline-none ${errors.address?.habitation ? "input-error" : ""
//           }`}
//       />
//       {errors.address?.habitation && (
//         <span className="text-error text-sm">
//           {errors.address.habitation.message}
//         </span>
//       )}
//     </div>

//     {/* Block */}
//     <div className="form-control">
//       <label className="label">
//         <span className="label-text flex items-center gap-2">
//           <i className="fa-solid fa-building text-sm"></i>
//           Block
//         </span>
//       </label>
//       <input
//         type="text"
//         {...register("address_input.block", {
//           required: "Block is required",
//           maxLength: {
//             value: 100,
//             message: "Block cannot exceed 100 characters",
//           },
//         })}
//         placeholder="Block"
//         className={`input input-bordered w-full focus:outline-none ${errors.address?.block ? "input-error" : ""
//           }`}
//       />
//       {errors.address?.block && (
//         <span className="text-error text-sm">
//           {errors.address.block.message}
//         </span>
//       )}
//     </div>

//     {/* Ward Number */}
//     <div className="form-control">
//       <label className="label">
//         <span className="label-text flex items-center gap-2">
//           <i className="fa-solid fa-map text-sm"></i>
//           Ward Number
//         </span>
//       </label>
//       <input
//         type="number"
//         placeholder="Ward Number"
//         min={0}
//         className="input input-bordered w-full focus:outline-none"
//         {...register("address_input.ward_no")}
//         onKeyDown={(e) => {
//           if (e.key === "-" || e.key === "e") e.preventDefault();
//         }}
//         onWheel={(e) => e.target.blur()}
//       />
//     </div>
//   </div>

//   <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
//     {/* Zone */}
//     <div className="form-control">
//       <label className="label">
//         <span className="label-text flex items-center gap-2">
//           <i className="fa-solid fa-map-pin text-sm"></i>
//           Zone
//         </span>
//       </label>
//       <input
//         type="number"
//         placeholder="Zone"
//         min={0}
//         className="input input-bordered w-full focus:outline-none"
//         {...register("address_input.zone_no")}
//         onKeyDown={(e) => {
//           if (e.key === "-" || e.key === "e") e.preventDefault();
//         }}
//         onWheel={(e) => e.target.blur()}
//       />
//     </div>

//     {/* District */}
//     <div className="form-control">
//       <label className="label">
//         <span className="label-text flex items-center gap-2">
//           <i className="fa-solid fa-map text-sm"></i>
//           District
//         </span>
//       </label>
//       <input
//         type="text"
//         {...register("address_input.district", {
//           required: "District is required",
//           maxLength: {
//             value: 50,
//             message: "District cannot exceed 100 characters",
//           },
//         })}
//         placeholder="District"
//         className={`input input-bordered w-full focus:outline-none ${errors.address?.district ? "input-error" : ""
//           }`}
//       />
//       {errors.address?.district && (
//         <span className="text-error text-sm">
//           {errors.address.district.message}
//         </span>
//       )}
//     </div>

//     {/* City */}
//     <div className="form-control relative">
//       <label className="label">
//         <span className="label-text flex items-center gap-2">
//           <i className="fa-solid fa-city text-sm"></i>
//           City <span className="text-error">*</span>
//         </span>
//       </label>

//       {/* Custom dropdown input */}
//       <div
//         className={`input input-bordered w-full flex items-center justify-between cursor-pointer ${errors.address_input?.city ? "input-error" : ""
//           }`}
//         onClick={() => setShowCityDropdown(!showCityDropdown)}
//       >
//         <span className="text-gray-700 dark:text-gray-200">
//           {selectedCityName || "Select City"}
//         </span>
//         <i
//           className={`fa-solid fa-chevron-${showCityDropdown ? "up" : "down"} ml-2 text-gray-500`}
//         ></i>
//       </div>

//       {/* Dropdown menu */}
//       {showCityDropdown && (
//         <div className="absolute z-10 bg-white dark:bg-[#242627] rounded w-full mt-1 shadow-lg border border-gray-300 dark:border-gray-600">
//           {/* Search input */}
//           <div className="p-2 sticky top-0 shadow-sm bg-white dark:bg-[#242627]">
//             <input
//               type="text"
//               placeholder="Search City..."
//               className="input input-bordered w-full focus:outline-none bg-white dark:bg-[#242627] text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-500"
//               value={citySearchInput}
//               onChange={(e) => setCitySearchInput(e.target.value)}
//             />
//           </div>

//           {/* Filtered city list */}
//           <div className="max-h-40 overflow-y-auto">
//             {filteredCities.length > 0 ? (
//               filteredCities.map((city) => (
//                 <p
//                   key={city.id}
//                   className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer text-gray-800 dark:text-gray-200 capitalize"
//                   onClick={() => {
//                     setValue("address_input.city", city.id.toString(), {
//                       shouldValidate: true,
//                     });
//                     setSelectedCityName(city.name);
//                     setCitySearchInput("");
//                     setShowCityDropdown(false);
//                   }}
//                 >
//                   {city.name}
//                 </p>
//               ))
//             ) : (
//               <p className="p-2 text-gray-500 dark:text-gray-400">No cities found</p>
//             )}
//           </div>
//         </div>
//       )}

//       {/* Validation error */}
//       {errors.address_input?.city && (
//         <span className="text-error text-sm">
//           {errors.address_input.city.message}
//         </span>
//       )}
//     </div>


//     {/* Division */}
//     <div className="form-control">
//       <label className="label">
//         <span className="label-text flex items-center gap-2">
//           <i className="fa-solid fa-map-signs text-sm"></i>
//           Division
//         </span>
//       </label>
//       <input
//         type="text"
//         {...register("address_input.division", {
//           required: "Division is required",
//           maxLength: {
//             value: 20,
//             message: "Division cannot exceed 20 characters",
//           },
//         })}
//         placeholder="Division"
//         className={`input input-bordered w-full focus:outline-none ${errors.address?.division ? "input-error" : ""
//           }`}
//       />
//       {errors.address?.division && (
//         <span className="text-error text-sm">
//           {errors.address.division.message}
//         </span>
//       )}
//     </div>
//   </div>

//   <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
//     {/* State */}
//     <div className="form-control relative">
//       <label className="label">
//         <span className="label-text flex items-center gap-2">
//           <i className="fa-solid fa-flag text-sm"></i>
//           State <span className="text-error">*</span>
//         </span>
//       </label>

//       {/* Custom dropdown trigger */}
//       <div
//         className={`input input-bordered w-full flex items-center justify-between cursor-pointer ${errors.address_input?.state ? "input-error" : ""
//           }`}
//         onClick={() => setShowStateDropdown(!showStateDropdown)}
//       >
//         <span className="text-gray-700 dark:text-gray-200">
//           {selectedStateName || "Select State"}
//         </span>
//         <i
//           className={`fa-solid fa-chevron-${showStateDropdown ? "up" : "down"} ml-2 text-gray-500`}
//         ></i>
//       </div>

//       {/* Dropdown menu */}
//       {showStateDropdown && (
//         <div className="absolute z-10 bg-white dark:bg-[#242627] rounded w-full mt-1 shadow-lg border border-gray-300 dark:border-gray-600">
//           {/* Search input */}
//           <div className="p-2 sticky top-0 shadow-sm bg-white dark:bg-[#242627]">
//             <input
//               type="text"
//               placeholder="Search State..."
//               className="input input-bordered w-full focus:outline-none bg-white dark:bg-[#242627] text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-500"
//               value={stateSearchInput}
//               onChange={(e) => setStateSearchInput(e.target.value)}
//             />
//           </div>

//           {/* Filtered state list */}
//           <div className="max-h-40 overflow-y-auto">
//             {filteredStates.length > 0 ? (
//               filteredStates.map((state) => (
//                 <p
//                   key={state.id}
//                   className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer text-gray-800 dark:text-gray-200 capitalize"
//                   onClick={() => {
//                     setValue("address_input.state", state.id.toString(), {
//                       shouldValidate: true,
//                     });
//                     setSelectedStateName(state.name);
//                     setStateSearchInput("");
//                     setShowStateDropdown(false);
//                   }}
//                 >
//                   {state.name}
//                 </p>
//               ))
//             ) : (
//               <p className="p-2 text-gray-500 dark:text-gray-400">No states found</p>
//             )}
//           </div>
//         </div>
//       )}

//       {/* Validation error */}
//       {errors.address_input?.state && (
//         <span className="text-error text-sm">{errors.address_input.state.message}</span>
//       )}
//     </div>

//     {/* Country */}
//     <div className="form-control relative">
//       <label className="label">
//         <span className="label-text flex items-center gap-2">
//           <i className="fa-solid fa-globe text-sm"></i>
//           Country <span className="text-error">*</span>
//         </span>
//       </label>

//       {/* Custom dropdown input */}
//       <div
//         className={`input input-bordered w-full flex items-center justify-between cursor-pointer ${errors.address_input?.country ? "input-error" : ""
//           }`}
//         onClick={() => setShowCountryDropdown(!showCountryDropdown)}
//       >
//         <span className="text-gray-700 dark:text-gray-200">
//           {selectedCountryName || "Select Country"}
//         </span>
//         <i
//           className={`fa-solid fa-chevron-${showCountryDropdown ? "up" : "down"} ml-2 text-gray-500`}
//         ></i>
//       </div>

//       {/* Dropdown list */}
//       {showCountryDropdown && (
//         <div className="absolute z-10 bg-white dark:bg-[#242627] rounded w-full mt-1 shadow-lg border border-gray-300 dark:border-gray-600">
//           {/* Search input */}
//           <div className="p-2 sticky top-0 shadow-sm bg-white dark:bg-[#242627]">
//             <input
//               type="text"
//               placeholder="Search Country..."
//               className="input input-bordered w-full focus:outline-none bg-white dark:bg-[#242627] text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-500"
//               value={countrySearchInput}
//               onChange={(e) => setCountrySearchInput(e.target.value)}
//             />
//           </div>

//           {/* Filtered country list */}
//           <div className="max-h-40 overflow-y-auto">
//             {filteredCountries.length > 0 ? (
//               filteredCountries.map((country) => (
//                 <p
//                   key={country.id}
//                   className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer text-gray-800 dark:text-gray-200 capitalize"
//                   onClick={() => {
//                     setValue("address_input.country", country.id.toString(), {
//                       shouldValidate: true,
//                     });
//                     setSelectedCountryName(country.name);
//                     setCountrySearchInput("");
//                     setShowCountryDropdown(false);
//                   }}
//                 >
//                   {country.name}
//                 </p>
//               ))
//             ) : (
//               <p className="p-2 text-gray-500 dark:text-gray-400">No countries found</p>
//             )}
//           </div>
//         </div>
//       )}

//       {/* Validation error */}
//       {errors.address_input?.country && (
//         <span className="text-error text-sm">{errors.address_input.country.message}</span>
//       )}
//     </div>


//     {/* Pincode */}
//     <div className="form-control ">
//       <label className="label">
//         <span className="label-text flex items-center gap-2">
//           <i className="fa-solid fa-mailbox text-sm"></i>
//           Pin Code
//         </span>
//       </label>
//       <input
//         type="number"
//         {...register("address_input.area_code", {
//           required: "Pin code is required",
//           min: { value: -2147483648, message: "Invalid pin code" },
//           max: { value: 2147483647, message: "Invalid pin code" },
//         })}
//         placeholder="Pin Code"
//         className={`input input-bordered w-full focus:outline-none ${errors.address?.area_code ? "input-error" : ""
//           }`}
//       />
//       {errors.address?.area_code && (
//         <span className="text-error text-sm">
//           {errors.address.area_code.message}
//         </span>
//       )}
//     </div>
//   </div>
//   <div className="grid grid-cols-1 mt-6">
//     <div className="form-control">
//       <label className="label">
//         <span className="label-text flex items-center gap-2">
//           <i className="fa-solid fa-location-dot text-sm"></i>
//           Full Address Line
//         </span>
//       </label>
//       <textarea
//         maxLength={250}
//         {...register("address_input.address_line", {
//           required: "Address line is required",
//           maxLength: {
//             value: 250,
//             message: "Address line cannot exceed 250 characters",
//           },
//         })}
//         placeholder="Full Address"
//         className={`textarea textarea-bordered w-full focus:outline-none ${errors.address?.address_line ? "textarea-error" : ""
//           }`}
//       ></textarea>
//       {errors.address?.address_line && (
//         <span className="text-error text-sm">
//           {errors.address.address_line.message}
//         </span>
//       )}
//     </div>
//   </div>
// </div>
//         {/* Bank Details Section */}
//         <div className="bg-base-200 p-6 rounded-box mb-6">
//           <h2 className="text-2xl font-bold mb-4">Bank Account Details</h2>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             {/* Account Holder Name */}
//             <div className="form-control">
//               <label className="label">
//                 <span className="label-text flex items-center gap-2">
//                   <i className="fa-solid fa-user text-sm"></i>
//                   Account Holder Name
//                 </span>
//               </label>
//               <input
//                 type="text"
//                 {...register("banking_detail_input.holder_name", {
//                   maxLength: {
//                     value: 50,
//                     message: "Holder name cannot exceed 50 characters",
//                   },
//                   validate: (value) => {
//                     if (!value) return true;
//                     if (!/^[A-Za-z]+(?: [A-Za-z]+)*$/.test(value)) {
//                       return "Enter a valid name (alphabets & single spaces only)";
//                     }
//                     return true;
//                   },
//                 })}
//                 placeholder="Full Name as in Bank (optional)"
//                 className={`input input-bordered w-full focus:outline-none ${errors.banking_detail_input?.holder_name ? "input-error" : ""
//                   }`}
//                 onInput={(e) => {
//                   e.target.value = e.target.value
//                     .replace(/[^A-Za-z\s]/g, "")
//                     .replace(/\s+/g, " ")
//                     .replace(/^\s+/g, "");
//                 }}
//               />
//               {errors.banking_detail_input?.holder_name && (
//                 <span className="text-error text-sm">
//                   {errors.banking_detail_input.holder_name.message}
//                 </span>
//               )}
//             </div>

//             {/* Account Number */}
//             <div className="form-control">
//               <label className="label">
//                 <span className="label-text flex items-center gap-2">
//                   <i className="fa-solid fa-credit-card text-sm"></i>
//                   Account Number
//                 </span>
//               </label>
//               <input
//                 type="text"
//                 {...register("banking_detail_input.account_no", {
//                   validate: (value) => {
//                     if (!value) return true;
//                     if (!/^[0-9]{9,18}$/.test(value)) {
//                       return "Account number must be 9 to 18 digits";
//                     }
//                     return true;
//                   },
//                 })}
//                 placeholder="Account Number (optional)"
//                 className={`input input-bordered w-full focus:outline-none ${errors.banking_detail_input?.account_no ? "input-error" : ""
//                   }`}
//                 onInput={(e) => {
//                   e.target.value = e.target.value.replace(/[^0-9]/g, "");
//                 }}
//               />
//               {errors.banking_detail_input?.account_no && (
//                 <span className="text-error text-sm">
//                   {errors.banking_detail_input.account_no.message}
//                 </span>
//               )}
//             </div>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
//             {/* IFSC Code */}
//             <div className="form-control">
//               <label className="label">
//                 <span className="label-text flex items-center gap-2">
//                   <i className="fa-solid fa-code text-sm"></i>
//                   IFSC Code
//                 </span>
//               </label>
//               <input
//                 type="text"
//                 {...register("banking_detail_input.ifsc_code", {
//                   validate: (value) => {
//                     if (!value) return true;
//                     if (!/^[A-Z]{4}[0-9A-Z][A-Z0-9]{6}$/.test(value)) {
//                       return "Invalid IFSC code format (e.g. SBIN0001234)";
//                     }
//                     return true;
//                   },
//                 })}
//                 placeholder="eg: SBIN0001234 (optional)"
//                 className={`input input-bordered w-full focus:outline-none ${errors.banking_detail_input?.ifsc_code ? "input-error" : ""
//                   }`}
//                 onInput={(e) => {
//                   e.target.value = e.target.value
//                     .toUpperCase()
//                     .replace(/[^A-Z0-9]/g, "");
//                 }}
//                 maxLength={11}
//               />
//               {errors.banking_detail_input?.ifsc_code && (
//                 <span className="text-error text-sm">
//                   {errors.banking_detail_input.ifsc_code.message}
//                 </span>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Submit Button */}
//         <div className="flex justify-center mt-10">
//           <button type="submit" className="btn bgTheme text-white w-40">
//             {loading ? (
//               <i className="fa-solid fa-spinner fa-spin mr-2"></i>
//             ) : (
//               <i className="fa-solid fa-paper-plane mr-2"></i>
//             )}
//             {loading ? "" : "Register"}
//           </button>
//         </div>
//       </form>
//       {showAdmissionSuccessModal && (
//         <AdmissionSuccessful
//           handleCloseOnly={handleCloseOnly}
//           handleCloseAndNavigate={handleCloseAndNavigate}
//         />
//       )}
//       {/* Modal */}
//       {showAlert && (
//         <dialog open className="modal modal-open">
//           <div className="modal-box dark:bg-gray-800 dark:text-gray-100">
//             <h3 className="font-bold text-lg">Admission Form</h3>
//             <p className="py-4">{alertMessage}</p>
//             <div className="modal-action">
//               <button
//                 className="btn bgTheme text-white w-30"
//                 onClick={() => setShowAlert(false)}
//               >
//                 OK
//               </button>
//             </div>
//           </div>
//         </dialog>
//       )}
//     </div>
//   );
// };