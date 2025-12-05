import React, { useRef } from "react";

const PaymentStatusDialogOffline = ({ paymentStatus, onClose }) => {
  if (!paymentStatus) return null;

  const printRef = useRef();

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      const options = { year: "numeric", month: "short", day: "numeric" };
      return date.toLocaleDateString("en-US", options);
    } catch {
      return dateString;
    }
  };

  const handlePrint = () => {
    const originalContents = document.body.innerHTML;
    const printContents = printRef.current.innerHTML;

    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  };

  const lastReceipt =
    paymentStatus.data?.[paymentStatus.data.length - 1]?.receipt_number || "N/A";

  const schoolYear = paymentStatus.data?.[0]?.school_year_name || "N/A";

  const receiptData = {
    receipt_number: lastReceipt,
    timestamp: paymentStatus.data?.[0]?.created_at || new Date().toISOString(),
    payment_method: paymentStatus.payment_mode || "N/A",
    student: paymentStatus.data?.[0]?.student_name || "N/A",
    student_class: paymentStatus.data?.[0]?.student_class || "N/A",
    school_year: schoolYear,
    payment_details:
      paymentStatus.data?.map((fee) => ({
        fee_type: fee.fee_type,
        paid_amount: parseFloat(fee.paid_amount),
        remaining_due: parseFloat(fee.due_amount),
        month: fee.month_name,
        fee_status: fee.fee_status,
      })) || [],
    total_paid: paymentStatus.total_amount_paid || 0,
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-2">
      <div className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 w-full max-w-md p-4 rounded-lg shadow-lg border border-gray-300 dark:border-gray-600">

        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-300 dark:border-gray-600 pb-2 mb-3">
          <h2 className="text-lg font-bold text-green-700 dark:text-green-400">
            Payment Receipt
          </h2>
          <button
            onClick={onClose}
            className="btn btn-circle btn-xs bg-gray-200 dark:bg-gray-700 dark:text-white"
          >
            ✕
          </button>
        </div>

        {/* Printable Content */}
        <div ref={printRef} className="space-y-3 text-sm">

          {/* Receipt Details */}
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">Receipt Details</h3>
            <div className="grid grid-cols-2 gap-1 text-xs">
              <p><strong>No:</strong> {receiptData.receipt_number}</p>
              <p><strong>Date:</strong> {formatDate(receiptData.timestamp)}</p>
              <p><strong>Mode:</strong> {receiptData.payment_method}</p>
              <p><strong>School Year:</strong> {receiptData.school_year}</p>
            </div>
          </div>

          {/* Student Info */}
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">Student</h3>
            <p className="text-xs">
              {receiptData.student} ({receiptData.student_class})
            </p>
          </div>

          {/* Fee Breakdown */}
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">Fees</h3>
            <ul className="list-disc ml-4 text-xs text-gray-700 dark:text-gray-300">
              {receiptData.payment_details.map((fee, index) => (
                <li key={index}>
                  {fee.fee_type} ({fee.month}): ₹{fee.paid_amount.toFixed(2)}
                </li>
              ))}
            </ul>
          </div>

          {/* Summary */}
          <div className="border-t border-gray-300 dark:border-gray-600 pt-2">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">Summary</h3>
            <p className="text-xs text-green-700 dark:text-green-400">
              <strong>Total Paid:</strong> ₹{receiptData.total_paid?.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={handlePrint}
            className="btn bgTheme text-white btn-sm hover:opacity-90"
          >
            Download
          </button>
          <button
            onClick={onClose}
            className="btn bg-gray-300 text-gray-800 dark:bg-gray-600 dark:text-white btn-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentStatusDialogOffline;
