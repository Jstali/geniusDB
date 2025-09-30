import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import HomePage from "./HomePage";
import MapView from "./MapView";
import TableView from "../components/TableView";
import CustomChartBuilder from "../components/CustomChartBuilder";
import SummaryPage from "./SummaryPage";

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Home");

  const handleLogout = () => {
    navigate("/login");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "Home":
        return <HomePage />;
      case "Summary":
        return <SummaryPage />;
      case "Map View":
        return <MapView />;
      case "Table View":
        return <TableView />;
      case "Charts":
        return (
          <div className="p-6">
            <CustomChartBuilder />
          </div>
        );
      case "Admin Panel":
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Admin Panel</h2>
            <p>Admin panel content goes here</p>
          </div>
        );
      default:
        return <HomePage />;
    }
  };

  // Animation variants for page transitions
  const pageVariants = {
    initial: {
      opacity: 0,
      y: 20,
    },
    in: {
      opacity: 1,
      y: 0,
    },
    out: {
      opacity: 0,
      y: -20,
    },
  };

  const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.3,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onLogout={handleLogout} />
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <motion.main
        className="mt-32 p-6"
        key={activeTab}
        variants={pageVariants}
        initial="initial"
        animate="in"
        exit="out"
        transition={pageTransition}
      >
        {renderContent()}
      </motion.main>
    </div>
  );
};

export default Dashboard;
