import React, { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { fetchStudentYearLevelByClass } from "../../services/api/Api";
import { Link } from "react-router-dom";
import { Loader } from "../../global/Loader";

const AllStudentsPerClass = () => {
  const { id } = useParams();
  const location = useLocation();

  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSection, setSelectedSection] = useState("all");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const levelName = location.state?.level_name || "Unknown";
  const yearLevelName = location.state?.year_level_name || location.state?.year_name || null;

  const getStudents = async () => {
    try {
      // ✅ Pass yearLevelName to API function
      const data = await fetchStudentYearLevelByClass(id, yearLevelName);
      const sortedData = [...data].sort((a, b) =>
        (a.student_name || "").localeCompare(b.student_name || "", "en", { sensitivity: "base" })
      );

      setStudents(sortedData);
    } catch (err) {
      console.error("Error fetching students:", err);
      setError("Failed to fetch students.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getStudents();
  }, [id, yearLevelName]);

  // Get unique sections for filter dropdown - Sorted alphabetically
  const sections = ["all", ...new Set(students.map(student => student.section).filter(Boolean))];
  // Sort the sections alphabetically (excluding "all")
  const sortedSections = ["all", ...sections.filter(s => s !== "all").sort((a, b) => 
    a.localeCompare(b, undefined, { sensitivity: 'base' })
  )];

  // Filter students by search term and section
  const filteredStudents = students.filter((student) => {
    const matchesSearch = student.student_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSection = selectedSection === "all" || student.section === selectedSection;
    return matchesSearch && matchesSection;
  });

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
    <div className="min-h-screen p-5 bg-gray-50 dark:bg-gray-900 mb-24 md:mb-10">
      <div className="bg-white dark:bg-gray-800 max-w-7xl p-6 rounded-lg shadow-lg mx-auto">

        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
            <i className="fa-solid fa-graduation-cap mr-2" />
            Students in {levelName}
          </h1>
          {yearLevelName && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Academic Year: {yearLevelName}
            </p>
          )}
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-end gap-4 mb-6 border-b border-gray-200 dark:border-gray-700 pb-2">
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {/* Section Filter Dropdown - Sorted alphabetically */}
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="border px-3 py-2 rounded w-full sm:w-40 dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Sections</option>
              {sortedSections.map((section) =>
                section !== "all" && (
                  <option key={section} value={section}>
                    {section}
                  </option>
                )
              )}
            </select>

            {/* Search Input */}
            <input
              type="text"
              placeholder="Search Student Name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value.trimStart())}
              className="border px-3 py-2 rounded w-full sm:w-64 dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && (
            <div className="text-red-600 font-medium text-sm text-center sm:text-right w-full sm:w-auto">
              {error}
            </div>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto max-h-[70vh] rounded-lg">
          <table className="min-w-full table-auto">
            <thead className="bgTheme text-white sticky top-0 z--10 text-sm">
              <tr>
                <th scope="col" className="px-4 py-3 text-center text-nowrap">S.NO</th>
                <th scope="col" className="px-4 py-3 text-center text-nowrap">Student Name</th>
                <th scope="col" className="px-4 py-3 text-center text-nowrap">Section</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-4 py-6 text-nowrap text-center text-sm text-gray-500 dark:text-gray-400">
                    No students found.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((record, index) => (
                  <tr
                    key={record.id || index}
                    className="hover:bg-gray-50 text-nowrap dark:hover:bg-gray-700 transition-colors text-center"
                  >
                    <td className="px-4 py-3 text-nowrap text-gray-700 dark:text-gray-300">
                      {index + 1}
                    </td>
                    <td className="px-4 py-3 font-bold capitalize text-gray-700 dark:text-gray-300 text-nowrap">
                      <Link
                        to={`/Studentdetails/${record.student_id}`}
                        className="textTheme hover:underline"
                      >
                        {record.student_name || "Unnamed"}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                        {record.section || "-"}
                      </span>
                    </td>
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

export default AllStudentsPerClass;