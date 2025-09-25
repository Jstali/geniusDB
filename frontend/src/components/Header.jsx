import React from "react";

const Header = ({ onLogout }) => {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-10 h-16 flex items-center justify-between px-6">
      <h1 className="text-2xl font-bold text-blue-600">Genius DB</h1>
      {onLogout && (
        <button
          onClick={onLogout}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition duration-300"
        >
          Logout
        </button>
      )}
    </header>
  );
};

export default Header;
