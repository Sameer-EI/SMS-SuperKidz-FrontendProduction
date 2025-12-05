import React from "react";

const LogoutModal = ({ show, onConfirm, onClose }) => {
  return (
  <div
    className={`fixed inset-0 flex items-center justify-center z-50 ${show ? "" : "hidden"} bg-black/30 backdrop-blur-sm dark:bg-black/60`}
    onClick={onClose}
  >
    <div
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md w-[80%] max-w-xl h-auto max-h-[80vh] p-6 border border-gray-200 dark:border-gray-700 overflow-y-auto"
      onClick={(e) => e.stopPropagation()}
    >
      <h1 className="text-4xl text-center textTheme dark:text-white">Logout</h1>
      <p className="text-center text-gray-700 dark:text-gray-300 mb-6">
        Are you sure you want to logout?
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          className="flex-1 py-2 border borderTheme textTheme rounded-md hover:bg-blue-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          className="flex-1 py-2 bgTheme text-white rounded-md flex items-center justify-center gap-2 dark:bg-blue-600 dark:hover:bg-blue-700"
          onClick={onConfirm}
        >
          Logout
          <i className="fa-solid fa-arrow-right-from-bracket"></i>
        </button>
      </div>
    </div>
  </div>
);

};

export default LogoutModal;
