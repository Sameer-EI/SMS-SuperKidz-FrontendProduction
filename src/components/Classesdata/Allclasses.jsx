import React, { useEffect, useState } from "react";
import { fetchYearLevels, fetchStudentYearLevelByClass } from "../../services/api/Api";
import { Link } from "react-router-dom";
import { useContext } from "react";


const Allclasses = () => {

  const [yearLevels, setYearLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const getYearLevels = async () => {
    setLoading(true);

    try {
      const data = await fetchYearLevels();
      const withCounts = await Promise.all(
        data.map(async (level) => {
          const students = await fetchStudentYearLevelByClass(level.id).catch(() => []);
          return {
            ...level,
            student_count: students.length,
          };
        })
      );
    

      setYearLevels(withCounts);

    } catch (err) {
      console.error("Error fetching year levels:", err);
      setError("Failed to fetch year levels. Please try again later.");
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    getYearLevels();
  }, []);

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
      <div className="bg-white dark:bg-gray-800 p-6 max-w-7xl mx-auto rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-4">
          <i className="fa-solid fa-graduation-cap mr-2" />
          All Year Levels
        </h1>

        <div className="overflow-x-auto no-scrollbar rounded-lg max-h-[70vh]">
          <table className="min-w-full table-auto">
            <thead className="bgTheme text-white sticky top-0 z--1 text-sm">
              <tr>
                <th scope="col" className="px-4 py-3 text-nowrap text-center">S.NO</th>
                <th scope="col" className="px-4 py-3 text-nowrap text-center">Year Level</th>
                <th scope="col" className="px-4 py-3 text-nowrap text-center">Number Of Students</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
              {yearLevels.length === 0 ? (
                <tr>
                  <td
                    colSpan="2"
                    className="text-center py-6  text-gray-500 dark:text-gray-400"
                  >
                    No data found.
                  </td>
                </tr>
              ) : (
                yearLevels.map((record, index) => (
                  <tr
                    key={record.id || index}
                    className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-4 py-3 text-center text-nowrap text-gray-700 dark:text-gray-300">
                      {index + 1}
                    </td>
                    <td className="px-4 py-3 font-bold text-nowrap text-center capitalize">
                      <Link
                        to={`/allStudentsPerClass/${record.id}`}
                        state={{ level_name: record.level_name }}
                        className="textTheme hover:underline"
                      >
                        {record.level_name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-center text-nowrap">{record.student_count}</td>
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

export default Allclasses;
