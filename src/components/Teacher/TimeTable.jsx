import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

const TimeTable = () => {
  const [timetable, settimetable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchSubject, setSearchSubject] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  const { axiosInstance } = useContext(AuthContext);

  const fetchtimetable = async () => {
    try {
      setLoading(true);
      setError(false);

      const response = await axiosInstance.get("/d/Exam-Schedule/get_timetable/");
      settimetable(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch timetable:", err);
      setError(true);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchtimetable();
  }, []);

  // Format time to 12-hour format
  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

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
        <p className="text-lg text-red-400 font-medium">
          Failed to load data, Try Again
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen mb-24 md:mb-10">
      <div className="max-w-7xl mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
        <div className="mb-4 flex items-center justify-center gap-2">
          <i className="fa-solid fa-table-list text-4xl text-gray-800 dark:text-gray-100"></i>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">
            Examination Schedule
          </h1>
        </div>

        {/* Filters + Search Section */}
        <div className="flex flex-wrap justify-between items-end mb-4 border-b border-gray-300 dark:border-gray-700 pb-4 gap-4">
          {/* Left: Filters + Reset */}
          <div className="flex flex-wrap items-end gap-4">
            {/* Date Filter */}
            <div className="flex flex-col w-full sm:w-auto">
              <label className="text-sm font-medium mb-1">Filter by Date:</label>
              <input
                type="date"
                className="input input-bordered w-full sm:w-48 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            {/* Reset Button */}
            <div className="mt-1 w-full sm:w-auto">
              <button
                className="btn bgTheme text-white"
                onClick={() => {
                  setSelectedDate("");
                  setSearchSubject("");
                }}
              >
                Reset Filters
              </button>
            </div>
          </div>

          {/* Right: Subject Search */}
          <div className="flex flex-col w-full sm:w-auto">
            <label className="text-sm font-medium mb-1">Search by Subject:</label>
            <input
              type="text"
              placeholder="Enter subject name"
              className="input input-bordered w-full sm:w-64 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
              value={searchSubject}
              onChange={(e) => setSearchSubject(e.target.value.trimStart())}
            />
          </div>
        </div>



        {/* Timetable Tables */}
        {timetable.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-10">
            No timetable available.
          </div>
        ) : (
          timetable.map((classData) => {
            const filteredPapers = classData.papers
              .filter((paper) => {
                const matchesSubject = paper.subject_name
                  .toLowerCase()
                  .includes(searchSubject.trim().toLowerCase());
                const matchesDate = selectedDate
                  ? paper.exam_date === selectedDate
                  : true;
                return matchesSubject && matchesDate;
              })
              .sort((a, b) => a.subject_name.localeCompare(b.subject_name));

            return (
              <div key={classData.id} className="mb-10">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200">
                    Class: {classData.class}
                  </h3>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Academic Year:</span>{" "}
                    {classData.school_year} |
                    <span className="font-medium ml-2">Exam Type:</span>{" "}
                    {classData.exam_type}
                  </div>
                </div>

                <div className="w-full overflow-x-auto rounded-lg no-scrollbar max-h-[70vh]">
                  <div className="inline-block min-w-full align-middle">
                    <div className="shadow-sm rounded-lg overflow-auto max-h-[400px]">
                      <table className="min-w-full border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
                        <thead className="bgTheme text-white sticky top-0">
                          <tr>
                            <th className="px-4 py-3 text-left text-nowrap text-sm font-semibold">Subject</th>
                            <th className="px-4 py-3 text-left text-nowrap text-sm font-semibold">Date</th>
                            <th className="px-4 py-3 text-left text-nowrap text-sm font-semibold">Day</th>
                            <th className="px-4 py-3 text-left text-nowrap text-sm font-semibold">Start Time</th>
                            <th className="px-4 py-3 text-left text-nowrap text-sm font-semibold">End Time</th>
                            <th className="px-4 py-3 text-left text-nowrap text-sm font-semibold">Duration</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                          {filteredPapers.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="text-center text-nowrap py-6 text-gray-500 dark:text-gray-400">
                                No papers found.
                              </td>
                            </tr>
                          ) : (
                            filteredPapers.map((paper, index) => {
                              const start = new Date(`2000-01-01T${paper.start_time}`);
                              const end = new Date(`2000-01-01T${paper.end_time}`);
                              const durationMs = end - start;
                              const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
                              const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
                              const duration = `${durationHours > 0 ? `${durationHours} hr` : ""} ${durationMinutes > 0 ? `${durationMinutes} min` : ""}`.trim();

                              return (
                                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                  <td className="px-4 py-3 text-sm text-nowrap font-medium text-gray-900 dark:text-gray-100 capitalize">
                                    {paper.subject_name}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-nowrap text-gray-700 dark:text-gray-300">
                                    {new Date(paper.exam_date).toLocaleDateString("en-US", {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                    })}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-nowrap text-gray-700 dark:text-gray-300">{paper.day}</td>
                                  <td className="px-4 py-3 text-sm text-nowrap text-gray-700 dark:text-gray-300">{formatTime(paper.start_time)}</td>
                                  <td className="px-4 py-3 text-sm text-nowrap text-gray-700 dark:text-gray-300">{formatTime(paper.end_time)}</td>
                                  <td className="px-4 py-3 text-sm text-nowrap text-gray-700 dark:text-gray-300">{duration}</td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default TimeTable;
