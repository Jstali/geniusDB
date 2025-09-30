import React from "react";
import { useNavigate } from "react-router-dom";

const Sidebar = ({ activeTab, setActiveTab }) => {
  const navigate = useNavigate();

  const menuItems = ["Home", "Summary", "Charts", "Admin Panel"];

  return (
    <aside className="fixed top-16 left-0 right-0 bg-white shadow-md overflow-x-auto z-10">
      <nav className="p-4">
        <ul className="flex space-x-4">
          {menuItems.map((item, index) => (
            <li key={index}>
              <button
                onClick={() => setActiveTab(item)}
                className={`px-4 py-2 rounded-lg transition-all duration-300 whitespace-nowrap transform hover:scale-105 hover:shadow-md ${
                  activeTab === item
                    ? "bg-blue-600 text-white font-medium shadow-lg"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {item}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
