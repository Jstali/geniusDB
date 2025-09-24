import React, { useState, useEffect } from "react";
import DataTable from "./DataTable";

const TableView = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("table"); // 'table' or 'list'
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // First, trigger the data processing script
        const processResponse = await fetch(
          "http://localhost:8000/process/transformers"
        );
        if (!processResponse.ok) {
          throw new Error(
            `HTTP error while processing data! status: ${processResponse.status}`
          );
        }
        const processResult = await processResponse.json();
        if (processResult.status === "error") {
          throw new Error(processResult.message);
        }

        // Then fetch the transformer data from the backend API
        const response = await fetch("http://localhost:8000/data/transformers");
        if (!response.ok) {
          throw new Error(
            `HTTP error while fetching data! status: ${response.status}`
          );
        }
        const jsonData = await response.json();

        // Set the transformer data directly
        setData(jsonData);
      } catch (err) {
        setError("Failed to fetch data from backend: " + err.message);
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Generate columns dynamically from the data
  const columns =
    data.length > 0
      ? Object.keys(data[0]).map((key) => ({
          accessorKey: key,
          header: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " "),
          cell: (info) => {
            const value = info.getValue();
            // Handle special cases for better display
            if (value === null || value === undefined) {
              return "";
            }
            if (typeof value === "object") {
              return JSON.stringify(value);
            }
            return String(value);
          },
        }))
      : [];

  if (loading) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Table View</h2>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Table View</h2>
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Error! </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Transformer Data</h2>
      <p className="text-gray-600 mb-4">
        Data from grid_and_primary_calculated.py processing
      </p>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-4">
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === "table"
              ? "border-b-2 border-indigo-500 text-indigo-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("table")}
        >
          Table View
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === "list"
              ? "border-b-2 border-indigo-500 text-indigo-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("list")}
        >
          List View
        </button>
      </div>

      {/* Main Content Area with Table/List and Filter Panel */}
      <div className="flex">
        {/* Main Content (Table or List) */}
        <div className="flex-1">
          {data.length > 0 ? (
            <DataTable data={data} columns={columns} />
          ) : (
            <div className="text-center py-8 text-gray-500">
              No data available.
            </div>
          )}
        </div>

        {/* Right Side Panel with Filter Button */}
        <div className="w-64 pl-6" style={{ paddingTop: "16px" }}>
          {/* Filter Button */}
          <div className="mb-4">
            <button
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className="w-full flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700 transition-colors duration-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
                  clipRule="evenodd"
                />
              </svg>
              {showFilterPanel ? "Hide Filters" : "Show Filters"}
            </button>
          </div>

          {/* Vertical Filter Panel */}
          {showFilterPanel && (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
              <h3 className="text-lg font-semibold mb-3">Filters</h3>
              <p className="text-gray-600 text-sm mb-4">
                Filter options would appear here when implemented
              </p>
              <div className="space-y-3">
                {columns.slice(0, 5).map((column) => (
                  <div key={column.accessorKey}>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      {column.header}
                    </label>
                    <select className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-sm">
                      <option value="">All</option>
                      <option value="option1">Option 1</option>
                      <option value="option2">Option 2</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TableView;
