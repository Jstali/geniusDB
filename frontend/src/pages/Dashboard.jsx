import React, { useState, useEffect } from "react";
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
  const [allColumns, setAllColumns] = useState([]);
  const [activeView, setActiveView] = useState(null); // Track active view

  // View management state
  const [tableViewConfig, setTableViewConfig] = useState({
    selectedColumns: [],
    filters: {},
  });

  const [chartViewConfig, setChartViewConfig] = useState({
    type: "bar",
    xAxis: "",
    yAxis: "",
  });

  // Fetch all columns for ViewManager
  useEffect(() => {
    const fetchColumns = async () => {
      try {
        const response = await fetch("/data/columns");
        if (response.ok) {
          const data = await response.json();
          // Extract column objects from the data structure
          const columns = Object.keys(data).reduce((acc, tableName) => {
            if (data[tableName] && Array.isArray(data[tableName])) {
              acc.push(...data[tableName]);
            }
            return acc;
          }, []);
          setAllColumns(columns);
        }
      } catch (error) {
        console.error("Failed to fetch columns:", error);
      }
    };

    fetchColumns();
  }, []);

  const handleLogout = () => {
    navigate("/login");
  };

  const handleViewLoad = (viewConfig) => {
    console.log("=== Dashboard: handleViewLoad called ===");
    console.log("View config:", viewConfig);

    // Update table view configuration
    if (viewConfig.tableView) {
      setTableViewConfig({
        ...tableViewConfig,
        ...viewConfig.tableView,
        activeView: viewConfig.viewName || null, // Set active view
      });
      console.log("Table view config updated:", viewConfig.tableView);
    }

    // Update chart view configuration
    if (viewConfig.chartView) {
      setChartViewConfig(viewConfig.chartView);
      console.log("Chart view config updated:", viewConfig.chartView);
    }

    // Set active view
    if (viewConfig.viewName) {
      setActiveView(viewConfig.viewName);
    }

    console.log("=== Dashboard: handleViewLoad completed ===");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "Home":
        return (
          <HomePage
            tableViewConfig={{
              ...tableViewConfig,
              activeView: activeView, // Pass active view to HomePage
            }}
            setTableViewConfig={setTableViewConfig}
            chartViewConfig={chartViewConfig}
            setChartViewConfig={setChartViewConfig}
          />
        );
      case "Summary":
        return <SummaryPage />;
      case "Map View":
        return <MapView activeView={activeView} />; // Pass active view to MapView
      case "Table View":
        return <TableView />;
      case "Charts":
        return (
          <div className="p-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Charts</h1>
              <p className="text-gray-600">
                Build custom charts from your data. Select a chart type and
                configure the axes.
              </p>
            </div>
            <CustomChartBuilder
              selectedColumns={tableViewConfig?.selectedColumns || []}
              filters={tableViewConfig?.filters || {}}
              chartType={chartViewConfig?.type || "bar"}
              xAxis={chartViewConfig?.xAxis || ""}
              yAxis={chartViewConfig?.yAxis || ""}
            />
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
        onViewLoad={handleViewLoad} // Pass the view load handler to Header
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
        onViewLoad={handleViewLoad}
        currentTableView={tableViewConfig}
        currentChartView={chartViewConfig}
        allColumns={allColumns}
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
