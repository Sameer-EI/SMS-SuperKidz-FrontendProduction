import React, { useEffect, useState, useRef } from 'react';
import Chart from 'react-apexcharts';
import { fetchAttendanceData } from '../../services/api/Api';

const AttendanceRecord = () => {
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  const [overallAttendance, setOverallAttendance] = useState({
    present: 0,
    total: 0,
    percentage: '0%'
  });
  const [chartData, setChartData] = useState({
    series: [{ name: 'Attendance %', data: [] }],
    options: {
      chart: { 
        type: 'bar', 
        height: 350,
        toolbar: {
          show: false
        },
        events: {
          mounted: function(chartContext, config) {
            // Chart ke mount hone par SVG element ko accessible banate hain
            const svgElement = document.querySelector('.apexcharts-svg');
            if (svgElement) {
              svgElement.classList.add('exportable-chart');
            }
          }
        }
      },
      xaxis: { categories: [] },
      yaxis: {
        labels: { formatter: (val) => ` ${val}% ` }
      },
      tooltip: {
        y: { formatter: (val) => ` ${val}% ` }
      }
    }
  });

  // Loader & Error state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exportOpen, setExportOpen] = useState(false);
  const chartRef = useRef(null);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (chartRef.current && !chartRef.current.contains(event.target)) {
        setExportOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getData = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await fetchAttendanceData(selectedDate);

      if (!data) {
        setOverallAttendance({ present: 0, total: 0, percentage: '0%' });
        setChartData(prev => ({
          ...prev,
          series: [{ name: 'Attendance %', data: [] }],
          options: { ...prev.options, xaxis: { categories: [] } }
        }));
        return;
      }

      setOverallAttendance(data.overall_attendance || { present: 0, total: 0, percentage: '0%' });

      const classWise = data.class_wise_attendance || [];
      const categories = classWise.map(item => item.class_name);
      const percentageValues = classWise.map(item => parseFloat(item.percentage.replace('%', '')) || 0);

      setChartData(prev => ({
        ...prev,
        series: [{ name: 'Attendance %', data: percentageValues }],
        options: { ...prev.options, xaxis: { categories } }
      }));
    } catch (err) {
      setError('Failed to load data. Try again');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, [selectedDate]);

  const handleReset = () => {
    setSelectedDate('');
  };

  // Fixed Export functions
  const handleExportSVG = () => {
    setTimeout(() => {
      const svgElement = document.querySelector('.apexcharts-svg');
      if (svgElement) {
        // SVG clone bana ke export karte hain
        const clonedSvg = svgElement.cloneNode(true);
        clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        
        const svgData = new XMLSerializer().serializeToString(clonedSvg);
        const blob = new Blob([svgData], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `attendance-chart-${selectedDate || 'all'}.svg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    }, 100);
    setExportOpen(false);
  };

  const handleExportPNG = () => {
    setTimeout(() => {
      const svgElement = document.querySelector('.apexcharts-svg');
      if (svgElement) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // SVG data
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const img = new Image();
        
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          
          canvas.toBlob((blob) => {
            const pngUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = pngUrl;
            a.download = `attendance-chart-${selectedDate || 'all'}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(pngUrl);
            URL.revokeObjectURL(url);
          }, 'image/png');
        };
        
        img.src = url;
      }
    }, 100);
    setExportOpen(false);
  };

  const handleExportCSV = () => {
    const classWiseData = chartData.series[0].data;
    const categories = chartData.options.xaxis.categories;
    
    if (!classWiseData || classWiseData.length === 0) {
      alert('No data available to export!');
      return;
    }
    
    let csvContent = 'Class Name,Attendance Percentage\r\n';
    
    categories.forEach((category, index) => {
      const percentage = classWiseData[index];
      csvContent += `${category},${percentage}%\r\n`;
    });
    
    // Add overall attendance
    csvContent += `\r\nOverall Attendance Summary\r\n`;
    csvContent += `Present Students,${overallAttendance.present}\r\n`;
    csvContent += `Total Students,${overallAttendance.total}\r\n`;
    csvContent += `Overall Percentage,${overallAttendance.percentage}\r\n`;
    csvContent += `Date,${selectedDate || 'All'}\r\n`;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-data-${selectedDate || 'all'}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setExportOpen(false);
  };

  // Loader UI
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

  // Error UI
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-6">
        <i className="fa-solid fa-triangle-exclamation text-5xl text-red-400 mb-4"></i>
        <p className="text-lg text-red-400 font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-5 bg-gray-50 dark:bg-gray-900 mb-24 md:mb-10">
      <div className="w-full max-w-7xl mx-auto p-6 bg-base-100 dark:bg-gray-800 rounded-box my-5 shadow-lg">
        <span className="font-bold text-2xl flex pt-5 justify-center gap-1 text-gray-900 dark:text-gray-100">
          <i className="fa-solid fa-square-poll-vertical flex pt-1" /> Attendance Record
        </span>

        <div className="flex flex-wrap justify-center gap-4 p-4">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="input input-bordered focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
          <button
            onClick={handleReset}
            className="btn bgTheme disabled:opacity-50 disabled:cursor-not-allowed text-white"
            disabled={!selectedDate}
          >
            Reset
          </button>
        </div>

        <div className="flex justify-center gap-10 font-semibold text-lg mb-4 text-gray-900 dark:text-gray-100">
          <div>Total Present Students: {overallAttendance.present}</div>
          <div>Total Students: {overallAttendance.total}</div>
          <div>Overall Attendance: {overallAttendance.percentage}</div>
        </div>

        <div className="p-4 flex justify-center overflow-auto relative" ref={chartRef}>
          {/* Custom Export Dropdown */}
          <div className="absolute top-2 right-2 z-10">
            <div className="dropdown dropdown-end">
              <button 
                className="btn btn-ghost btn-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                onClick={() => setExportOpen(!exportOpen)}
              >
                <i className="fa-solid fa-download mr-2"></i>
                Download
                <i className="fa-solid fa-chevron-down ml-2 text-xs"></i>
              </button>
              
              {exportOpen && (
                <ul className="dropdown-content menu p-2 shadow bg-base-100 dark:bg-gray-700 rounded-box w-52 border border-gray-200 dark:border-gray-600 mt-1">
                  <li>
                    <button onClick={handleExportSVG} className="text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 p-2">
                      <i className="fa-solid fa-file-image text-blue-500 mr-2"></i>
                      Download as SVG
                    </button>
                  </li>
                  <li>
                    <button onClick={handleExportCSV} className="text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 p-2">
                      <i className="fa-solid fa-file-csv text-orange-500 mr-2"></i>
                      Download as CSV
                    </button>
                  </li>
                </ul>
              )}
            </div>
          </div>

          <Chart
            options={chartData.options}
            series={chartData.series}
            type="bar"
            height={500}
            width={1200}
          />
        </div>
      </div>
    </div>
  );
};

export default AttendanceRecord;