import React from "react";

const Sidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    "Home",
    "Summary",
    "Charts",
    "Map View",
    "Table View",
    "Admin Panel",
  ];

  return (
    <aside className="fixed top-16 left-0 right-0 bg-white shadow-md overflow-x-auto z-10">
      <nav className="p-4">
        <ul className="flex space-x-4">
          {menuItems.map((item, index) => (
            <li key={index}>
              <button
                onClick={() => setActiveTab(item)}
                className={`px-4 py-2 rounded-lg transition-colors duration-200 whitespace-nowrap ${
                  activeTab === item
                    ? "bg-blue-600 text-white font-medium"
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
