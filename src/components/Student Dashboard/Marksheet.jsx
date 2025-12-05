import React, { useState, useEffect, useRef, useContext } from "react";
import { useParams } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

const Marksheet = () => {
  const printRef = useRef();
  const { id } = useParams();
  const [marksheet, setMarksheet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { axiosInstance } = useContext(AuthContext);

  const getMarksheet = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!id) throw new Error("No id available");

      const response = await axiosInstance.get(`/d/report-cards/${id}/`);
      setMarksheet(response.data);
    } catch (err) {
      console.error("Failed to load marksheet:", err);
      setError(err.message || "Failed to load marksheet data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getMarksheet();
  }, []);

  const handlePrint = () => {
    const originalContents = document.body.innerHTML;
    const printContents = printRef.current.innerHTML;

    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  };

  const safeString = (value) =>
    value === null || value === undefined || value === "null" ? "—" : value;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="flex space-x-2">
          <div className="w-3 h-3 bgTheme rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bgTheme rounded-full [animation-delay:-0.2s] animate-bounce"></div>
          <div className="w-3 h-3 bgTheme rounded-full [animation-delay:-0.4s] animate-bounce"></div>
        </div>
        <p className="mt-2 text-gray-500 dark:text-gray-400 text-sm">Loading data...</p>
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

  if (!marksheet) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-600 dark:text-gray-400">No marksheet data available</p>
      </div>
    );
  }

  const data = marksheet;

  // Get all subjects from SA1/SA2/FA exams
  const allSubjects = Array.from(
    new Set(
      data.subjects.flatMap((exam) =>
        exam.subjects ? Object.keys(exam.subjects) : []
      )
    )
  );

  // Get subject scores safely
  const getSubjectScores = (subjectName) => {
    const fa1 = data.subjects.find((e) => e.exam_type === "fa1")?.subjects?.[subjectName] ?? "-";
    const fa2 = data.subjects.find((e) => e.exam_type === "fa2")?.subjects?.[subjectName] ?? "-";
    const sa1 = data.subjects.find((e) => e.exam_type === "sa1")?.subjects?.[subjectName] ?? "-";
    const fa3 = data.subjects.find((e) => e.exam_type === "fa3")?.subjects?.[subjectName] ?? "-";
    const sa2 = data.subjects.find((e) => e.exam_type === "sa2")?.subjects?.[subjectName] ?? "-";

    let avg = "-";
    if (data.subject_avg && typeof data.subject_avg === "object" && !data.subject_avg.error) {
      avg = data.subject_avg[subjectName] ?? "-";
    }

    return [fa1, fa2, sa1, fa3, sa2, avg];
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-100 min-h-screen p-2 md:p-6 mb-24 md:mb-10">
      <div ref={printRef}>
        <div className="max-w-2xl mx-auto border-3 border-red-700 dark:border-red-700 p-4 bg-white dark:bg-white shadow-xl font-sans text-sm m-4">
          {/* Header */}
          <div className="border-2 border-black dark:border-black">
            <div className="flex items-center justify-start bg-yellow-400 dark:bg-yellow-400 border-b-2 border-black dark:border-black px-2 md:px-4 py-1 md:py-2 relative">
              <div className="absolute -left-2 md:-left-3 top-1/2 transform -translate-y-1/2 rotate-45 w-8 h-8 md:w-12 md:h-12 bg-red-700 dark:bg-red-700 flex items-center justify-center border border-black dark:border-black z--1 ml-4 md:ml-8">
                <span className="rotate-[315deg] text-yellow-300 dark:text-yellow-300 font-extrabold text-xl md:text-4xl">
                  4S
                </span>
              </div>
              <div className="flex-1 text-center ml-12 md:ml-18">
                <h1 className="text-lg md:text-2xl font-extrabold uppercase text-red-700 dark:text-red-700 tracking-wider">
                  New Progressive Education Public School
                </h1>
              </div>
            </div>

            <div className="bg-white dark:bg-white">
              <p className="text-xxs md:text-xs text-black dark:text-black ml-20 md:ml-32 font-bold">
                10, Prince Colony, Behind Old Civil Court, Lower Idgah Hills,
                Bhopal
              </p>
            </div>

            <div className="text-center py-1 bg-blue-100 dark:bg-blue-100 text-blue-800 dark:text-blue-800 font-bold tracking-wider text-xs md:text-sm border-t border-gray-700 dark:border-gray-700">
              ANNUAL RESULT {safeString(data.academic_year)}
            </div>
          </div>

          {/* Student Info */}
          <div className="border border-black dark:border-black text-xxs md:text-xs font-sans bg-white dark:bg-white">
            {[
              [
                ["Name", data.student_name],
                ["Scholar No.", safeString(data.scholar_number), true],
                ["SSSM ID", "1727456484"],
              ],
              [
                ["Father's Name", `Mr. ${data.father_name}`],
                ["Class", data.standard, true],
                ["Aadhaar No.", "89675475854"],
              ],
              [
                ["Mother's Name", `Mrs. ${data.mother_name}`],
                ["DOB", new Date(data.date_of_birth).toLocaleDateString("en-GB"), true],
                ["Pen No.", "21258294654"],
              ],
              [
                ["Mobile No.", data.contact_number],
                ["Aapaar ID", "124748344697"],
              ],
            ].map((row, idx) => (
              <div
                key={idx}
                className="flex flex-col sm:flex-row border-b border-black dark:border-black last:border-b-0 bg-white dark:bg-white"
              >
                {row.map(([label, value, boxed], i) => (
                  <div
                    key={i}
                    className={`flex items-center ${i === 2 ? "sm:w-2/6" : "sm:w-1/3"} px-1 md:px-2 py-0.5 md:py-1`}
                  >
                    <span className="w-[40%] sm:w-[45%] text-black dark:text-black tracking-tight font-bold">
                      {label}:
                    </span>
                    <span
                      className={`w-[60%] sm:w-[55%] text-gray-900 dark:text-gray-900 italic font-medium tracking-wide ${boxed ? "border border-black dark:border-black px-0.5 md:px-1 py-0.5 ml-0.5 rounded-sm bg-white dark:bg-white" : ""
                        }`}
                    >
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Scholastic Table */}
          <div className="mb-2 md:mb-4 overflow-x-auto bg-white dark:bg-white">
            <h2 className="text-center bg-blue-100 dark:bg-blue-100 text-blue-800 dark:text-blue-800 font-bold tracking-wider text-xs md:text-sm border-t border-b border-gray-700 dark:border-gray-700 py-1">
              Scholastic Evaluation
            </h2>
            <div className="min-w-full">
              <table className="w-full border border-black dark:border-black text-xxs md:text-xs text-center border-collapse">
                <thead className="bg-gray-200 dark:bg-gray-200">
                  <tr>
                    {["Subject", "FA1", "FA2", "SA1", "FA3", "SA2", "Avg SA1+SA2"].map((h, i) => (
                      <th key={i} className="border text-nowrap border-black dark:border-black px-1 py-0.5 md:px-2 md:py-1 text-black dark:text-black">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allSubjects.map((subject) => {
                    const [fa1, fa2, sa1, fa3, sa2, avg] = getSubjectScores(subject);
                    return (
                      <tr key={subject} className="bg-white dark:bg-white">
                        <td className="border text-nowrap border-black dark:border-black px-1 py-0.5 md:px-2 md:py-1 text-center text-red-500 dark:text-red-500 font-bold">
                          {subject.toUpperCase()}
                        </td>
                        {[fa1, fa2, sa1, fa3, sa2, avg].map((score, idx) => (
                          <td key={idx} className={`border border-black dark:border-black text-nowrap px-1 py-0.5 md:px-2 md:py-1 ${score !== "-" && score < 40 ? "text-red-600 dark:text-red-600" : "text-black dark:text-black"}`}>
                            {score}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                  <tr className="bg-white dark:bg-white">
                    <td className="border text-nowrap border-black dark:border-black px-1 py-0.5 md:px-2 md:py-1 text-center text-red-500 dark:text-red-500 font-bold">
                      TOTAL
                    </td>
                    {["fa1", "fa2", "sa1", "fa3", "sa2"].map((exam) => (
                      <td key={exam} className="border text-nowrap border-black dark:border-black px-1 py-0.5 md:px-2 md:py-1 text-black dark:text-black">
                        {data.subjects.find(e => e.exam_type === exam)?.total ?? 0}/500
                      </td>
                    ))}
                    <td className="border border-black dark:border-black text-nowrap px-1 py-0.5 md:px-2 md:py-1 text-black dark:text-black">{data.total_marks}/500</td>
                  </tr>
                  <tr className="bg-white dark:bg-white">
                    <td className="border border-black dark:border-black text-nowrap px-1 py-0.5 md:px-2 md:py-1 text-center text-red-500 dark:text-red-500 font-bold">
                      PERCENTAGE
                    </td>
                    {["fa1", "fa2", "sa1", "fa3", "sa2"].map((exam) => (
                      <td key={exam} className="border border-black dark:border-black text-nowrap px-1 py-0.5 md:px-2 md:py-1 text-black dark:text-black">{data.subjects.find(e => e.exam_type === exam)?.percentage ?? "-"}%</td>
                    ))}
                    <td className="border border-black dark:border-black px-1 text-nowrap py-0.5 md:px-2 md:py-1 text-black dark:text-black">{data.percentage}%</td>
                  </tr>
                  <tr className="bg-white dark:bg-white">
                    <td className="border border-black dark:border-black px-1 text-nowrap py-0.5 md:px-2 md:py-1 text-center text-red-500 dark:text-red-500 font-bold">
                      GRADE
                    </td>
                    {["fa1", "fa2", "sa1", "fa3", "sa2"].map((exam) => (
                      <td key={exam} className="border border-black dark:border-black px-1 py-0.5 md:px-2 md:py-1 text-black dark:text-black">{safeString(data.subjects.find(e => e.exam_type === exam)?.grade)}</td>
                    ))}
                    <td className="border border-black dark:border-black px-1 py-0.5 text-nowrap md:px-2 md:py-1 text-black dark:text-black">{safeString(data.grade)}</td>
                  </tr>
                  <tr className="bg-white dark:bg-white">
                    <td className="border border-black dark:border-black px-1 py-0.5 text-nowrap md:px-2 md:py-1 text-center text-red-500 dark:text-red-500 font-bold">
                      RANK
                    </td>
                    {["fa1", "fa2", "sa1", "fa3", "sa2"].map((exam) => (
                      <td key={exam} className="border border-black dark:border-black px-1 text-nowrap py-0.5 md:px-2 md:py-1 text-black dark:text-black">{safeString(data.subjects.find(e => e.exam_type === exam)?.grade)}</td>
                    ))}
                    <td className="border border-black dark:border-black px-1 py-0.5 text-nowrap md:px-2 md:py-1 text-black dark:text-black">{safeString(data.grade)}</td>
                  </tr>
                  <tr className="bg-white dark:bg-white">
                    <td className="border border-black dark:border-black px-1 py-0.5 text-nowrap md:px-2 md:py-1 text-center text-red-500 dark:text-red-500 font-bold">
                      ATTENDANCE
                    </td>
                    {["fa1", "fa2", "sa1", "fa3", "sa2"].map((exam) => (
                      <td key={exam} className="border border-black dark:border-black px-1 py-0.5 text-nowrap md:px-2 md:py-1 text-black dark:text-black">{safeString(data.subjects.find(e => e.exam_type === exam)?.grade)}</td>
                    ))}
                    <td className="border border-black dark:border-black px-1 py-0.5 md:px-2 text-nowrap md:py-1 text-black dark:text-black">{safeString(data.grade)}</td>
                  </tr>
                  <tr className="bg-white dark:bg-white">
                    <td className="border border-black dark:border-black px-1 py-0.5 md:px-2 text-nowrap md:py-1 text-center text-red-500 dark:text-red-500 font-bold">
                      DIVISION
                    </td>
                    {["fa1", "fa2", "sa1", "fa3", "sa2"].map((exam) => (
                      <td key={exam} className="border border-black dark:border-black px-1 text-nowrap py-0.5 md:px-2 md:py-1 text-black dark:text-black">{safeString(data.subjects.find(e => e.exam_type === exam)?.grade)}</td>
                    ))}
                    <td className="border border-black dark:border-black px-1 py-0.5 md:px-2 text-nowrap md:py-1 text-black dark:text-black">{safeString(data.grade)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Non-Scholastic & Personal/Social */}
          <div className="bg-white dark:bg-white">
            <h2 className="text-center bg-blue-100 dark:bg-blue-100 text-blue-800 dark:text-blue-800 font-bold tracking-wider text-xs md:text-sm border-t border-b border-gray-700 dark:border-gray-700 py-1">
              <span>NON-SCHOLASTIC EVALUATION</span>
              <span className="hidden sm:inline">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
              <span className="sm:hidden"> </span>
              <span>PERSONAL & SOCIAL QUALITIES</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 mb-2 md:mb-4 bg-white dark:bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-xxs md:text-xs border border-black dark:border-black text-center border-collapse">
                <thead className="bg-gray-200 dark:bg-gray-200">
                  <tr>
                    <th className="border border-black dark:border-black text-nowrap px-1 py-0.5 text-black dark:text-black">SUBJECT</th>
                    <th className="border border-black dark:border-black text-nowrap px-1 py-0.5 text-black dark:text-black">I Term</th>
                    <th className="border border-black dark:border-black text-nowrap px-1 py-0.5 text-black dark:text-black">II Term</th>
                  </tr>
                </thead>
                <tbody>
                  {["GK/MORAL/EVS", "Conversation", "Drawing/Craft", "Drawing"].map((subj) => (
                    <tr key={subj} className="bg-white dark:bg-white">
                      <td className="border border-black dark:border-black text-nowrap px-1 py-0.5 text-left text-black dark:text-black">{subj}</td>
                      <td className="border border-black dark:border-black text-nowrap font-bold text-black dark:text-black">{data.non_scholastic.find(item => item.subject === subj && item.term === "Term 1")?.grade || "-"}</td>
                      <td className="border border-black dark:border-black text-nowrap font-bold text-black dark:text-black">{data.non_scholastic.find(item => item.subject === subj && item.term === "Term 2")?.grade || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xxs md:text-xs border border-black dark:border-black border-collapse">
                <thead className="bg-gray-200 dark:bg-gray-200">
                  <tr>
                    <th className="border border-black dark:border-black text-nowrap px-1 py-0.5 text-black dark:text-black">SUBJECT</th>
                    <th className="border border-black dark:border-black text-nowrap px-1 py-0.5 text-black dark:text-black">I Term</th>
                    <th className="border border-black dark:border-black text-nowrap px-1 py-0.5 text-black dark:text-black">II Term</th>
                    <th className="border border-black dark:border-black px-1 py-0.5 text-nowrap text-black dark:text-black">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {["Cleanliness", "Discipline", "Piuntuality", "Attention in Class"].map((trait) => (
                    <tr key={trait} className="bg-white dark:bg-white">
                      <td className="border text-nowrap border-black dark:border-black px-1 py-0.5 text-left text-black dark:text-black">{trait}</td>
                      <td className="border text-nowrap border-black dark:border-black font-bold pl-1 text-black dark:text-black">{data.personal_social.find(item => item.quality === trait && item.term === "Term 1")?.grade || "-"}</td>
                      <td className="border text-nowrap border-black dark:border-black font-bold pl-1 text-black dark:text-black">{data.personal_social.find(item => item.quality === trait && item.term === "Term 2")?.grade || "-"}</td>
                      <td className="border text-nowrap border-black dark:border-black pl-1 text-left text-black dark:text-black">{data.personal_social.find(item => item.quality === trait && item.term === "Term 2")?.remark || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {/* Footer */}
          <div className="border-t-2 border-black dark:border-black pt-1 md:pt-3 text-xxs md:text-xs bg-white dark:bg-white">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 mb-2 md:mb-4 text-black dark:text-black">
              <div>
                <strong>Pass/Promoted to Class:</strong>{" "}
                {data.promoted_to_class}
              </div>
              <div>
                <strong>Supplementary In:</strong>{" "}
                {data.supplementary_in.length > 0
                  ? data.supplementary_in.join(", ")
                  : "—"}
              </div>
              <div>
                <strong>School Re-opens on:</strong>{" "}
                {new Date(data.school_reopen_date).toLocaleDateString("en-GB")}
              </div>
            </div>
            <div className="grid grid-cols-3 text-center pt-2 md:pt-4 border-t border-gray-400 dark:border-gray-400 font-semibold text-red-700 dark:text-red-700 gap-2 md:gap-0">
              <div>
                <p className="sm:text-sm text-[10px]">Sign of Class Teacher</p>
                <img
                  src="https://a.storyblok.com/f/191576/1176x882/0707bde47c/make_signature_hero_after.webp"
                  alt="Class Teacher Signature"
                  className="h-16 md:h-22 mx-auto object-contain"
                />
              </div>
              <div>
                <p className="sm:text-sm text-[10px]">Sign of Principal</p>
                <img
                  src="https://www.signwell.com/assets/vip-signatures/muhammad-ali-signature-3f9237f6fc48c3a04ba083117948e16ee7968aae521ae4ccebdfb8f22596ad22.svg"
                  alt="Principal Signature"
                  className="h-16 md:h-22 mx-auto object-contain"
                />
              </div>
              <div>
                <p className="sm:text-sm text-[10px]">Parent's/Guardian's Sign</p>
                <img
                  src="https://www.shutterstock.com/image-vector/signature-vector-hand-drawn-autograph-600nw-2387543207.jpg"
                  alt="Parent/Guardian Signature"
                  className="h-16 md:h-22 mx-auto object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print Button */}
      <div className="text-center mb-2 md:mb-4">
        <button
          onClick={handlePrint}
          className="btn bgTheme text-white"
        >
          Download Marksheet
        </button>
      </div>
    </div>
  );
};

export default Marksheet;