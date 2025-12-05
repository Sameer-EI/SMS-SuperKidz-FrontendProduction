import { useState, useEffect, useContext } from "react";
import { useForm } from "react-hook-form";
import {
  fetchSchoolYear,
  fetchYearLevels,
  fetchSubjects,
  fetchAllTeachers,
  fetchStudents2,
  fetchStudents1,
} from "../../services/api/Api";
import { AuthContext } from "../../context/AuthContext";
import { useRef } from "react";

const StudentMarksFill = () => {
  const { axiosInstance } = useContext(AuthContext);
  const [schoolYear, setSchoolYear] = useState([]);
  const [examType1, setExamType] = useState([]);
  const [className, setClassName] = useState([]);
  const [subjects1, setSubjects] = useState([]);
  const [teachers1, setTeachers] = useState([]);
  const [Students, setStudents] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [searchStudentInput, setSearchStudentInput] = useState("");
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const [selectedStudentName, setSelectedStudentName] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState(null);

  const [searchSubjectInput, setSearchSubjectInput] = useState("");
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);
  const [selectedSubjectName, setSelectedSubjectName] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");

  const [searchTeacherInput, setSearchTeacherInput] = useState("");
  const [showTeacherDropdown, setShowTeacherDropdown] = useState(false);
  const [selectedTeacherName, setSelectedTeacherName] = useState("");
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const subjectDropdownRef = useRef(null);
  const teacherDropdownRef = useRef(null);
  const studentDropdownRef = useRef(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  // Fetch Exam Types
  const getExamType = async () => {
    try {
      const response = await axiosInstance.get("/d/Exam-Type/");
      setExamType(response.data);
    } catch (err) {
      console.error("Failed to load exam types:", err);
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

  // Fetch all classes
  const getClassName = async () => {
    try {
      if (window.localStorage.getItem("teacher_id")) {
        const ClassName = await axiosInstance.get(
          `/d/Student-Marks/get_marks/?teacher_id=${window.localStorage.getItem(
            "teacher_id"
          )}`
        );

        const { data } = ClassName;
        console.log(data.assigned_classes);

        setClassName(data.assigned_classes);
      } else {
        const ClassName = await fetchYearLevels();
        setClassName(ClassName);
      }
    } catch (err) {
      console.log("Failed to load classes. Please try again." + err);
    }
  };

  // Fetch Subjects
  const getsubjects = async () => {
    try {
      const obj = await fetchSubjects();
      setSubjects(obj);
    } catch (err) {
      console.log("Failed to load subjects. Please try again." + err);
    }
  };

  // Fetch teachers
  const getTeachers = async () => {
    try {
      const obj = await fetchAllTeachers();
      console.log(obj);

      setTeachers(obj);
    } catch (err) {
      console.log("Failed to load teachers. Please try again." + err);
    }
  };

  // Fetch Students
  const getStudents = async (classId) => {
    try {
      const Students = await fetchStudents1(classId);
      setStudents(Students);
      console.log(Students);
    } catch (err) {
      console.log("Failed to load students. Please try again." + err);
    }
  };
  const test = async () => {
    try {
      const Students = await axiosInstance.get(
        "/d/Student-Marks/get_marks/?teacher_id=4"
      );

      console.log("test API", Students);
    } catch (err) {
      console.log("Failed to load students. Please try again." + err);
    }
  };

  useEffect(() => {
    test();
    getTeachers();
    getsubjects();
    getClassName();
    getSchool_year();
    getExamType();
  }, []);

  const handleClassChange = (e) => {
    const classId = e.target.value;
    setSelectedClassId(classId);
    setSelectedStudentId("");
    setSelectedStudentName("");
    setValue("student", "");
  };
  useEffect(() => {
    if (selectedClassId) {
      getStudents(selectedClassId);
    } else {
      setStudents([]);
    }
  }, [selectedClassId]);
  // Static data for dropdowns
  const examType = examType1;
  const className1 = className;
  const schoolYears = schoolYear;
  const subjects = subjects1;
  const teachers = teachers1;
  const students = Students;

  const onSubmit = async (data) => {
    const payload = {
      school_year_id: parseInt(data.school_year),
      exam_type_id: parseInt(data.exam_type),
      year_level_id: parseInt(data.year_level),
      data: [
        {
          teacher_id: parseInt(data.teacher),
          subject_id: parseInt(data.subject),
          student_marks: [
            {
              student_id: parseInt(data.student),
              marks: parseInt(data.marks),
            },
          ],
        },
      ],
    };

    try {
      const response = await axiosInstance.post(
        "/d/Student-Marks/create_marks/",
        payload
      );

      if (response.status === 200 || response.status === 201) {
        setAlertMessage("Student marks filled successfully!");
        setShowAlert(true);
        reset();
        setSelectedSubjectId("");
        setSelectedSubjectName("");
        setSelectedTeacherId("");
        setSelectedTeacherName("");
        setSelectedStudentId("");
        setSelectedStudentName("");
      } else {
        throw new Error("Failed to create exam schedule");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      if (error.response && error.response.data) {
        const { errors } = error.response.data;

        const formattedMessage = [...(errors || [])].join("\n");

        setAlertMessage(formattedMessage);
      } else {
        setAlertMessage("An unexpected error occurred.");
      }
      setShowAlert(true);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        subjectDropdownRef.current &&
        !subjectDropdownRef.current.contains(event.target)
      ) {
        setShowSubjectDropdown(false);
      }
      if (
        teacherDropdownRef.current &&
        !teacherDropdownRef.current.contains(event.target)
      ) {
        setShowTeacherDropdown(false);
      }
      if (
        studentDropdownRef.current &&
        !studentDropdownRef.current.contains(event.target)
      ) {
        setShowStudentDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredStudents = students
    .filter((studentObj) =>
      studentObj.student_name
        .toLowerCase()
        .includes(searchStudentInput.toLowerCase())
    )
    .sort((a, b) => a.student_name.localeCompare(b.student_name));
  const filteredSubjects = subjects
    .filter((subjectObj) =>
      subjectObj.subject_name
        .toLowerCase()
        .includes(searchSubjectInput.toLowerCase())
    )
    .sort((a, b) => a.subject_name.localeCompare(b.subject_name));

  const filteredTeachers = teachers
    .filter((teacherObj) =>
      `${teacherObj.first_name} ${teacherObj.last_name}`
        .toLowerCase()
        .includes(searchTeacherInput.toLowerCase())
    )
    .sort((a, b) =>
      `${a.first_name} ${a.last_name}`.localeCompare(
        `${b.first_name} ${b.last_name}`
      )
    );

  const tId = window.localStorage.getItem("teacher_id");
  const teacherFilterDropdown = teachers.find((user) => user.id == tId);

  return (
    <div className="min-h-screen p-5  bg-gray-50 dark:bg-gray-900 mb-24 md:mb-10">
      <div className="w-full max-w-7xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-box my-5 shadow-sm dark:shadow-gray-700">
        <form onSubmit={handleSubmit(onSubmit)}>
          <h1 className="text-3xl font-bold text-center mb-8">
            <i className="fa-solid fa-file-pen ml-2"></i> Fill Student Marks
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* School Year */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                School Year <span className="text-error">*</span>
              </label>
              <select
                {...register("school_year", {
                  required: "School year is required",
                })}
                className="select select-bordered w-full focus:outline-none  dark:bg-gray-700 dark:text-white dark:border-gray-600"
              >
                <option value="">Select School Year</option>
                {schoolYears?.map((year) => (
                  <option key={year.id} value={year.id}>
                    {year.year_name}
                  </option>
                ))}
              </select>
              {errors.school_year && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.school_year.message}
                </p>
              )}
            </div>

            {/* Year Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Year Level <span className="text-error">*</span>
              </label>
              <select
                {...register("year_level", {
                  required: "Year level is required",
                })}
                onChange={handleClassChange}
                className="select select-bordered w-full focus:outline-none  dark:bg-gray-700 dark:text-white dark:border-gray-600"
              >
                <option value="">Select Year Level</option>
                {className1?.map((level) => (
                  <option key={level.id} value={level.id}>
                    {level.level_name}
                  </option>
                ))}
              </select>
              {errors.year_level && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.year_level.message}
                </p>
              )}
            </div>

            {/* Exam Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Exam Type <span className="text-error">*</span>
              </label>
              <select
                {...register("exam_type", {
                  required: "Exam type is required",
                })}
                className="select select-bordered w-full focus:outline-none  dark:bg-gray-700 dark:text-white dark:border-gray-600"
              >
                <option value="">Select Exam Type</option>
                {examType?.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
              {errors.exam_type && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.exam_type.message}
                </p>
              )}
            </div>

            {/* Subject */}
            <div className="form-control relative" ref={subjectDropdownRef}>
              <label className="label">
                <span className="label-text flex items-center gap-1 text-gray-700 dark:text-gray-300">
                  Subject <span className="text-error">*</span>
                </span>
              </label>

              {/* Display box that toggles the dropdown */}
              <div
                className="input input-bordered w-full flex items-center justify-between cursor-pointer bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600"
                onClick={() => setShowSubjectDropdown(!showSubjectDropdown)}
              >
                {selectedSubjectName || "Select Subject"}
                <div>
                  <span class="arrow">&#9662;</span>
                </div>
              </div>

              {/* Hidden input to store selected subject ID */}
              <input
                type="hidden"
                {...register("subject", { required: "Subject is required" })}
                value={selectedSubjectId || ""}
              />

              {/* Dropdown */}
              {showSubjectDropdown && (
                <div className="absolute z-10 bg-white dark:bg-gray-700 rounded w-full mt-1 shadow-lg border border-gray-300 dark:border-gray-600">
                  {/* Search Input */}
                  <div className="p-2 sticky top-0 bg-white dark:bg-gray-700 shadow-sm">
                    <input
                      type="text"
                      placeholder="Search Subject..."
                      className="input input-bordered w-full focus:outline-none bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-500"
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
                            setSelectedSubjectId(subjectObj.id);
                            setSelectedSubjectName(subjectObj.subject_name);
                            setSearchSubjectInput("");
                            setShowSubjectDropdown(false);
                            setValue("subject", subjectObj.id, {
                              shouldValidate: true,
                            });
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
              {errors.subject && (
                <p className="text-error text-sm mt-1">
                  {errors.subject.message}
                </p>
              )}
            </div>

            {/* Teacher */}
            <div className="form-control relative" ref={teacherDropdownRef}>
              <label className="label">
                <span className="label-text flex items-center gap-1 text-gray-700 dark:text-gray-300">
                  Teacher <span className="text-error">*</span>
                </span>
              </label>

              {/* Display box that toggles the dropdown */}
              <div
                className="input input-bordered w-full flex items-center justify-between cursor-pointer bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600"
                onClick={() => setShowTeacherDropdown(!showTeacherDropdown)}
              >
                {selectedTeacherName || "Select Teacher"}
                <div>
                  <span class="arrow">&#9662;</span>
                </div>
              </div>

              {/* Hidden input for form data */}
              <input
                type="hidden"
                {...register("teacher", { required: "Teacher is required" })}
                value={selectedTeacherId || ""}
              />

              {/* Dropdown list */}
              {showTeacherDropdown && (
                <div className="absolute z-10 bg-white dark:bg-gray-700 rounded w-full mt-1 shadow-lg border border-gray-300 dark:border-gray-600">
                  {/* Search input inside dropdown */}
                  <div className="p-2 sticky top-0 shadow-sm bg-white dark:bg-gray-700">
                    <input
                      type="text"
                      placeholder="Search Teacher..."
                      className="input input-bordered w-full focus:outline-none bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-500"
                      value={searchTeacherInput}
                      onChange={(e) => setSearchTeacherInput(e.target.value)}
                      autoComplete="off"
                    />
                  </div>

                  {/* Teacher options */}
                  <div className="max-h-40 overflow-y-auto">
                    {filteredTeachers?.length > 0 ? (
                      window.localStorage.getItem("teacher_id") ? (
                        <p
                          key={teacherFilterDropdown.id}
                          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer text-gray-800 dark:text-gray-200 capitalize"
                          onClick={() => {
                            const fullName = `${teacherFilterDropdown.first_name} ${teacherFilterDropdown.last_name}`;
                            setSelectedTeacherId(teacherFilterDropdown.id);
                            setSelectedTeacherName(fullName);
                            setSearchTeacherInput("");
                            setShowTeacherDropdown(false);
                            setValue("teacher", teacherFilterDropdown.id, {
                              shouldValidate: true,
                            });
                          }}
                        >
                          {teacherFilterDropdown.first_name}{" "}
                          {teacherFilterDropdown.last_name}
                        </p>
                      ) : (
                        filteredTeachers.map((teacherObj) => (
                          <p
                            key={teacherObj.id}
                            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer text-gray-800 dark:text-gray-200 capitalize"
                            onClick={() => {
                              const fullName = `${teacherObj.first_name} ${teacherObj.last_name}`;
                              setSelectedTeacherId(teacherObj.id);
                              setSelectedTeacherName(fullName);
                              setSearchTeacherInput("");
                              setShowTeacherDropdown(false);
                              setValue("teacher", teacherObj.id, {
                                shouldValidate: true,
                              });
                            }}
                          >
                            {teacherObj.first_name} {teacherObj.last_name}
                          </p>
                        ))
                      )
                    ) : (
                      <p className="p-2 text-gray-500 dark:text-gray-400">
                        No teachers found.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Validation error */}
              {errors.teacher && (
                <p className="text-error text-sm mt-1">
                  {errors.teacher.message}
                </p>
              )}
            </div>

            {/* Student */}
            <div className="form-control relative" ref={studentDropdownRef}>
              <label className="label">
                <span className="label-text flex items-center gap-1 text-gray-700 dark:text-gray-300">
                  Student <span className="text-error">*</span>
                </span>
              </label>

              {/* Display box that toggles dropdown */}
              <div
                className="input input-bordered w-full flex items-center justify-between cursor-pointer bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600"
                onClick={() => setShowStudentDropdown(!showStudentDropdown)}
              >
                {selectedStudentName || "Select Student"}
                <div>
                  <span class="arrow">&#9662;</span>
                </div>
              </div>

              {/* Hidden input for react-hook-form */}
              <input
                type="hidden"
                {...register("student", { required: "Student is required" })}
                value={selectedStudentId || ""}
              />

              {/* Dropdown */}
              {showStudentDropdown && (
                <div className="absolute z-10 bg-white dark:bg-gray-700 rounded w-full mt-1 shadow-lg border border-gray-300 dark:border-gray-600">
                  {/* Search input inside dropdown */}
                  <div className="p-2 sticky top-0 shadow-sm bg-white dark:bg-gray-700">
                    <input
                      type="text"
                      placeholder="Search Student..."
                      className="input input-bordered w-full focus:outline-none bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-500"
                      value={searchStudentInput}
                      onChange={(e) => {
                        setSearchStudentInput(e.target.value);
                        setSelectedStudentName("");
                      }}
                      autoComplete="off"
                    />
                  </div>

                  {/* Student list */}
                  <div className="max-h-40 overflow-y-auto">
                    {!loadingStudents && filteredStudents.length > 0 ? (
                      filteredStudents.map((studentObj) => (
                        <p
                          key={studentObj.student_id}
                          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer text-gray-800 dark:text-gray-200 capitalize"
                          onClick={() => {
                            setSelectedStudentId(studentObj.student_id);
                            setSelectedStudentName(studentObj.student_name);
                            setSearchStudentInput("");
                            setShowStudentDropdown(false);
                            setValue("student", studentObj.student_id, {
                              shouldValidate: true,
                            });
                          }}
                        >
                          {studentObj.student_name}
                        </p>
                      ))
                    ) : (
                      <p className="p-2 text-gray-500 dark:text-gray-400">
                        {loadingStudents
                          ? "Loading students..."
                          : "No students found."}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Error message */}
              {errors.student && (
                <p className="text-error text-sm mt-1">
                  {errors.student.message}
                </p>
              )}
            </div>

            {/* Marks */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Marks <span className="text-error">*</span>
              </label>

              <input
                type="number"
                placeholder="Enter marks"
                {...register("marks", {
                  required: "Marks is required",
                  min: { value: 0, message: "Marks cannot be negative" },
                  max: { value: 100, message: "Marks cannot exceed 100" },
                  validate: {
                    isNumber: (value) =>
                      !isNaN(value) || "Marks must be a valid number",
                    noDecimal: (value) =>
                      Number.isInteger(Number(value)) ||
                      "Marks must be a whole number",
                  },
                })}
                className="input input-bordered w-full focus:outline-none dark:bg-gray-700 dark:text-white dark:border-gray-600 no-arrow"
              />

              {errors.marks && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.marks.message}
                </p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center mt-10">
            <button
              type="submit"
              className="btn text-white bgTheme w-52"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <i className="fa-solid fa-spinner fa-spin mr-2" />
              ) : (
                <i className="fa-solid fa-save mr-2" />
              )}
              {isSubmitting ? " " : "Save Marks"}
            </button>
          </div>
        </form>
      </div>
      {/* Modal */}
      {showAlert && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Student Marks</h3>
            <p className="py-4">
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

export default StudentMarksFill;
