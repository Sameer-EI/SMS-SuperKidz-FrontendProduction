import React, { useContext, useEffect, useState, useRef } from "react";
import { fetchAdmissionDetails, fetchYearLevels } from "../../services/api/Api";
import { Link } from "react-router-dom";
import { allRouterLink } from "../../router/AllRouterLinks";
import { AuthContext } from "../../context/AuthContext";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";


export const AdmissionDetails = () => {
  const { axiosInstance } = useContext(AuthContext);
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState("");
  const [yearLevels, setYearLevels] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [error, setError] = useState(false);
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDownloadOptions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);



  const [studentData, setStudentData] = useState([]);

  const getAdmissionDetails = async () => {
    try {
      // const data = await fetchAdmissionDetails();
      // setDetails(data);
      const data = normalizeStudents(await fetchAdmissionDetails());
      setDetails(data);

      setLoading(false);

      const stu = await axiosInstance.get("s/students/student_details/");
      setStudentData(normalizeStudents(stu.data));
    } catch (error) {
      console.log("failed to fetch admission details", error);
      setError(true);
      setLoading(false);
    }
  };

  const normalizeStudents = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    if (Array.isArray(data?.data)) return data.data;
    if (typeof data === "object") {
      // single object → wrap
      if ("student_id" in data || "student_name" in data) return [data];
      // object keyed by ids → take values that look like students
      const vals = Object.values(data).filter(
        v => v && typeof v === "object" && ("student_id" in v || "student_name" in v)
      );
      if (vals.length) return vals;
    }
    return [];
  };

  useEffect(() => {
    getAdmissionDetails();
  }, []);
  const getYearLevels = async () => {
    try {
      const data = await fetchYearLevels();
      setYearLevels(data);
    } catch (err) {
      console.error("Error fetching year levels:", err);
    }
  };

  useEffect(() => {
    getYearLevels();
  }, []);



  const handleDownloadExcel = (input = []) => {
    const data = normalizeStudents(input);
    if (!data.length) {
      return;
    }

    const formattedData = data.map((s) => ({
      ID: s.student_id ?? s.id ?? "",
      "Scholar No": s["scholar number"] ?? "",
      "Enrollment No": s.enrollment_no ?? "",
      Name: s.student_name ?? "",
      Class: s.class ?? "",
      Age: s.age ?? "",
      Gender: s.gender ?? "",
      "Date of Birth": s.date_of_birth ?? "",
      Category: s.category ?? "",
      Religion: s.religion ?? "",
      "No. of Siblings": s["no. of siblings"] ?? "",
      Active: s.is_active ? "Yes" : "No",
      "RTE Status": s.is_rte ? "Yes" : "No",
      "RTE Number": s["rte number"] ?? "",
      Phone: s.contact_number ?? "",
      Email: s.email ?? "",
      Father: s.father_name ?? "",
      Mother: s.mother_name ?? "",
      Guardian: s.guardian_name ?? "",
      "Guardian Phone": s["guardian's contact no."] ?? "",
      Address: s.full_address ?? "",
      Aadhaar: s["adhaar number"] ?? s["aadhaar number"] ?? "",
      "Bank Account": s["bank details"]?.account_no ?? "N/A",
      IFSC: s["bank details"]?.ifsc_code ?? "N/A",
      "Annual Income": s["annual income"] ?? s.annual_income ?? "",
      "School Year": s["school year"] ?? "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students");

    XLSX.writeFile(workbook, "Student_Details_Report.xlsx");
  };


  const handleDownloadStudentDataPDF = (input = []) => {
    const data = normalizeStudents(input);
    if (!data.length) {
      return;
    }


    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a3" });

    const margin = 10;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Student Details Report", margin, 12);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - margin, 12, { align: "right" });

    const fmtDate = (d) => {
      if (!d) return "";
      const date = new Date(d);
      return isNaN(date)
        ? String(d)
        : date.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
    };
    const fmtNumberIN = (n) => {
      if (n === null || n === undefined || n === "" || n === "N/A") return "N/A";
      const num = Number(n);
      return Number.isNaN(num)
        ? String(n)
        : new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(num);
    };
    const safe = (v) => (v === null || v === undefined ? "" : String(v));

    // Build one row per student. Some columns are multi-line to save width.
    const body = data.map((s) => {
      const id = safe(s.student_id ?? s.id);
      const scholar = safe(s["scholar number"] ?? "");
      const enroll = safe(s.enrollment_no ?? "");
      const schEnroll = `S:${scholar}${scholar && enroll ? "  " : ""}E:${enroll}`.trim();
      const name = safe(s.student_name);
      const className = safe(s.class);
      const age = s.age ?? "";
      const gender = s.gender ? s.gender[0].toUpperCase() + s.gender.slice(1) : "";
      const dob = fmtDate(s.date_of_birth);
      const category = safe(s.category);
      const religion = safe(s.religion);
      const catRel = `Cat:${category}\nRel:${religion}`;
      const siblings = s["no. of siblings"] ?? "";
      const active = s.is_active ? "Yes" : "No";
      const rteNo = s["rte number"] ?? "";
      const rte = s.is_rte ? `Yes${rteNo ? `\n#${rteNo}` : ""}` : "No";
      const phone = safe(s.contact_number);
      const email = safe(s.email);
      const father = safe(s.father_name);
      const mother = safe(s.mother_name);
      const parents = `F:${father}\nM:${mother}`;
      const guardianName = safe(s.guardian_name);
      const guardianPhone = safe(s["guardian's contact no."] ?? "");
      const guardian = `G:${guardianName}\nC:${guardianPhone}`;
      const address = safe(s.full_address);
      const aadhaar = safe(s["adhaar number"] ?? s["aadhaar number"] ?? "");
      const bankAcc = safe(s["bank details"]?.account_no ?? "N/A");
      const ifsc = safe(s["bank details"]?.ifsc_code ?? "N/A");
      const bank = `A/C:${bankAcc}\nIFSC:${ifsc}`;
      const annualIncome = fmtNumberIN(s["annual income"] ?? s.annual_income);
      const year = safe(s["school year"] ?? "");

      return [
        id, schEnroll, name, className, age, gender, dob, catRel, siblings, active,
        rte, phone, email, parents, guardian, address, aadhaar, bank, annualIncome, year,
      ];
    });

    autoTable(doc, {
      startY: 18,
      theme: "grid",
      showHead: "everyPage",
      rowPageBreak: "avoid",
      head: [[
        "ID", "Sch/En", "Name", "Class", "Age", "Gender", "DOB", "Cat/Rel", "Siblings", "Active",
        "RTE", "Phone", "Email", "Parents", "Guardian", "Address", "Aadhaar", "Bank", "Income", "Year",
      ]],
      body,
      margin: { top: 15, left: margin, right: margin },
      styles: {
        fontSize: 6.3,
        cellPadding: 1.0,
        overflow: "linebreak",
        valign: "middle",
      },
      headStyles: {
        fillColor: [30, 64, 175],
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: {
        0: { cellWidth: 10, halign: "center" }, // ID
        1: { cellWidth: 24 },                   // Sch/En
        2: { cellWidth: 30 },                   // Name
        3: { cellWidth: 14 },                   // Class
        4: { cellWidth: 8, halign: "center" },  // Age
        5: { cellWidth: 12 },                   // Gender
        6: { cellWidth: 16 },                   // DOB
        7: { cellWidth: 20 },                   // Cat/Rel
        8: { cellWidth: 20, halign: "center" }, // Siblings
        9: { cellWidth: 10, halign: "center" }, // Active
        10: { cellWidth: 16 },                  // RTE
        11: { cellWidth: 20 },                  // Phone
        12: { cellWidth: 24 },                  // Email
        13: { cellWidth: 22 },                  // Parents
        14: { cellWidth: 22 },                  // Guardian
        15: { cellWidth: 50 },                  // Address
        16: { cellWidth: 22 },                  // Aadhaar
        17: { cellWidth: 26 },                  // Bank (A/C + IFSC)
        18: { cellWidth: 18, halign: "right" }, // Income
        19: { cellWidth: 14 },                  // Year
      },
      didDrawPage: (data) => {
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text(`Page ${data.pageNumber} of ${pageCount}`, pageWidth - margin, pageHeight - 6, { align: "right" });
      },
    });

    doc.save("Student_Details_Report.pdf");
  };


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
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="flex space-x-2">
          <div className="w-3 h-3 bgTheme rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bgTheme rounded-full animate-bounce [animation-delay:-0.2s]"></div>
          <div className="w-3 h-3 bgTheme rounded-full animate-bounce [animation-delay:-0.4s]"></div>
        </div>
        <p className="mt-2 text-gray-500 text-sm">Loading...</p>
      </div>
    );
  }
  if (!details) {
    return <div className="p-4 text-center">No admission records found</div>;
  }

  const filterData = details.filter((detail) => {

    const matchesClass = (detail.year_level ?? "")
      .toLowerCase()
      .includes(selectedClass.toLowerCase());


    const matchesDate = selectedDate
      ? detail.admission_date === selectedDate
      : true;

    return matchesClass && matchesDate;
  });


  const filterBysearch = filterData.filter((detail) => {
    const search = searchInput.toLowerCase();

    // Ensure student_input and guardian_input are always objects
    const student = detail.student_input || {};
    const guardian = detail.guardian_input || {};

    const studentName = `${student.first_name ?? ""} ${student.last_name ?? ""}`.toLowerCase();
    const guardianName = `${guardian.first_name ?? ""} ${guardian.last_name ?? ""}`.toLowerCase();

    return studentName.includes(search) || guardianName.includes(search);
  });

  const sortedData = [...filterBysearch].sort((a, b) => {
    const nameA = `${a.student_input?.first_name ?? ""} ${a.student_input?.last_name ?? ""}`.toLowerCase();
    const nameB = `${b.student_input?.first_name ?? ""} ${b.student_input?.last_name ?? ""}`.toLowerCase();
    return nameA.localeCompare(nameB);
  });

  console.log(sortedData);

  return (
    <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen mb-24 md:mb-10">
      <div className="max-w-7xl mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 text-center mb-4  border-gray-200 dark:border-gray-700">
            <i className="fa-solid fa-clipboard-list w-5"></i> Student Details
          </h1>
        </div>
        <div className="w-full px-5">
          <div className="flex flex-wrap justify-between items-end gap-4 mb-6 w-full border-b border-gray-300 dark:border-gray-700 pb-4">

            {/* Left Side: Filters */}
            <div className="flex flex-wrap items-end gap-4 w-full sm:w-auto">
              {/* Class Filter */}
              <div className="flex flex-col w-full sm:w-auto">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Search By Class:
                </label>
                <select
                  className="select select-bordered w-full focus:outline-none dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
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

              {/* Date Filter */}
              <div className="flex flex-col w-full sm:w-auto">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Search By Date:
                </label>
                <input
                  type="date"
                  className="input input-bordered w-full focus:outline-none dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>


              {/* Reset Button */}
              <div className="mt-1 w-full sm:w-auto">
                <button
                  onClick={() => {
                    setSelectedClass("");
                    setSelectedDate("");
                    setSearchInput("");
                  }}
                  className="btn bgTheme text-white"
                >
                  Reset Filters
                </button>
              </div>
              <div className="mt-1 w-full sm:w-auto relative group" ref={dropdownRef}>
                <button
                  className="btn bgTheme text-white flex items-center"
                  onClick={() => setShowDownloadOptions(prev => !prev)}
                >
                  <i className="fa-solid fa-file-arrow-down mr-2"></i> Download All Student Info
                  <i className="fa-solid fa-caret-down ml-2"></i>
                </button>

                {showDownloadOptions && (
                  <div className="absolute z-10 mt-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
                    <button
                      onClick={() => {
                        handleDownloadStudentDataPDF(studentData);
                        setShowDownloadOptions(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      Download as PDF
                    </button>
                    <button
                      onClick={() => {
                        handleDownloadExcel(studentData);
                        setShowDownloadOptions(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      Download as Excel (.xlsx)
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Side: Search */}
            <div className="flex items-end gap-2 w-full sm:w-auto justify-end">
              <div className="flex flex-col w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Student Name or Guardian Name"
                  className="input input-bordered w-full sm:w-64 focus:outline-none dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value.trimStart())}
                />
              </div>
            </div>
          </div>
        </div>
        {filterData.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">No admission records found.</p>
        ) : (
          <div className="overflow-x-auto no-scrollbar max-h-[70vh] rounded-lg">
            <div className="inline-block min-w-full align-middle rounded-lg">
              <div className="shadow-sm ring-1 ring-black ring-opacity-5 rounded-lg">
                <div className="overflow-x-auto no-scrollbar max-h-[70vh] rounded-lg">
                  <div className="inline-block min-w-full align-middle rounded-lg">
                    <div className="shadow-sm ring-1 ring-black ring-opacity-5 rounded-lg">
                      <table className="min-w-full divide-gray-300 dark:divide-gray-700">
                        <thead className="bgTheme text-white z-2 sticky top-0">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-nowrap">Student Name</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-nowrap">Parent/Guardian</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-nowrap">Date of Birth</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-nowrap">Gender</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-nowrap">Class</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-nowrap">RTE</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-nowrap">Admission Date</th>
                            <th className="px-8 py-3 text-left text-sm font-semibold text-nowrap">Status</th>
                            <th className="px-10 py-3 text-left text-sm font-semibold text-nowrap">Actions</th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                          {sortedData.length > 0 ? (
                            sortedData.map((detail) => (
                              <tr key={detail.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                                {/* Student Name */}
                                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                  {detail.student_input?.first_name ?? ""} {detail.student_input?.last_name ?? ""}
                                </td>

                                {/* Parent/Guardian */}
                                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500 dark:text-gray-300">
                                  {detail.guardian_input?.first_name ?? ""} {detail.guardian_input?.last_name ?? ""} ({detail.guardian_type || "N/A"})
                                </td>

                                {/* Date of Birth */}
                                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500 dark:text-gray-300">
                                  {detail.student_input?.date_of_birth ?? ""}
                                </td>

                                {/* Gender */}
                                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500 dark:text-gray-300">
                                  {detail.student_input?.gender ?? ""}
                                </td>

                                {/* Class */}
                                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500 dark:text-gray-300">
                                  {detail.year_level ?? ""}
                                </td>

                                {/* RTE */}
                                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500 dark:text-gray-300">
                                  {detail.is_rte ? "Yes" : "No"}
                                </td>

                                {/* Admission Date */}
                                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500 dark:text-gray-300">
                                  {detail.admission_date
                                    ? new Date(detail.admission_date).toLocaleDateString("en-GB").replaceAll("/", "-")
                                    : ""}
                                </td>

                                {/* Status */}
                                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500 dark:text-gray-300">
                                  <span
                                    className={`inline-flex items-center px-4 py-1 rounded-full text-xs font-medium ${detail.student_input?.is_active
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                      }`}
                                  >
                                    {detail.student_input?.is_active ? "Active" : "InActive"}
                                  </span>
                                </td>

                                {/* Actions */}
                                <td className="whitespace-nowrap px-4 py-3 text-sm">
                                  <div className="flex space-x-2">
                                    <Link
                                      to={allRouterLink.editAddmisionDetails.replace(":id", detail.id)}
                                      className="inline-flex items-center px-3 py-1 border border-yellow-300 rounded-md shadow-sm text-sm font-medium text-yellow-700 bg-yellow-50 hover:bg-yellow-100"
                                    >
                                      Edit
                                    </Link>
                                    <Link
                                      to={allRouterLink.addmissionDetailsById.replace(":id", detail.id)}
                                      className="inline-flex items-center px-3 py-1 border border-[#5E35B1] rounded-md shadow-sm text-sm font-medium textTheme bg-blue-50 hover:bg-blue-100"
                                    >
                                      View
                                    </Link>
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="9" className="text-center py-6 text-gray-500 dark:text-gray-400">
                                No data found.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div> 
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

