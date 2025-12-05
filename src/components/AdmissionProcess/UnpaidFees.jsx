import React, { useEffect, useState, useContext } from "react";
import { fetchYearLevels } from "../../services/api/Api";
import { AuthContext } from "../../context/AuthContext";
import { constants } from "../../global/constants";

const UnpaidFeesList = () => {
  const { userRole, yearLevelID, userID, studentID, axiosInstance } = useContext(AuthContext);

  const [unpaidFees, setUnpaidFees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [yearLevels, setYearLevels] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loder, setLoder] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  // Fetch year levels 
  const getYearLevels = async () => {
    try {
      const data = await fetchYearLevels();
      setYearLevels(data);
    } catch (err) {
      console.error("Error fetching year levels:", err);
    }
  };

  const loadUnpaidFees = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/d/studentfees/overdue_fees/");
      const data = Array.isArray(response.data) ? response.data : [];
      setUnpaidFees(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching unpaid fees:", err.response?.data || err.message);
      setError("Failed to load unpaid fees");
      setUnpaidFees([]);
    } finally {
      setLoading(false);
    }
  };

  // Local filtering for all filters
  const filteredFees = unpaidFees.filter((item) => {
    console.log(item);

    const matchesSearch = (item.student_name || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMonth = selectedMonth ? item.month === selectedMonth : true;
    const matchesClass = selectedClass ? item.class_name == selectedClass : true;
    return matchesSearch && matchesMonth && matchesClass;
  });
  console.log(selectedClass);

  const sortedFees = [...filteredFees].sort((a, b) =>
    (a.student_name || "").localeCompare(b.student_name || "", undefined, { sensitivity: "base" })
  );


  // Send notification using axiosInstance 
  const handleSendNotifications = async () => {
    try {
      setLoder(true);
      const response = await axiosInstance.get("/d/fee-record/student_unpaid_fees/");
      setNotifications(response.data.notifications || []);
      setModalMessage(" WhatsApp notifications sent successfully!");
      setShowModal(true);
    } catch (err) {
      setModalMessage(" Failed to send notifications!");
      setShowModal(true);
    } finally {
      setLoder(false);
    }
  };

  useEffect(() => {
    getYearLevels();
  }, []);

  useEffect(() => {
    loadUnpaidFees();
  }, [selectedMonth, selectedClass]);

  const resetFilters = () => {
    setSelectedMonth("");
    setSelectedClass("");
    setSearchTerm("");
  };

  // Updated filtering/sorting for flat shape
  // const filteredFees = unpaidFees.filter((item) =>
  //   (item.student_name || "").toLowerCase().includes(searchTerm.toLowerCase())
  // );

  // const sortedFees = [...filteredFees].sort((a, b) =>
  //   (a.student_name || "").localeCompare(b.student_name || "", undefined, { sensitivity: "base" })
  // );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="flex space-x-2">
          <div className="w-3 h-3 bgTheme rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
          <div className="w-3 h-3 bgTheme rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
          <div className="w-3 h-3 bgTheme rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
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
    <div className="min-h-screen p-5 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 mb-24 md:mb-10">
      <div className="bg-white dark:bg-gray-800 max-w-7xl p-6 rounded-lg shadow-lg mx-auto">
        {/* Title */}
        <div className="mb-4">
          <h1 className="text-2xl md:text-3xl font-bold text-center mb-4">
            <i className="fa-solid fa-graduation-cap mr-2"></i> Overdue Accounts Summary
          </h1>
        </div>

        {/* Filter Section */}
        <div className="w-full px-5">
          <div className="flex flex-wrap justify-between items-end gap-4 mb-6 w-full border-b border-gray-300 dark:border-gray-700 pb-4">
            <div className="flex flex-wrap items-end gap-4 w-full sm:w-auto">
              {/* Month Filter */}
              <div className="flex flex-col w-full sm:w-auto">
                <label className="text-sm font-medium mb-1">Search by Month</label>
                <select
                  className="select select-bordered w-full focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
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

              {/* Class Filter */}
              {(userRole === constants.roles.director || userRole === constants.roles.officeStaff) && (
                <div className="flex flex-col w-full sm:w-auto">
                  <label className="text-sm font-medium mb-1">Search by Class</label>
                  <select
                    className="select select-bordered w-full focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                  >
                    <option value="">All Classes</option>
                    {yearLevels.map((level) => (
                      <option key={level.id} value={level.level_name}>{level.level_name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Reset Button */}
              <div className="mt-1 w-full sm:w-auto">
                <button
                  onClick={resetFilters}
                  className="btn bgTheme text-white"
                >
                  Reset Filters
                </button>
              </div>
            </div>

            {/*  Search */}
            <div className="flex items-end gap-2 w-full sm:w-auto justify-end">
              <div className="flex flex-col w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Enter student name"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value.trimStart())}
                  className="border px-3 py-2 rounded w-full sm:w-64 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
              </div>
              {/* <button
                onClick={handleSendNotifications}
                className="btn bgTheme text-white"
              >
                {loder ? (
                  <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                ) : (
                  <>
                    <i className="fa-solid fa-bell mr-2"></i> Reminder
                  </>
                )}
              </button> */}
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="overflow-x-auto rounded-lg no-scrollbar max-h-[70vh]">
          <table className="min-w-full table-auto divide-y divide-gray-300 dark:divide-gray-700">
            <thead className="bgTheme text-white sticky top-0 z-2">
              <tr>
                <th className="px-4 py-3 text-left text-nowrap whitespace-nowrap">S.No</th>
                <th className="px-4 py-3 text-left text-nowrap whitespace-nowrap">Student Name</th>
                <th className="px-4 py-3 text-left text-nowrap whitespace-nowrap">Class</th>
                <th className="px-4 py-3 text-left text-nowrap whitespace-nowrap">Month</th>
                <th className="px-4 py-3 text-left text-nowrap whitespace-nowrap">Fee Type</th>
                <th className="px-4 py-3 text-left text-nowrap whitespace-nowrap">Total Amount</th>
                <th className="px-4 py-3 text-left text-nowrap whitespace-nowrap">Paid Amount</th>
                <th className="px-4 py-3 text-left text-nowrap whitespace-nowrap">Due Amount</th>
                <th className="px-4 py-3 text-left text-nowrap whitespace-nowrap">Payment Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
              {sortedFees.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-6 text-gray-500 dark:text-gray-400">
                    No data found.
                  </td>
                </tr>
              ) : (
                sortedFees.map((item, index) => {
                  const isPaid = parseFloat(item.due_amount) <= 0 || item.status?.toLowerCase() === "paid";
                  return (
                    <tr key={item.fee_id || index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-3">{index + 1}</td>
                      <td className="px-4 py-3 text-nowrap font-bold">{item.student_name}</td>
                      <td className="px-4 py-3 text-nowrap">{item.class_name}</td>
                      <td className="px-4 py-3 text-nowrap">{item.month}</td>
                      <td className="px-4 py-3 text-nowrap">{item.fee_type}</td>
                      <td className="px-4 py-3 text-nowrap">₹{item.original_amount}</td>
                      <td className="px-4 py-3 text-nowrap">₹{item.paid_amount}</td>
                      <td className="px-4 py-3 text-nowrap">₹{item.due_amount}</td>
                      <td
                        className={`inline-flex items-center px-3 py-1 rounded-md shadow-sm text-sm font-medium m-2 ${isPaid ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                          }`}
                      >
                        {item.status || (isPaid ? "Paid" : "Unpaid")}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <dialog className="modal modal-open">
          <div className="modal-box dark:bg-gray-800 dark:text-gray-100">
            <h3 className="font-bold text-lg"> Notification</h3>
            <p className="py-4 whitespace-pre-line">{modalMessage}</p>
            <div className="modal-action">
              <button className="btn bgTheme text-white w-32" onClick={() => setShowModal(false)}>OK</button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
};

export default UnpaidFeesList;