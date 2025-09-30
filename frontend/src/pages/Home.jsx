import React, { useState, useEffect, useMemo } from "react";
import SidebarFilters from "../components/SidebarFilters";
import MapSection from "../components/MapSection";
import SiteDetailsCard from "../components/SiteDetailsCard";
import DataTable from "../components/DataTable";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

const Home = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [columns, setColumns] = useState([]);
  const [filters, setFilters] = useState({
    siteName: "",
    voltage: [],
    powerRange: { min: 0, max: 200 },
    operators: [],
  });
  const [selectedSite, setSelectedSite] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log("Fetching data from:", `${API_BASE}/data/transformers`);
        const res = await fetch(`${API_BASE}/data/transformers`);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const json = await res.json();
        console.log("Data received:", json.length, "items");
        if (Array.isArray(json)) {
          setData(json);
          if (json.length > 0) {
            const keys = Object.keys(json[0]);
            const cols = keys.map((k) => ({ header: k, accessorKey: k }));
            setColumns(cols);
            console.log("Columns set:", cols.length);
          } else {
            setColumns([]);
          }
        } else {
          setData([]);
          setColumns([]);
          setError("Unexpected data format from backend");
        }
      } catch (err) {
        console.error("Error fetching transformer data:", err);
        setError("Failed to fetch site data. Please check backend.");
        setData([]);
        setColumns([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const summaryStats = useMemo(() => {
    if (!data || data.length === 0) return null;
    const totalSubstations = data.length;
    const headroomValues = data
      .map((item) => item["Generation Headroom Mw"])
      .filter((v) => v !== null && v !== undefined && !isNaN(v));
    const avgHeadroom =
      headroomValues.length > 0
        ? headroomValues.reduce((s, v) => s + Number(v), 0) /
          headroomValues.length
        : null;
    const greenSites = data.filter(
      (it) => Number(it["Generation Headroom Mw"]) >= 50
    ).length;
    const amberSites = data.filter(
      (it) =>
        Number(it["Generation Headroom Mw"]) >= 20 &&
        Number(it["Generation Headroom Mw"]) < 50
    ).length;
    const redSites = data.filter(
      (it) => Number(it["Generation Headroom Mw"]) < 20
    ).length;
    return { totalSubstations, avgHeadroom, greenSites, amberSites, redSites };
  }, [data]);

  const voltageLevels = useMemo(() => {
    if (!data || data.length === 0) return [20, 22, 33, 66, 132];
    return [...new Set(data.map((s) => s["Site Voltage"]))]
      .filter(Boolean)
      .sort((a, b) => a - b);
  }, [data]);

  const operators = useMemo(() => {
    if (!data || data.length === 0) return ["EPN", "LPN", "SPN"];
    return [...new Set(data.map((s) => s["Licence Area"]))]
      .filter(Boolean)
      .sort();
  }, [data]);

  const handleMarkerClick = (site) => setSelectedSite(site);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Error! </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Top Section - Three Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
          {/* Left Sidebar - Filters */}
          <div className="lg:col-span-3">
            <SidebarFilters
              onSiteNameSearch={(name) =>
                setFilters((f) => ({ ...f, siteName: name }))
              }
              onVoltageFilter={(voltage) =>
                setFilters((f) => ({ ...f, voltage }))
              }
              onPowerRangeChange={(range) =>
                setFilters((f) => ({ ...f, powerRange: range }))
              }
              onOperatorFilter={(ops) =>
                setFilters((f) => ({ ...f, operators: ops }))
              }
              voltageLevels={voltageLevels}
              operators={operators}
              currentFilters={filters}
            />
          </div>

          {/* Center Map */}
          <div className="lg:col-span-6">
            <div className="h-[600px]">
              <MapSection
                data={data}
                filters={filters}
                onMarkerClick={handleMarkerClick}
              />
            </div>
          </div>

          {/* Right Sidebar - Site Details */}
          <div className="lg:col-span-3">
            <SiteDetailsCard
              selectedSite={selectedSite}
              summaryStats={summaryStats}
              onClose={() => setSelectedSite(null)}
            />
          </div>
        </div>

        {/* Bottom Section - Data Table */}
        <div className="w-full">
          <DataTable data={data} columns={columns} />
        </div>
      </div>
    </div>
  );
};

export default Home;
