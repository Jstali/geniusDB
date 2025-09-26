import React, { useState, useEffect } from "react";
import HomePageMap from "./HomePageMap";

const CompactMapViewComponent = () => {
  const [substationData, setSubstationData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubstationData = async () => {
      try {
        setLoading(true);
        console.log("Fetching substation data from backend...");
        // Fetch real map data from the backend API
        const response = await fetch("http://localhost:8000/data/map");
        console.log("Response status:", response.status);
        console.log("Response headers:", [...response.headers.entries()]);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Raw data received from backend:", data.slice(0, 3)); // Log first 3 items

        // Transform backend data to match HomePageMap expected format
        const transformedData = data.map((site) => ({
          id: site.id,
          position: site.position,
          popupText: site.popup_text,
        }));

        console.log(
          "Transformed data for HomePageMap (first 3 items):",
          transformedData.slice(0, 3)
        );
        setSubstationData(transformedData);
      } catch (err) {
        console.error("Error fetching substation data:", err);
        setError(
          "Failed to fetch substation data from backend: " + err.message
        );
        // We'll let HomePageMap use its sample data
        setSubstationData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSubstationData();
  }, []);

  return (
    <div className="map-overview-section bg-white rounded-lg shadow-lg p-4 h-full">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-bold text-gray-800">
          Grid Substations Map
        </h3>
        <div className="text-xs text-gray-500">
          {loading
            ? "Loading..."
            : error
            ? `Error: ${error}`
            : "Interactive Map"}
        </div>
      </div>
      <div className="home-page-map-container">
        <HomePageMap substationData={substationData} />
      </div>
    </div>
  );
};

export default CompactMapViewComponent;
