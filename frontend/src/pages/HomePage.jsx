import React, { useState, useEffect, useMemo } from "react";
import CompactLeafletMap from "../components/CompactLeafletMap";
import SidebarFilters from "../components/SidebarFilters";
import SiteDetailsPanel from "../components/SiteDetailsPanel";
import DataTable from "../components/DataTable";

const HomePage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [columns, setColumns] = useState([]);
  const [selectedSite, setSelectedSite] = useState(null);
  const [filters, setFilters] = useState({
    siteName: "",
    voltage: [],
    powerRange: { min: 0, max: 200 }, // Show all sites by default (<= 200 MW)
    operators: [],
  });

  // Fetch data from the same endpoint as TableView
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log("Fetching transformer data...");

        // First, trigger the data processing script
        const processResponse = await fetch("/process/transformers");
        if (!processResponse.ok) {
          throw new Error(
            `HTTP error while processing data! status: ${processResponse.status}`
          );
        }
        const processResult = await processResponse.json();
        if (processResult.status === "error") {
          throw new Error(processResult.message);
        }
        console.log("Data processing result:", processResult);

        // Then fetch the transformer data from the backend API
        const response = await fetch("/data/transformers");
        if (!response.ok) {
          throw new Error(
            `HTTP error while fetching data! status: ${response.status}`
          );
        }
        const jsonData = await response.json();
        console.log("Fetched transformer data:", jsonData.length, "records");
        console.log("Sample data:", jsonData.slice(0, 3));

        // Set the transformer data directly
        setData(jsonData);

        // Generate columns dynamically from the data
        if (jsonData.length > 0) {
          const keys = Object.keys(jsonData[0]);
          const cols = keys.map((k) => ({
            accessorKey: k,
            header: String(k)
              .replace(/_/g, " ")
              .replace(/\b\w/g, (c) => c.toUpperCase()),
          }));
          setColumns(cols);
        } else {
          setColumns([]);
        }
      } catch (err) {
        console.error("Error fetching transformer data:", err);
        setError(err.message);
        setData([]);
        setColumns([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    if (!data || data.length === 0) return null;

    const totalSubstations = data.length;
    const headroomValues = data
      .map((item) => item["Generation Headroom Mw"])
      .filter((val) => val !== null && val !== undefined);

    const avgHeadroom =
      headroomValues.length > 0
        ? headroomValues.reduce((sum, val) => sum + val, 0) /
          headroomValues.length
        : null;

    const greenSites = data.filter(
      (item) => item["Generation Headroom Mw"] >= 50
    ).length;
    const amberSites = data.filter(
      (item) =>
        item["Generation Headroom Mw"] >= 20 &&
        item["Generation Headroom Mw"] < 50
    ).length;
    const redSites = data.filter(
      (item) => item["Generation Headroom Mw"] < 20
    ).length;

    return {
      totalSubstations,
      avgHeadroom,
      greenSites,
      amberSites,
      redSites,
    };
  }, [data]);

  // Extract unique voltage levels and operators from data
  const voltageLevels = [...new Set(data.map((site) => site["Site Voltage"]))]
    .filter(Boolean)
    .sort((a, b) => a - b);
  const operators = [...new Set(data.map((site) => site["Licence Area"]))]
    .filter(Boolean)
    .sort();

  const handleMarkerClick = (site) => {
    setSelectedSite(site);
  };

  return (
    <div className="flex flex-col h-full pt-4 transition-all duration-300">
      {/* Top section with map and panels */}
      <div className="flex gap-4 h-[600px] mb-6 transition-all duration-300">
        {/* Left panel - Filters */}
        <div className="w-64 shrink-0 transition-all duration-300 hover:shadow-xl">
          <SidebarFilters
            onSiteNameSearch={(name) =>
              setFilters({ ...filters, siteName: name })
            }
            onVoltageFilter={(voltage) => setFilters({ ...filters, voltage })}
            onPowerRangeChange={(range) => {
              setFilters({ ...filters, powerRange: range });
            }}
            onOperatorFilter={(operators) =>
              setFilters({ ...filters, operators })
            }
            voltageLevels={voltageLevels}
            operators={operators}
            currentFilters={filters}
          />
        </div>

        {/* Center - Map with extra width */}
        <div className="flex-grow transition-all duration-300">
          <div className="h-full rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl">
            <CompactLeafletMap
              isHomePage={true}
              data={data}
              filters={filters}
              onMarkerClick={handleMarkerClick}
            />
          </div>
        </div>

        {/* Right panel - Site Details */}
        <div className="w-80 shrink-0 transition-all duration-300 hover:shadow-xl">
          <SiteDetailsPanel
            selectedSite={selectedSite}
            summaryStats={summaryStats}
            onClose={() => setSelectedSite(null)}
          />
        </div>
      </div>

      {/* Bottom section - Table */}
      <div className="flex-grow bg-white rounded-lg shadow-lg p-4 transition-all duration-300 hover:shadow-xl">
        {loading ? (
          <div className="w-full h-64 flex items-center justify-center">
            <div className="text-gray-600">Loading data...</div>
          </div>
        ) : error ? (
          <div className="w-full h-64 flex items-center justify-center">
            <div className="text-red-600">{error}</div>
          </div>
        ) : (
          <DataTable data={data} columns={columns} />
        )}
      </div>
    </div>
  );
};

export default HomePage;
