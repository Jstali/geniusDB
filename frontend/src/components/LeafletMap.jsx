import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Function to determine marker color based on generation headroom
const getMarkerColor = (headroom) => {
  if (headroom === null || headroom === undefined) {
    return "#808080"; // Gray for unknown values
  }

  if (headroom >= 50) {
    return "#008000"; // Green for 50MW and greater
  } else if (headroom >= 20) {
    return "#FFA500"; // Amber for 20MW to 50MW
  } else {
    return "#FF0000"; // Red for less than 20MW
  }
};

// Custom marker icon component - Changed to location pin shape with Pin Traveler logo
const createMarkerIcon = (color) => {
  return L.divIcon({
    className: "custom-icon",
    html: `
      <div style="position: relative; width: 30px; height: 30px;">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="${color}" stroke="white" stroke-width="1">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
        <!-- Pin Traveler Logo -->
        <div style="position: absolute; top: 3px; left: 50%; transform: translateX(-50%); width: 14px; height: 14px;">
          <svg width="14" height="14" viewBox="0 0 24 24">
            <!-- White background circle -->
            <circle cx="12" cy="12" r="9" fill="white"/>
            <!-- Mini pin shape -->
            <path d="M12 7c-1.1 0-2 .9-2 2 0 1.5 1.5 4 2 5 0 0 1.5-2.5 1.5-4 0-1.1-.9-2-2-2z" fill="${color}"/>
            <circle cx="12" cy="9" r="1" fill="white"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 30], // Anchor at the bottom center of the pin
    popupAnchor: [0, -30], // Popup appears above the pin
  });
};

const LeafletMap = () => {
  const [markers, setMarkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMapData = async () => {
      try {
        setLoading(true);
        console.log("Fetching map data...");

        const response = await fetch("/data/map");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const jsonData = await response.json();
        console.log("Fetched map data:", jsonData.length, "records");

        // Transform the data into the format expected by the map component
        const transformedMarkers = jsonData.map((site) => ({
          id: site.id,
          position: site.position,
          popupText: site.popup_text,
          siteName: site.site_name,
          siteType: site.site_type,
          siteVoltage: site.site_voltage,
          county: site.county,
          generationHeadroom: site.generation_headroom,
          color: getMarkerColor(site.generation_headroom),
        }));

        setMarkers(transformedMarkers);
      } catch (err) {
        setError("Failed to fetch map data from backend");
        console.error("Error fetching map data:", err);
        // Fallback to sample data if backend fails
        const sampleMarkers = [
          {
            id: 1,
            position: [52.0686, 0.6054],
            popupText: "Belchamp Grid Substation",
            color: "#008000", // Green
          },
          {
            id: 2,
            position: [52.3727, 1.1056],
            popupText: "Diss Grid Substation",
            color: "#FFA500", // Amber
          },
          {
            id: 3,
            position: [51.8259, 1.1794],
            popupText: "Clacton Grid Substation",
            color: "#FF0000", // Red
          },
        ];
        setMarkers(sampleMarkers);
      } finally {
        setLoading(false);
      }
    };

    fetchMapData();
  }, []);

  const handleMapClick = (event) => {
    const { lat, lng } = event.latlng;
    const newMarker = {
      id: markers.length + 1,
      position: [lat, lng],
      popupText: `Marker #${markers.length + 1}`,
    };
    setMarkers([...markers, newMarker]);
  };

  if (loading) {
    return (
      <div className="w-full h-full">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">
            Interactive Leaflet Map
          </h2>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">
            Interactive Leaflet Map
          </h2>
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <strong className="font-bold">Error! </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        </div>
      </div>
    );
  }

  // Count markers by color category
  const greenMarkers = markers.filter(
    (marker) => marker.color === "#008000"
  ).length;
  const amberMarkers = markers.filter(
    (marker) => marker.color === "#FFA500"
  ).length;
  const redMarkers = markers.filter(
    (marker) => marker.color === "#FF0000"
  ).length;
  const grayMarkers = markers.filter(
    (marker) => marker.color === "#808080"
  ).length;

  return (
    <div className="w-full h-full" style={{ zIndex: "1" }}>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Grid Substations Map
            </h2>
            <p className="text-gray-600">
              Displaying {markers.length} electrical grid substations
            </p>
          </div>
          <div className="bg-blue-100 px-3 py-1 rounded-full">
            <span className="text-sm font-medium text-blue-800">
              {markers.length} Sites
            </span>
          </div>
        </div>
        <p className="text-gray-600 mb-4">
          Locations of electrical grid substations. Color coding based on
          Generation Headroom:
        </p>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-600 rounded-full mr-2"></div>
            <span className="text-sm">Green: ≥ 50MW ({greenMarkers})</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-orange-500 rounded-full mr-2"></div>
            <span className="text-sm">Amber: 20-50MW ({amberMarkers})</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-600 rounded-full mr-2"></div>
            <span className="text-sm">Red: &lt; 20MW ({redMarkers})</span>
          </div>
          {grayMarkers > 0 && (
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gray-500 rounded-full mr-2"></div>
              <span className="text-sm">Gray: Unknown ({grayMarkers})</span>
            </div>
          )}
        </div>

        <div className="relative w-full h-[500px] rounded-lg overflow-hidden border border-gray-300">
          <MapContainer
            center={[52.0, 0.5]}
            zoom={8}
            style={{ height: "100%", width: "100%" }}
            eventHandlers={{
              click: handleMapClick,
            }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            {markers.map((marker) => (
              <Marker
                key={marker.id}
                position={marker.position}
                icon={createMarkerIcon(marker.color)}
              >
                <Popup>
                  <div className="p-2">
                    <h3 className="font-bold text-lg mb-1">
                      {marker.siteName}
                    </h3>
                    {marker.generationHeadroom !== null &&
                      marker.generationHeadroom !== undefined && (
                        <p className="text-sm mt-1">
                          <span className="font-medium">
                            Generation Headroom:
                          </span>{" "}
                          <span
                            className={
                              marker.generationHeadroom >= 50
                                ? "text-green-600"
                                : marker.generationHeadroom >= 20
                                ? "text-orange-500"
                                : "text-red-600"
                            }
                          >
                            {marker.generationHeadroom} MW
                          </span>
                        </p>
                      )}
                    {marker.siteVoltage && (
                      <p className="text-sm mt-1">
                        <span className="font-medium">Voltage:</span>{" "}
                        {marker.siteVoltage} kV
                      </p>
                    )}
                    {marker.county && (
                      <p className="text-sm mt-1">
                        <span className="font-medium">County:</span>{" "}
                        {marker.county}
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <div className="bg-blue-50 px-3 py-2 rounded-lg">
            <span className="text-sm font-medium text-blue-800">
              Substations:
            </span>
            <span className="text-sm text-blue-600 ml-2">{markers.length}</span>
          </div>
          <div className="bg-green-50 px-3 py-2 rounded-lg">
            <span className="text-sm font-medium text-green-800">Center:</span>
            <span className="text-sm text-green-600 ml-2">52.0000, 0.5000</span>
          </div>
          <div className="bg-purple-50 px-3 py-2 rounded-lg">
            <span className="text-sm font-medium text-purple-800">Zoom:</span>
            <span className="text-sm text-purple-600 ml-2">8</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeafletMap;
