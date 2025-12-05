import { useState, useEffect, useContext, useRef } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import {
  fetchYearLevels,
  fetchSchoolYear,
  fetchSubjects,
} from "../../services/api/Api";
import { useNavigate } from "react-router-dom";
import { allRouterLink } from "../../router/AllRouterLinks";
import { AuthContext } from "../../context/AuthContext";

const ExamSchedule = () => {
  const [className1, setClassName] = useState([]);
  const [schoolYear, setSchoolYear] = useState([]);
  const [examType, setExamType] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");


  const [searchSubjectInput, setSearchSubjectInput] = useState("");
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);
  const [selectedSubjects, setSelectedSubjects] = useState({});

  const subjectDropdownRef = useRef(null);


  const [existingSchedules, setExistingSchedules] = useState([]);

  const navigate = useNavigate();
  const { axiosInstance } = useContext(AuthContext);

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

  const fetchExamType = async () => {
    try {
      const response = await axiosInstance.get("/d/Exam-Type/");
      return response.data;
    } catch (err) {
      console.error("Failed to fetch exam types:", err);
      throw err;
    }
  };

  const getClassName = async () => {
    try {
      const ClassName = await fetchYearLevels();
      setClassName(ClassName);
    } catch (err) {
      console.log("Failed to load classes. Please try again." + err);
    }
  };

  const getSchool_year = async () => {
    try {
      const obj = await fetchSchoolYear();
      setSchoolYear(obj);
    } catch (err) {
      console.log("Failed to load school year. Please try again." + err);
    }
  };

  const getExamType = async () => {
    try {
      const obj = await fetchExamType();
      if (obj) {
        setExamType(obj);
      }
    } catch (err) {
      console.error("Failed to load exam types:", err);
    }
  };

  const getsubjects = async () => {
    try {
      const obj = await fetchSubjects();
      setSubjects(obj);
    } catch (err) {
      console.log("Failed to load subjects. Please try again." + err);
    }
  };

  useEffect(() => {
    getClassName();
    getSchool_year();
    getExamType();
    getsubjects();
  }, []);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "papers",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleNavigate = () => {
    navigate(allRouterLink.UpdateExamSchedule);
  };

  // Watch for class and school year changes to check existing schedules
  useEffect(() => {
    const classId = watch("class_name");
    const yearId = watch("school_year");

    if (classId && yearId) {
      axiosInstance
        .get(
          `/d/Exam-Schedule/get_by_class_year/?class_name=${classId}&school_year=${yearId}`
        )
        .then((res) => setExistingSchedules(res.data))
        .catch((err) => setExistingSchedules([]));
    } else {
      setExistingSchedules([]);
    }
  }, [watch("class_name"), watch("school_year")]);

  const onSubmit = async (data) => {
  if (existingSchedules.length > 0) {
    setAlertMessage(
      "Exam schedule for this class and school year already exists!"
    );
    setShowAlert(true);
    return;
  }

  try {
    setError("");
    setSuccess("");

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

    const response = await axiosInstance.post(
      "/d/Exam-Schedule/create_timetable/",
      payload
    );

    if (response.status === 200 || response.status === 201) {
      setAlertMessage("Exam schedule created successfully!");
      setShowAlert(true);
      reset();
    } else {
      throw new Error(
        response.data?.message || "Failed to create exam schedule"
      );
    }
  } catch (err) {
    console.error("Backend error:", err);
    let backendError = "Failed to create exam schedule";

    if (err.response) {
      const data = err.response.data;
      if (typeof data === "string") {
        backendError = data;
      } else if (Array.isArray(data)) {
        backendError = data.join("\n");
      } else if (data?.message) {
        backendError = data.message;
      } else {
        backendError = Object.entries(data)
          .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(", ") : messages}`)
          .join("\n");
      }
    }

    setAlertMessage(backendError);
    setShowAlert(true);
  }
};
  const filteredSubjects = subjects
    .filter((subjectObj) =>
      subjectObj.subject_name.toLowerCase().includes(searchSubjectInput.toLowerCase())
    )
    .sort((a, b) => a.subject_name.localeCompare(b.subject_name));

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

  return (
    <div className="p-6 bg-gray-100 min-h-screen mb-24 md:mb-10  dark:bg-gray-900">
      <div className="w-full max-w-7xl mx-auto p-6 bg-base-100 rounded-box my-5 shadow-sm mb-10">
       

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="border-b border-gray-300 dark:border-gray-700 ">
          <h1 className="text-3xl font-bold text-center mb-8">
            Create Exam Schedule <i className="fa-solid fa-calendar-day ml-2"></i>
          </h1>
           <div className=" flex justify-end pb-2">
          <button
            className="btn bgTheme text-white"
            onClick={handleNavigate}
          >
           <i className="fa-solid fa-pen-nib ml-2"></i> Update Exam Schedule
          </button>
        </div></div>

          {error && (
            <div className="alert alert-error mb-6">
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="alert alert-success mb-6">
              <span>{success}</span>
            </div>
          )}

          {/* Warning if schedule exists */}
          {existingSchedules.length > 0 && (
            <p className="text-red-500 mb-4 font-medium">
              Exam schedule for this class and school year already exists!
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Class</span><span className="text-error">*</span>
              </label>
              <select
                className="select select-bordered w-full"
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
                <span className="text-red-500 text-sm mt-1">
                  {errors.class_name.message}
                </span>
              )}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">School Year</span><span className="text-error">*</span>
              </label>
              <select
                className="select select-bordered w-full"
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
                <span className="text-red-500 text-sm mt-1">
                  {errors.school_year.message}
                </span>
              )}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Exam Type</span><span className="text-error">*</span>
              </label>
              <select
                className="select select-bordered w-full"
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
                <span className="text-red-500 text-sm mt-1">
                  {errors.exam_type.message}
                </span>
              )}
            </div>
          </div>

          <div className="mt-10">
            <h2 className="text-xl font-semibold mb-4">Exam Papers</h2>

            {fields.map((field, index) => (
              <div
                key={field.id}
                className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6 bg-base-200 p-4 rounded-lg"
              >
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
                                // Set selected subject for this index
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
                                setShowSubjectDropdown(null);
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

                <div className="form-control">
                  <label className="label">Exam Date</label><span className="text-error">*</span>
                  <input
                    type="date"
                    className="input input-bordered w-full"
                    {...register(`papers.${index}.exam_date`, {
                      required: "Exam date is required",
                    })}
                  />
                </div>

                <div className="form-control">
                  <label className="label">Start Time</label><span className="text-error">*</span>
                  <input
                    type="time"
                    className="input input-bordered w-full"
                    {...register(`papers.${index}.start_time`, {
                      required: "Start time is required",
                    })}
                  />
                </div>

                <div className="form-control">
                  <label className="label">End Time</label><span className="text-error">*</span>
                  <input
                    type="time"
                    className="input input-bordered w-full"
                    {...register(`papers.${index}.end_time`, {
                      required: "End time is required",
                      validate: (value) => {
                        const startTime = watch(`papers.${index}.start_time`);
                        return value > startTime || "End time must be after start time";
                      },
                    })}
                  />
                </div>

                <div className="form-control md:col-span-4 gap-2 flex justify-end">
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

          <div className="flex justify-center mt-10">
            <button
              type="submit"
              className="btn bgTheme text-white"
              disabled={isSubmitting || existingSchedules.length > 0}
            >
              {isSubmitting ? (
                <i className="fa-solid fa-spinner fa-spin mr-2" />
              ) : (
                "Update Schedule"
              )}
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

export default ExamSchedule;

