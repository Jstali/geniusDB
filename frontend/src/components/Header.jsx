import React from "react";

const DEFAULT_MENU = [
  "Home",
  "Summary",
  "Charts",
  "Map View",
  "Table View",
  "Admin Panel",
];

const Header = ({
  active = "Home",
  onNavigate = () => {},
  onLogout = null,
  menu = DEFAULT_MENU,
  children = null,
  className = "",
}) => {
  return (
    <header className={`w-full px-6 py-3 shadow-md bg-white ${className}`}>
      <div className="max-w-full mx-auto">
        <div className="flex items-center justify-between">
          {/* Left: Title */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-blue-600">Genius DB</h1>
          </div>

          {/* Right: children or logout */}
          <div className="flex items-center">
            {children ? (
              children
            ) : onLogout ? (
              <button
                onClick={onLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition"
              >
                Logout
              </button>
            ) : null}
          </div>
        </div>

        {/* Mobile nav: stack below title (or horizontal scroll) */}
        <nav className="sm:hidden mt-3 flex gap-3 flex-wrap">
          {menu.map((item) => {
            const isActive = item === active;
            return (
              <button
                key={item}
                onClick={() => onNavigate(item)}
                className={`${
                  isActive
                    ? "bg-blue-600 text-white px-4 py-2 rounded-lg shadow"
                    : "text-gray-600 hover:text-blue-600 transition px-3 py-2"
                }`}
              >
                {item}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

export default Header;
