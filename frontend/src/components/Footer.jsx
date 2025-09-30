import React from "react";

const Footer = ({ className = "", showButtons = true }) => {
  return (
    <footer
      className={`bg-white border-t border-gray-200 py-3 px-6 ${className}`}
    >
      {showButtons && (
        <div className="flex justify-end space-x-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition text-sm font-medium">
            Save
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition text-sm font-medium">
            Load
          </button>
          <button className="px-4 py-2 bg-gray-600 text-white rounded-lg shadow hover:bg-gray-700 transition text-sm font-medium">
            Reset
          </button>
        </div>
      )}
    </footer>
  );
};

export default Footer;
