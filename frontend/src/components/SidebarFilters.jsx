import React, { useState } from "react";

const SidebarFilters = ({
  onSiteNameSearch,
  onVoltageFilter,
  onPowerRangeChange,
  onOperatorFilter,
  voltageLevels = [20, 22, 33, 66, 132],
  operators = [
    "Eastern Power Networks (EPN)",
    "London Power Networks (LPN)",
    "South Eastern Power Networks (SPN)",
  ],
  currentFilters = {
    siteName: "",
    voltage: [],
    powerRange: { min: 0, max: 200 },
    operators: [],
  },
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleSiteNameChange = (e) => {
    onSiteNameSearch(e.target.value);
  };

  const handleVoltageChange = (voltage, isChecked) => {
    const newFilters = isChecked
      ? [...currentFilters.voltage, voltage]
      : currentFilters.voltage.filter((v) => v !== voltage);
    onVoltageFilter(newFilters);
  };

  const handlePowerRangeChange = (max) => {
    onPowerRangeChange({ min: 0, max });
  };

  const handleOperatorChange = (operator, isChecked) => {
    const newFilters = isChecked
      ? [...currentFilters.operators, operator]
      : currentFilters.operators.filter((o) => o !== operator);
    onOperatorFilter(newFilters);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-gray-500 hover:text-gray-700 transition-colors duration-200 md:hidden"
        >
          {isCollapsed ? ">>" : "<<"}
        </button>
      </div>

      {!isCollapsed && (
        <div className="space-y-6">
          {/* Search by Site Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search by Site Name
            </label>
            <input
              type="text"
              placeholder="Enter site name..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              onChange={handleSiteNameChange}
              value={currentFilters.siteName || ""}
            />
          </div>

          {/* Voltage Level Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Voltage Level
            </label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {voltageLevels.map((voltage) => (
                <label
                  key={voltage}
                  className="flex items-center hover:bg-gray-50 p-2 rounded-lg transition-colors duration-200 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={currentFilters.voltage.includes(voltage)}
                    onChange={(e) =>
                      handleVoltageChange(voltage, e.target.checked)
                    }
                  />
                  <span className="ml-3 text-sm text-gray-700">
                    {voltage} kV
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Available Power Range Slider */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Available Power (MW)
            </label>
            <div className="px-2">
              <input
                type="range"
                min="0"
                max="200"
                step="1"
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                value={currentFilters.powerRange?.max ?? 200}
                onChange={(e) =>
                  handlePowerRangeChange(parseInt(e.target.value))
                }
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>0 MW</span>
                <span className="font-medium">
                  Show sites with ≤ {currentFilters.powerRange?.max ?? 200} MW
                </span>
              </div>
            </div>
          </div>

          {/* Network Operators Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Network Operators
            </label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {operators.map((operator) => (
                <label
                  key={operator}
                  className="flex items-center hover:bg-gray-50 p-2 rounded-lg transition-colors duration-200 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={currentFilters.operators.includes(operator)}
                    onChange={(e) =>
                      handleOperatorChange(operator, e.target.checked)
                    }
                  />
                  <span className="ml-3 text-sm text-gray-700">{operator}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SidebarFilters;
