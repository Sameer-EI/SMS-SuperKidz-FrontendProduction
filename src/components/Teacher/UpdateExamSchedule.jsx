import { useState, useEffect, useRef } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import {
  fetchYearLevels,
  fetchSchoolYear,
  fetchExamType,
  fetchSubjects,
} from "../../services/api/Api";
import { constants } from "../../global/constants";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { allRouterLink } from "../../router/AllRouterLinks";

const UpdateExamSchedule = () => {
  const [className1, setClassName] = useState([]);
  const [schoolYear, setSchoolYear] = useState([]);
  const [examType, setExamType] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [accessToken, setAccessToken] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");


  const [searchSubjectInput, setSearchSubjectInput] = useState("");
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);
  const [selectedSubjects, setSelectedSubjects] = useState({});

  const subjectDropdownRef = useRef(null);

  const navigate = useNavigate();

  const BASE_URL = constants.baseUrl;

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      class_name: "",
      school_year: "",
      exam_type: "",
      papers: [
        {
          subject_id: "",
          exam_date: "",
          start_time: "",
          end_time: "",
        },
      ],
    },
  });

  useEffect(() => {
    const tokenData = localStorage.getItem("authTokens");
    if (tokenData) {
      try {
        const tokens = JSON.parse(tokenData);
        if (tokens?.access && tokens.access !== accessToken) {
          setAccessToken(tokens.access);
        }
      } catch (error) {
        console.error("Error parsing auth tokens:", error);
      }
    }
  }, []);

  // Fetch all classes
  const getClassName = async () => {
    try {
      const ClassName = await fetchYearLevels();
      setClassName(ClassName);
    } catch (err) {
      console.log("Failed to load classes. Please try again." + err);
    }
  };

  // Fetch school_year
  const getSchool_year = async () => {
    try {
      const obj = await fetchSchoolYear();
      setSchoolYear(obj);
    } catch (err) {
      console.log("Failed to load classes. Please try again." + err);
    }
  };

  const getExamType = async () => {
    try {
      if (!accessToken) {
        console.error("No access token available");
        return;
      }

      const obj = await fetchExamType(accessToken);
      if (obj) {
        setExamType(obj);
      } else {
        console.error("Received empty response from fetchExamType");
      }
    } catch (err) {
      console.error("Failed to load exam types:", err);
    }
  };

  // Fetch Subjects
  const getsubjects = async () => {
    try {
      const obj = await fetchSubjects();
      setSubjects(obj);
    } catch (err) {
      console.log("Failed to load classes. Please try again." + err);
    }
  };

  useEffect(() => {
    getClassName();
    getSchool_year();
    if (accessToken) {
      // Only call getExamType if we have a token
      getExamType();
    }
    getsubjects();
  }, [accessToken]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "papers",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleNavigate = () => {
    navigate(allRouterLink.ExamSchedule);
  };

  const onSubmit = async (data) => {
    try {
      if (!accessToken) return;

      const payload = {
        class_name: Number(data.class_name),
        school_year: Number(data.school_year),
        exam_type: Number(data.exam_type),
        papers: data.papers.map((paper) => ({
          subject_id: Number(paper.subject_id),
          exam_date: paper.exam_date,
          start_time: paper.start_time,
          end_time: paper.end_time,
        })),
      };

      const response = await axios.put(
        `${BASE_URL}/d/Exam-Schedule/update_timetable/`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        setAlertMessage("Exam schedule updated successfully!");
        setShowAlert(true);
        reset();
      } else {
        throw new Error(
          response.data.message || "Failed to update exam schedule"
        );
      }
    } catch (err) {
      console.log("Full error:", err.response?.data);

      let errorMsg = "Failed to update exam schedule";

      if (err.response?.data) {
        const data = err.response.data;

        if (typeof data === "string") {
          errorMsg = data;
        } else if (Array.isArray(data)) {
          errorMsg = data.join("\n");
        } else if (typeof data === "object") {
          errorMsg = Object.entries(data)
            .map(([key, val]) => {
              if (Array.isArray(val)) {
                return `${key}: ${val.join(", ")}`;
              } else if (typeof val === "object") {
                return `${key}: ${JSON.stringify(val)}`;
              } else {
                return `${key}: ${val}`;
              }
            })
            .join("\n");
        }
      }

      setAlertMessage(errorMsg);
      setShowAlert(true);
    }
  };
useEffect(() => {
  const handleClickOutside = (event) => {
    if (
      subjectDropdownRef.current &&
      !subjectDropdownRef.current.contains(event.target)
    ) {
      setShowSubjectDropdown(null);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);


  const filteredSubjects = subjects
    .filter((subjectObj) =>
      subjectObj.subject_name.toLowerCase().includes(searchSubjectInput.toLowerCase())
    )
    .sort((a, b) => a.subject_name.localeCompare(b.subject_name));

  return (
    <div className="p-6 bg-gray-100 min-h-screen dark:bg-gray-900 mb-24 md:mb-10">
      <div className="w-full max-w-7xl mx-auto p-6 bg-base-100 rounded-box my-5 shadow-sm">


        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="border-b border-gray-300 dark:border-gray-700 ">
            <h1 className="text-3xl font-bold text-center mb-8">
              <i className="fa-solid fa-pen-nib ml-2"></i> Update Exam Schedule
            </h1>
            <div className=" flex justify-end pb-2">

              <button
                className="btn bgTheme text-white"
                onClick={handleNavigate}
              >
                <i className="fa-solid fa-calendar-day ml-2"></i> Create Exam Schedule
              </button>
            </div></div>

          {error && (
            <div className="alert alert-error mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="alert alert-success mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{success}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            {/* Class Name */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">
                  Class <span className="text-error">*</span>
                </span>
              </label>
              <select
                className={`select select-bordered w-full ${errors.class_name ? "select-error" : ""
                  }`}
                {...register("class_name", { required: "Class is required" })}
              >
                <option value="">Select Class</option>
                {className1?.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.level_name}
                  </option>
                ))}
              </select>
              {errors.class_name && (
                <label className="label">
                  <span className="label-text-alt text-error">
                    {errors.class_name.message}
                  </span>
                </label>
              )}
            </div>

            {/* School Year */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">
                  School Year <span className="text-error">*</span>
                </span>
              </label>
              <select
                className={`select select-bordered w-full ${errors.school_year ? "select-error" : ""
                  }`}
                {...register("school_year", {
                  required: "School year is required",
                })}
              >
                <option value="">Select Year</option>
                {schoolYear?.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.year_name}
                  </option>
                ))}
              </select>
              {errors.school_year && (
                <label className="label">
                  <span className="label-text-alt text-error">
                    {errors.school_year.message}
                  </span>
                </label>
              )}
            </div>

            {/* Exam Type */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">
                  Exam Type <span className="text-error">*</span>
                </span>
              </label>
              <select
                className={`select select-bordered w-full ${errors.exam_type ? "select-error" : ""
                  }`}
                {...register("exam_type", { required: "Exam type is required" })}
              >
                <option value="">Select Exam Type</option>
                {examType?.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name}
                  </option>
                ))}
              </select>
              {errors.exam_type && (
                <label className="label">
                  <span className="label-text-alt text-error">
                    {errors.exam_type.message}
                  </span>
                </label>
              )}
            </div>
          </div>

          {/* Papers Section */}
          <div className="mt-10">
            <h2 className="text-xl font-semibold mb-4">Exam Papers</h2>

            {fields.map((field, index) => (
              <div
                key={field.id}
                className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6 bg-base-200 p-4 rounded-lg"
              >

                {/* Subject */}
                <div className="form-control relative" ref={subjectDropdownRef}>
                  <label className="label">
                    <span className="label-text">
                      Subject <span className="text-error">*</span>
                    </span>
                  </label>

                  {/* Display box that toggles the dropdown */}
                  <div
                    className={`select select-bordered w-full flex items-center justify-between cursor-pointer ${errors.papers?.[index]?.subject_id ? "select-error" : ""
                      }`}
                    onClick={() => {
                      setShowSubjectDropdown((prev) => (prev === index ? null : index));
                    }}
                  >
                    <span className="truncate">
                      {selectedSubjects?.[index]?.name || "Select Subject"}
                    </span>
                  </div>

                  {/* Hidden input to register value in form */}
                  <input
                    type="hidden"
                    {...register(`papers.${index}.subject_id`, {
                      required: "Subject is required",
                    })}
                    value={selectedSubjects?.[index]?.id || ""}
                  />

                  {/* Dropdown */}
                  {showSubjectDropdown === index && (
                    <div className="absolute z-10 bg-white dark:bg-[#1e1e22] rounded w-full mt-1 shadow-lg border border-gray-300 dark:border-gray-600">
                      {/* Search Input */}
                      <div className="p-2 sticky top-0 bg-white dark:bg-[#1e1e22] shadow-sm">
                        <input
                          type="text"
                          placeholder="Search Subject..."
                          className="input input-bordered w-full focus:outline-none bg-white dark:bg-[#1e1e22] text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-500"
                          value={searchSubjectInput}
                          onChange={(e) => setSearchSubjectInput(e.target.value)}
                          autoComplete="off"
                        />
                      </div>

                      {/* Subject List */}
                      <div className="max-h-40 overflow-y-auto">
                        {filteredSubjects?.length > 0 ? (
                          filteredSubjects.map((subjectObj) => (
                            <p
                              key={subjectObj.id}
                              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer text-gray-800 dark:text-gray-200"
                              onClick={() => {
                                setSelectedSubjects((prev) => ({
                                  ...prev,
                                  [index]: {
                                    id: subjectObj.id,
                                    name: subjectObj.subject_name,
                                  }, 
                                }));

                                // Update form value
                                setValue(`papers.${index}.subject_id`, subjectObj.id, {
                                  shouldValidate: true,
                                });

                                // Close dropdown
                                setSearchSubjectInput("");
                                setShowSubjectDropdown(false);
                              }}
                            >
                              {subjectObj.subject_name}
                            </p>
                          ))
                        ) : (
                          <p className="p-2 text-gray-500 dark:text-gray-400">
                            No subjects found.
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Error Message */}
                  {errors.papers?.[index]?.subject_id && (
                    <label className="label">
                      <span className="label-text-alt text-error">
                        {errors.papers[index].subject_id.message}
                      </span>
                    </label>
                  )}
                </div>



                {/* Exam Date */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">
                      Exam Date <span className="text-error">*</span>
                    </span>
                  </label>
                  <input
                    type="date"
                    className={`input input-bordered w-full ${errors.papers?.[index]?.exam_date ? "input-error" : ""
                      }`}
                    {...register(`papers.${index}.exam_date`, {
                      required: "Exam date is required",
                    })}
                  />
                  {errors.papers?.[index]?.exam_date && (
                    <label className="label">
                      <span className="label-text-alt text-error">
                        {errors.papers[index].exam_date.message}
                      </span>
                    </label>
                  )}
                </div>

                {/* Start Time */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">
                      Start Time <span className="text-error">*</span>
                    </span>
                  </label>
                  <input
                    type="time"
                    className={`input input-bordered w-full ${errors.papers?.[index]?.start_time ? "input-error" : ""
                      }`}
                    {...register(`papers.${index}.start_time`, {
                      required: "Start time is required",
                    })}
                  />
                  {errors.papers?.[index]?.start_time && (
                    <label className="label">
                      <span className="label-text-alt text-error">
                        {errors.papers[index].start_time.message}
                      </span>
                    </label>
                  )}
                </div>

                {/* End Time */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">
                      End Time <span className="text-error">*</span>
                    </span>
                  </label>
                  <input
                    type="time"
                    className={`input input-bordered w-full ${errors.papers?.[index]?.end_time ? "input-error" : ""
                      }`}
                    {...register(`papers.${index}.end_time`, {
                      required: "End time is required",
                      validate: (value) => {
                        const startTime = watch(`papers.${index}.start_time`);
                        return (
                          value > startTime || "End time must be after start time"
                        );
                      },
                    })}
                  />
                  {errors.papers?.[index]?.end_time && (
                    <label className="label">
                      <span className="label-text-alt text-error">
                        {errors.papers[index].end_time.message}
                      </span>
                    </label>
                  )}
                </div>

                <div className="form-control md:col-span-4 flex gap-2 justify-end">
                  <button
                    type="button"
                    className="btn bgTheme text-white w-28 p-2"
                    onClick={() => {
                      if (fields.length < 5) {
                        append({
                          subject_id: "",
                          exam_date: "",
                          start_time: "",
                          end_time: "",
                        });
                      } else {
                        setAlertMessage("You can only add up to 4 more papers.");
                        setShowAlert(true);
                      }
                    }}
                    disabled={fields.length >= 5}
                  >
                    <i className="fa-solid fa-plus mr-2"></i> Add
                  </button>
                  <button
                    type="button"
                    className="btn btn-error "
                    onClick={() => remove(index)}
                    disabled={fields.length <= 1}
                  >
                    <i className="fa-solid fa-trash mr-1"></i> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <div className="flex justify-center mt-10">
            <button
              type="submit"
              className="btn bgTheme text-white "
              disabled={isSubmitting}
            >
              {isSubmitting ? <i className="fa-solid fa-spinner fa-spin mr-2"></i> : "Create Schedule"}
            </button>
          </div>
        </form>
      </div>
      {showAlert && (
        <dialog className="modal modal-open">
          <div className="modal-box bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200">
            <h3 className="font-bold text-lg">Exam Schedule</h3>
            <p className="py-4 capitalize">
              {alertMessage.split("\n").map((line, idx) => (
                <span key={idx}>
                  {line}
                  <br />
                </span>
              ))}
            </p>
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

export default UpdateExamSchedule;
