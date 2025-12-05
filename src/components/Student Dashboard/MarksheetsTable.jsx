// import React, { useEffect, useState, useContext } from "react";
// import { Link } from "react-router-dom";
// import { AuthContext } from "../../context/AuthContext";

// const MarksheetsTable = () => {
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(false);
//   const [selectedClass, setSelectedClass] = useState("");
//   const [yearLevels, setYearLevels] = useState([]);
//   const [searchInput, setSearchInput] = useState("");
//   const [marksheet, setMarksheet] = useState([]);
//   const { axiosInstance } = useContext(AuthContext);

//   const getMarksheet = async () => {
//     setLoading(true);
//     setError(false);
//     try {
//       const response = await axiosInstance.get(`/d/report-cards/`);
//       if (response.data && response.data.length > 0) {
//         setMarksheet(response.data);
//       } else {
//         setMarksheet([]);
//       }
//     } catch (err) {
//       console.error("Failed to load marksheet:", err);
//       setError(true);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getYearLevels = async () => {
//     try {
//       const response = await axiosInstance.get("/d/year-levels/");
//       setYearLevels(response.data);
//     } catch (err) {
//       console.error("Error fetching year levels:", err);
//     }
//   };

//   useEffect(() => {
//     getYearLevels();
//     getMarksheet();
//   }, []);

//   const staticPayload = marksheet;

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
//         <p className="text-lg text-red-400 font-medium">Failed to load data, Try Again</p>
//       </div>
//     );
//   }

//   // Filters
//   const filterData = staticPayload.filter((detail) =>
//     detail.standard?.toLowerCase().includes(selectedClass.toLowerCase())
//   );
//   const filterBysearch = filterData.filter((detail) =>
//     detail.student_name?.toLowerCase().includes(searchInput.toLowerCase())
//   );

//   return (
//     <div className="p-6 bg-gray-100 min-h-screen">
//       <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-lg p-6 mb-10">
//         <div className="mb-4">
//           <h1 className="text-2xl md:text-3xl font-bold text-gray-800 text-center mb-4">
//             Marksheets <i className="fa-solid fa-address-card ml-2"></i>
//           </h1>
//         </div>

//         {/* Search & Filter */}
//         <div className="flex flex-wrap justify-between items-end gap-4 mb-4 w-full border-b pb-4">
//           <div className="w-full sm:w-xs">
//             <label className="text-sm font-medium text-gray-700 mb-1">
//               Select Class:
//             </label>
//             <select
//               className="select select-bordered w-full focus:outline-none"
//               value={selectedClass}
//               onChange={(e) => setSelectedClass(e.target.value)}
//             >
//               <option value="">All Classes</option>
//               {yearLevels.map((level) => (
//                 <option key={level.id} value={level.level_name}>
//                   {level.level_name}
//                 </option>
//               ))}
//             </select>
//           </div>
//           <input
//             type="text"
//             placeholder="Search Student Name..."
//             className="border px-3 py-2 rounded w-full sm:w-64 dark:bg-gray-700 dark:text-white dark:border-gray-600"
//             value={searchInput}
//             onChange={(e) => setSearchInput(e.target.value.trimStart())}
//           />
//         </div>

//         {/* Table */}
//         <div className="overflow-x-auto max-h-[70vh]">
//           <div className="inline-block min-w-full align-middle">
//             <div className="shadow-sm ring-1 ring-black ring-opacity-5 rounded-lg">
//               <table className="min-w-full divide-y divide-gray-300">
//                 <thead className="bgTheme text-white z-2 sticky top-0">
//                   <tr>
//                     <th className="px-4 py-3 text-left text-sm  text-nowrap font-bold">Student Name</th>
//                     <th className="px-4 py-3 text-left text-sm font-semibold text-nowrap">Father's Name</th>
//                     <th className="px-4 py-3 text-left text-sm font-semibold text-nowrap">Date of Birth</th>
//                     <th className="px-4 py-3 text-left text-sm font-semibold text-nowrap">Contact Number</th>
//                     <th className="px-4 py-3 text-left text-sm font-semibold text-nowrap">Class</th>
//                     <th className="px-4 py-3 text-left text-sm font-semibold text-nowrap">Academic Year</th>
//                     <th className="px-4 py-3 text-left text-sm font-semibold text-nowrap">Actions</th>
//                   </tr>
//                 </thead>

