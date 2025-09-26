import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import TableView from "../components/TableView";
import MapViewComponent from "../components/MapViewComponent";
import CompactMapViewComponent from "../components/CompactMapViewComponent";
import CustomChartBuilder from "../components/CustomChartBuilder";

const Dashboard = () => {
  console.log("Dashboard: Component initialized");

  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Home");
  // State to hold table data for charts
  const [tableData, setTableData] = useState([]);
  const [tableColumns, setTableColumns] = useState([]);

  // Function to update table data when TableView fetches it
  // Use useCallback to prevent unnecessary re-renders
  const updateTableData = useCallback((data, columns) => {
    console.log("=== Dashboard updateTableData called ===");
    console.log("Data received:", data);
    console.log("Columns received:", columns);
    console.log("Data length:", data ? data.length : "No data");
    console.log("Columns length:", columns ? columns.length : "No columns");

    // Only update if data actually changed
    setTableData((prevData) => {
      if (prevData.length !== data.length) {
        return data;
      }
      // Simple shallow comparison
      return prevData;
    });

    setTableColumns((prevColumns) => {
      if (prevColumns.length !== columns.length) {
        return columns;
      }
      // Simple shallow comparison
      return prevColumns;
    });

    console.log("======================================");
  }, []);

  const handleLogout = () => {
    // In a real app, you would clear user session/token here
    navigate("/login");
  };

  const renderContent = () => {
    console.log("Dashboard: renderContent called with activeTab:", activeTab);

    switch (activeTab) {
      case "Home":
        console.log("Dashboard: Rendering Home tab");
        return (
          <div className="flex flex-col h-full p-6">
            {/* Map View - Reduced width by 25% (from 65% to 50%), reduced height */}
            <div className="w-full mb-6" style={{ height: "60%" }}>
              {" "}
              {/* Reduced from 80% to 60% to accommodate smaller map */}
              <div
                className="h-full"
                style={{ width: "50%", margin: "0 auto" }} // Maintained at 50%
              >
                <CompactMapViewComponent />
              </div>
            </div>

            {/* Table View - remaining space with scrolling */}
            <div className="flex-grow overflow-auto">
              <TableView updateTableData={updateTableData} />
            </div>
          </div>
        );
      case "Summary":
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Summary</h2>
            <p>Summary content goes here</p>
          </div>
        );
      case "Charts":
        console.log("Dashboard: Rendering Charts tab with data:", {
          tableDataLength: tableData.length,
          tableColumnsLength: tableColumns.length,
        });
        return (
          <div className="p-6">
            {/* Show chart builder with real data when available */}
            <CustomChartBuilder data={tableData} columns={tableColumns} />
          </div>
        );
      case "Map View":
        return (
          <div className="p-6">
            <div className="grid grid-cols-1 gap-6">
              <MapViewComponent />
            </div>
          </div>
        );
      case "Table View":
        console.log("Dashboard: Rendering Table View tab");
        return <TableView updateTableData={updateTableData} />;
      case "Admin Panel":
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Admin Panel</h2>
            <p>Admin panel content goes here</p>
          </div>
        );
      default:
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Home</h2>
            <p>Welcome to Genius DB Dashboard</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onLogout={handleLogout} />
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="mt-32">{renderContent()}</main>
    </div>
  );
};

export default Dashboard;