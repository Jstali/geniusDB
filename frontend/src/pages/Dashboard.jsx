import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
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
            <h2 className="text-2xl text-gray-950 font-bold mb-4">
              Admin Panel
            </h2>
            <p className="text-gray-600">Admin panel content goes here</p>
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header
        onLogout={handleLogout}
        className={
          activeTab === "Home" ? "fixed top-0 left-0 right-0 z-20" : ""
        }
      />
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        className={
          activeTab === "Home" ? "fixed top-16 left-0 right-0 z-10" : ""
        }
      />
      <motion.main
        className={`flex-grow p-6 ${
          activeTab === "Home" ||
          activeTab === "Summary" ||
          activeTab === "Charts"
            ? "pb-16"
            : ""
        } ${activeTab === "Home" ? "pt-32" : "mt-4"}`}
        key={activeTab}
        variants={pageVariants}
        initial="initial"
        animate="in"
        exit="out"
        transition={pageTransition}
      >
        {renderContent()}
      </motion.main>
      <Footer
        showButtons={activeTab === "Home"}
        className={
          activeTab === "Home" ||
          activeTab === "Summary" ||
          activeTab === "Charts"
            ? "fixed bottom-0 left-0 right-0 z-10"
            : ""
        }
      />
    </div>
  );
};

export default Dashboard;
