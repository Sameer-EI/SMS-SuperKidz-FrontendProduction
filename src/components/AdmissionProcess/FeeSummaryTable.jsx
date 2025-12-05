import React, { useEffect, useState, useContext, useMemo } from "react";
import { fetchYearLevels } from "../../services/api/Api";
import { allRouterLink } from "../../router/AllRouterLinks";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

const FeeSummaryTable = () => {
  const { axiosInstance } = useContext(AuthContext);

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSchoolYear, setSelectedSchoolYear] = useState("");
  const [yearLevels, setYearLevels] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [allStudents, setAllStudents] = useState([]);


  const getYearLevels = async () => {
    try {
      const data = await fetchYearLevels();
      setYearLevels(data);
    } catch (err) {
      console.error("Error fetching year levels:", err);
    }
  };

 const getFeeData = async () => {
  setLoading(true);
  setError(null);

  try {
    const response = await axiosInstance.get("/d/studentfees/");
    const data = response.data;

    if (data && typeof data === "object" && data.detail === "No records found.") {
      setAllStudents([]);
      setStudents([]);
    } else if (Array.isArray(data)) {
      setAllStudents(data); 
      setStudents(data);     
    } else {
      setError("Unexpected response from server.");
    }
  } catch (err) {
    console.log(err);
    
  }

  setLoading(false);
};


  useEffect(() => {
    getYearLevels();
  }, []);

  useEffect(() => {
    getFeeData();
  }, [selectedMonth, selectedClass, selectedSchoolYear]);

  const resetFilters = () => {
    setSelectedMonth("");
    setSelectedClass("");
    setSelectedSchoolYear("");
    setSearchTerm("");
  };

const filteredStudents = allStudents
  .filter((student) => {
    const term = searchTerm.toLowerCase();

    const matchScholarNo = student.scholar_number
      ?.toString()
      .toLowerCase()
      .includes(term);

    const matchName = student.student_name
      ?.toLowerCase()
      .includes(term);

    const matchDueAmount = student.due_amount
      ?.toString()
      .toLowerCase()
      .includes(term);

    const matchYear =
      !selectedSchoolYear ||
      student.school_year_name?.toLowerCase() === selectedSchoolYear.toLowerCase();

    const matchClass =
      !selectedClass || student.student_class === selectedClass;

    const matchMonth =
      !selectedMonth || student.month_name === selectedMonth;

    return (matchScholarNo || matchName || matchDueAmount) &&
      matchYear &&
      matchClass &&
      matchMonth;
  })
  .sort((a, b) => {
    if (!a.student_name) return 1;
    if (!b.student_name) return -1;
    return a.student_name.localeCompare(b.student_name);
  });


