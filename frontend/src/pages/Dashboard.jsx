import React, { useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import TableView from "../components/TableView";
import MapView from "../components/MapView";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("Home");

  const renderContent = () => {
    switch (activeTab) {
      case "Home":
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Home</h2>
            <p>Welcome to Genius DB Dashboard</p>
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
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Charts</h2>
            <p>Charts content goes here</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-2">Chart 1</h3>
                <div className="h-64 bg-gray-200 rounded flex items-center justify-center">
                  <span>Chart Visualization</span>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-2">Chart 2</h3>
                <div className="h-64 bg-gray-200 rounded flex items-center justify-center">
                  <span>Chart Visualization</span>
                </div>
              </div>
            </div>
          </div>
        );
      case "Map View":
        return <MapView />;
      case "Table View":
        return <TableView />;
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
      <Header />
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="mt-32">{renderContent()}</main>
    </div>
  );
};

export default Dashboard;
