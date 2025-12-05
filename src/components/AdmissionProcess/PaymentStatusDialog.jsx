import React, { useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas-pro";

const PaymentStatusDialog = ({ paymentStatus, onClose }) => {
  if (!paymentStatus) return null;

  const printRef = useRef();

  const payments = paymentStatus.payments || [];

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      const options = { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" };
      return date.toLocaleDateString("en-US", options);
    } catch {
      return dateString;
    }
  };

  const totalPaid = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);

  const handlePrint = async () => {
    const input = printRef.current;
    if (!input) return;

    const canvas = await html2canvas(input);
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${paymentStatus.receipt_number}.pdf`);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-2">
      <div className="bg-white dark:bg-gray-800 w-full max-w-md p-4 rounded-lg shadow-lg border border-gray-300 dark:border-gray-600">
        {/* Header */}
        <div className="flex justify-between items-center border-b dark:border-gray-600 pb-2 mb-3">
          <h2 className="text-lg font-bold text-green-600 dark:text-green-400">
            Payment Successful
          </h2>
          <button onClick={onClose} className="btn btn-circle btn-xs bg-gray-200 dark:bg-gray-700 dark:text-white">
            ✕
          </button>
        </div>

        {/* Receipt Content */}
        <div ref={printRef} className="space-y-3 text-sm text-gray-800 dark:text-gray-100">
          {/* Receipt Details */}
          <div>
            <h3 className="font-semibold text-gray-700 dark:text-gray-200 text-sm mb-1">Receipt Details</h3>
            <div className="grid grid-cols-2 gap-1 text-xs">
              <p><strong>No:</strong> {payments[0]?.receipt_number}</p>
              <p><strong>Date:</strong> {formatDate(payments[0]?.payment_date || new Date())}</p>
              <p><strong>Mode:</strong> Online</p>
            </div>
          </div>

          {/* Fees Breakdown */}
          <div>
            <h3 className="font-semibold text-gray-700 dark:text-gray-200 text-sm mb-1">Fees Breakdown</h3>
            <ul className="list-disc ml-4 text-xs text-gray-800 dark:text-gray-100">
              {payments.map((p) => (
                <li key={p.id}>
                  {p.fee_type}: ₹{parseFloat(p.amount).toFixed(2)}{" "}
                  {/* {p.status === "success" ? (
                    <span className="text-green-600 dark:text-green-400">(Paid)</span>
                  ) : (
                    <span className="text-red-500">(Pending)</span>
                  )} */}
                </li>
              ))}
            </ul>
          </div>

          {/* Summary */}
          <div className="border-t dark:border-gray-600 pt-2">
            <h3 className="font-semibold text-gray-700 dark:text-gray-200 text-sm mb-1">Summary</h3>
            <p className="text-xs text-green-600 dark:text-green-400">
              <strong>Total Paid:</strong> ₹{totalPaid.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={handlePrint} className="btn btn-sm bgTheme text-white hover:opacity-90">
            Download
          </button>
          <button onClick={onClose} className="btn btn-sm bg-gray-300 dark:bg-gray-600 dark:text-white">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentStatusDialog;