const schoolYears = useMemo(() => {
  return [...new Set(allStudents.map((s) => s.school_year_name))];
}, [allStudents]);


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

  // if (error) {
  //   return (
  //     <div className="flex flex-col items-center justify-center min-h-screen text-center p-6">
  //       <i className="fa-solid fa-triangle-exclamation text-5xl text-red-400 mb-4"></i>
  //       <p className="text-lg text-red-400 font-medium">Failed to load data, Try Again</p>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen p-5 bg-gray-50 dark:bg-gray-900 mb-24 md:mb-10">
      <div className="bg-white dark:bg-gray-800 max-w-7xl p-6 rounded-lg shadow-lg mx-auto">
        <div className="mb-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 text-center">
            <i className="fa-solid fa-graduation-cap mr-2"></i> Students Fee Record
          </h1>
        </div>

        {/* Filter + Fee Dashboard Section */}
        <div className="w-full px-5">
          <div className="flex flex-wrap justify-between items-end gap-4 mb-2 w-full border-b pb-4 border-gray-200 dark:border-gray-700">

            {/* Left Side: Filters + Reset */}
            <div className="flex flex-wrap items-end gap-4 w-full sm:w-auto">
              {/* Class Filter */}
              <div className="flex flex-col w-full sm:w-auto">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Class</label>
                <select
                  className="select select-bordered w-full focus:outline-none dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                >
                  <option value="">All Classes</option>
                  {yearLevels.map((level) => (
                    <option key={level.id} value={level.level_name}>{level.level_name}</option>
                  ))}
                </select>
              </div>

              {/* Month Filter */}
              <div className="flex flex-col w-full sm:w-auto">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Month</label>
                <select
                  className="select select-bordered w-full focus:outline-none dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                >
                  <option value="">All Months</option>
                  {[
                    "January", "February", "March", "April", "May", "June", "July",
                    "August", "September", "October", "November", "December",
                  ].map((month) => (
                    <option key={month} value={month}>{month}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col w-full sm:w-auto">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Year</label>
                <select
                  className="select select-bordered w-full focus:outline-none dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                  value={selectedSchoolYear}
                  onChange={(e) => setSelectedSchoolYear(e.target.value)}
                >
                  <option value="">All Years</option>
                  {schoolYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reset Button */}
              <div className="mt-1 w-full sm:w-auto">
                <button
                  onClick={resetFilters}
                  className="bgTheme text-white text-sm px-5 py-2 rounded font-semibold h-10 w-full sm:w-auto"
                >
                  Reset Filters
                </button>
              </div>
            </div>

            {/* Right Side: Fee Dashboard + Search */}
            <div className="flex flex-col w-full sm:flex-row sm:items-end gap-4 sm:w-auto">
              <div className="flex flex-col w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Enter student name, scholar no, or due amount"    
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value.trimStart())}
                  className="border px-3 py-2 rounded w-full sm:w-64 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 focus:outline-none"
                />
              </div>
              <Link
                to={allRouterLink.feeDashboard}
                className="bgTheme text-white text-sm px-5 py-2 rounded font-semibold h-10 w-full sm:w-auto text-center"
              >
                Fee Dashboard
              </Link>
            </div>
          </div>
        </div>
    
        {/* Table Section */}
        <div className="w-full overflow-x-auto no-scrollbar max-h-[70vh] rounded-lg">
          <table className="min-w-full rounded-lg">
            <thead className="bgTheme text-white z-2 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-nowrap whitespace-nowrap">S.No</th>
                <th className="px-4 py-3 text-left text-nowrap whitespace-nowrap">Scholar No.</th>
                <th className="px-4 py-3 text-left text-nowrap whitespace-nowrap">Student Name</th>
                <th className="px-4 py-3 text-left text-nowrap whitespace-nowrap">Class</th>
                <th className="px-4 py-3 text-left text-nowrap whitespace-nowrap">Year</th>
                <th className="px-4 py-3 text-left text-nowrap whitespace-nowrap">Month</th>
                <th className="px-4 py-3 text-left text-nowrap whitespace-nowrap">Total Amount</th>
                <th className="px-4 py-3 text-left text-nowrap whitespace-nowrap">Paid Amount</th>
                <th className="px-4 py-3 text-left text-nowrap whitespace-nowrap">Due Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-6 text-gray-500 dark:text-gray-400">
                    No data found.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((record, index) => (
                  <tr
                    key={record.student_id || index}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    <td className="px-4 py-3 text-nowrap text-gray-800 dark:text-gray-100">{index + 1}</td>
                    <td className="px-4 py-3 text-nowrap text-gray-800 dark:text-gray-100">{record.scholar_number}</td>
                    <td className="px-4 py-3 text-nowrap text-gray-800 dark:text-gray-100">{record.student_name}</td>
                    <td className="px-4 py-3 text-nowrap text-gray-800 dark:text-gray-100">{record.student_class}</td>
                    <td className="px-4 py-3 text-nowrap text-gray-800 dark:text-gray-100">{record.school_year_name}</td>
                    <td className="px-4 py-3 text-nowrap text-gray-800 dark:text-gray-100">{record.month_name}</td>
                    <td className="px-4 py-3 text-nowrap text-gray-800 dark:text-gray-100">₹{record.original_amount}</td>
                    <td className="px-4 py-3 text-nowrap text-gray-800 dark:text-gray-100">₹{record.paid_amount}</td>
                    <td className="px-4 py-3 text-nowrap text-gray-800 dark:text-gray-100">₹{record.due_amount}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FeeSummaryTable;