//                 <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
//                   {filterBysearch.length === 0 ? (
//                     <tr>
//                       <td colSpan="7" className="text-center py-6 text-gray-500">
//                         No marksheet data available
//                       </td>
//                     </tr>
//                   ) : (
//                     filterBysearch.map((detail) => (
//                       <tr key={detail.id} className="hover:bg-gray-50">
//                         <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
//                           {detail.student_name || "—"}
//                         </td>
//                         <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
//                           {detail.father_name || "—"}
//                         </td>
//                         <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
//                           {detail.date_of_birth || "—"}
//                         </td>
//                         <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
//                           {detail.contact_number || "—"}
//                         </td>
//                         <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
//                           {detail.standard || "—"}
//                         </td>
//                         <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
//                           {detail.academic_year || "—"}
//                         </td>
//                         <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
//                           <div className="flex space-x-2">
//                             <Link
//                               to={`/Marksheet/${detail.id}`}
//                               className="inline-flex items-center px-3 py-1 border border-yellow-300 rounded-md shadow-sm text-sm font-medium text-yellow-700 bg-yellow-50 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
//                             >
//                               View Marksheet
//                             </Link>
//                           </div>
//                         </td>
//                       </tr>
//                     ))
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MarksheetsTable;


import React, { useEffect, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { constants } from "../../global/constants";
import { allRouterLink } from "../../router/AllRouterLinks";

const MarksheetsTable = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedClass, setSelectedClass] = useState("");
  const [yearLevels, setYearLevels] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [marksheet, setMarksheet] = useState([]);
  const { axiosInstance } = useContext(AuthContext);
  const userRole = localStorage.getItem("userRole");

  const navigate = useNavigate();
  // Fetch marksheets
  const getMarksheet = async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await axiosInstance.get(`/d/report-cards/`);
      setMarksheet(response.data || []);
    } catch (err) {
      console.error("Failed to load marksheet:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  // Fetch classes
  const getYearLevels = async () => {
    try {
      const response = await axiosInstance.get("/d/year-levels/");
      setYearLevels(response.data || []);
    } catch (err) {
      console.error("Error fetching year levels:", err);
    }
  };

  useEffect(() => {
    getYearLevels();
    getMarksheet();
  }, []);

  // Filters

  const filteredData = marksheet
    .filter((detail) =>
      detail.year_level?.toLowerCase().includes(selectedClass.toLowerCase())
    )
    .filter((detail) =>
      detail.student?.toLowerCase().includes(searchInput.toLowerCase())
    )
    .sort((a, b) => a.student.localeCompare(b.student));


  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="flex space-x-2">
          <div className="w-3 h-3 bgTheme rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bgTheme rounded-full animate-bounce [animation-delay:-0.2s]"></div>
          <div className="w-3 h-3 bgTheme rounded-full animate-bounce [animation-delay:-0.4s]"></div>
        </div>
        <p className="mt-2 text-gray-500 dark:text-gray-300 text-sm">Loading data...</p>
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
    <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen mb-24 md:mb-10">
      <div className="max-w-7xl mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 mb-10">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white text-center mb-4">
          Marksheets <i className="fa-solid fa-address-card ml-2"></i>
        </h1>

        {/* Filters */}
        <div className="flex flex-wrap justify-between items-end gap-4 mb-4 w-full border-b border-gray-200 dark:border-gray-700 pb-4">
          <div className="w-full sm:w-xs">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Select Class:
            </label>
            <select
              className="select select-bordered w-full focus:outline-none dark:bg-gray-700 dark:text-white dark:border-gray-600"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="">All Classes</option>
              {yearLevels.map((level) => (
                <option key={level.id} value={level.level_name}>
                  {level.level_name}
                </option>
              ))}
            </select>
          </div>
          <div className=" flex justify-end gap-2">
            <div className="flex flex-col w-full sm:w-auto">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Search Name:
              </label>
              <input
                type="text"
                placeholder="Search Student Name..."
                className="border px-3 py-2 rounded w-full sm:w-64 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value.trimStart())}
              /></div>
            {(userRole === constants.roles.director ||
              userRole === constants.roles.officeStaff) && (
                <div className="pt-6">

                  <button
                    className="btn bgTheme text-white"
                    onClick={() => navigate(allRouterLink.createMarksheet)}
                  >
                    <i className="fa-solid fa-file-pen ml-2"></i>  Create Marksheet
                  </button>
                </div>
              )} </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto max-h-[70vh] rounded-lg">
          <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
            <thead className="bgTheme text-white sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-left text-nowrap text-sm font-semibold">Student Name</th>
                <th className="px-4 py-3 text-left text-nowrap text-sm font-semibold">Class</th>
                <th className="px-4 py-3 text-left text-nowrap text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-6 text-gray-500 dark:text-gray-300">
                    No marksheet data available
                  </td>
                </tr>
              ) : (
                filteredData.map((detail) => (
                  <tr key={detail.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="whitespace-nowrap text-nowrap px-4 py-3 text-sm font-bold text-gray-900 dark:text-gray-200">{detail.student}</td>
                    <td className="whitespace-nowrap text-nowrap px-4 py-3 text-sm text-gray-500 dark:text-gray-300">{detail.year_level}</td>
                    <td className="whitespace-nowrap text-nowrap px-4 py-3 text-sm text-gray-500 dark:text-gray-300">
                      <a
                        href={detail.file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1 border border-yellow-300 rounded-md shadow-sm text-sm font-medium text-yellow-700 bg-yellow-50 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                      >
                        View Marksheet
                      </a>
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

export default MarksheetsTable;
