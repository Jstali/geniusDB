import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

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

// Define the focused region bounds for the substation cluster area (reduced water area)
const FOCUSED_REGION_BOUNDS = [
  [51.3, -1.2], // Southwest corner [lat, lng] - Adjusted to reduce water area
  [52.3, 0.5], // Northeast corner [lat, lng] - Adjusted to reduce water area
];

const HomePageMap = ({ substationData }) => {
  const [mapData, setMapData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMapInteractive, setIsMapInteractive] = useState(false);
  const mapRef = useRef(null);

  useEffect(() => {
    console.log("HomePageMap: substationData prop received:", substationData);
    console.log(
      "HomePageMap: substationData length:",
      substationData ? substationData.length : 0
    );

    // Use provided data or sample data
    if (substationData && substationData.length > 0) {
      console.log(
        "HomePageMap: Using provided substation data:",
        substationData.slice(0, 3)
      ); // Log first 3 items
      setMapData(substationData);
    } else {
      console.log("HomePageMap: Using sample data");
      // Sample data focused on the substation cluster area
      const sampleData = [
        {
          id: 1,
          position: [51.5074, -0.1278], // London
          popupText: "London Grid Substation",
        },
        {
          id: 2,
          position: [52.4862, -1.8904], // Birmingham
          popupText: "Birmingham Grid Substation",
        },
        {
          id: 3,
          position: [51.752, -1.2577], // Oxford
          popupText: "Oxford Grid Substation",
        },
        {
          id: 4,
          position: [51.4545, -2.5879], // Bristol
          popupText: "Bristol Grid Substation",
        },
        {
          id: 5,
          position: [51.2869, -0.2347], // Guildford
          popupText: "Guildford Grid Substation",
        },
        {
          id: 6,
          position: [51.7501, -0.3392], // Luton
          popupText: "Luton Grid Substation",
        },
        {
          id: 7,
          position: [51.3767, -0.4436], // Woking
          popupText: "Woking Grid Substation",
        },
        {
          id: 8,
          position: [51.5988, -0.197], // Enfield
          popupText: "Enfield Grid Substation",
        },
        {
          id: 9,
          position: [51.5333, -0.1667], // Haringey
          popupText: "Haringey Grid Substation",
        },
        {
          id: 10,
          position: [51.4509, -0.9731], // Reading
          popupText: "Reading Grid Substation",
        },
        {
          id: 11,
          position: [51.6592, -0.5497], // Watford
          popupText: "Watford Grid Substation",
        },
        {
          id: 12,
          position: [51.5765, -0.3771], // Harrow
          popupText: "Harrow Grid Substation",
        },
        {
          id: 13,
          position: [51.5223, -0.0725], // Hackney
          popupText: "Hackney Grid Substation",
        },
        {
          id: 14,
          position: [51.4816, -0.4512], // Hounslow
          popupText: "Hounslow Grid Substation",
        },
        {
          id: 15,
          position: [51.8655, -0.4168], // Stevenage
          popupText: "Stevenage Grid Substation",
        },
      ];
      setMapData(sampleData);
    }
    setLoading(false);
  }, [substationData]);

  // Function to fit map to the focused region bounds
  const handleMapLoad = (map) => {
    mapRef.current = map;
    if (map) {
      try {
        // Disable scroll wheel zoom by default
        map.scrollWheelZoom.disable();

        // Focus on the substation cluster area
        const bounds = L.latLngBounds(FOCUSED_REGION_BOUNDS);
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [20, 20] }); // Reduced padding for better fit
        }
      } catch (err) {
        console.error("Error fitting map to focused region:", err);
        // Fallback to fitting bounds of markers if region bounds fail
        if (mapData.length > 0) {
          const validStations = mapData.filter(
            (station) => station.position && station.position.length === 2
          );

          if (validStations.length > 0) {
            const bounds = L.latLngBounds(
              validStations.map((station) => station.position)
            );
            if (bounds.isValid()) {
              map.fitBounds(bounds, { padding: [20, 20] }); // Reduced padding
            }
          }
        }
      }
    }
  };

  // Enable map interaction when user clicks on the map
  const handleMapClick = () => {
    if (mapRef.current) {
      mapRef.current.scrollWheelZoom.enable();
      setIsMapInteractive(true);
    }
  };

  // Disable map interaction when user clicks outside the map
  const handleMapBlur = () => {
    if (mapRef.current) {
      mapRef.current.scrollWheelZoom.disable();
      setIsMapInteractive(false);
    }
  };

  // Handle keydown events for modifier key interactions
  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && mapRef.current) {
      mapRef.current.scrollWheelZoom.enable();
      setIsMapInteractive(true);
    }
  };

  // Handle keyup events to disable map interaction
  const handleKeyUp = (e) => {
    if (mapRef.current && !e.ctrlKey && !e.metaKey) {
      mapRef.current.scrollWheelZoom.disable();
      setIsMapInteractive(false);
    }
  };

  // Add event listeners for keyboard interactions
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  if (loading) {
    return (
      <div
        style={{
          height: "600px", // Reduced height from 1125px to 600px
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          height: "600px", // Reduced height from 1125px to 600px
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f5f5f5",
          border: "1px dashed #ccc",
          borderRadius: "8px",
        }}
      >
        <div className="text-center">
          <p className="text-red-500 font-medium">Map Error: {error}</p>
          <p className="text-sm text-gray-600 mt-2">
            Please check Map View page for full functionality.
          </p>
        </div>
      </div>
    );
  }

  // Fallback if no data
  if (!mapData || mapData.length === 0) {
    return (
      <div
        style={{
          height: "600px", // Reduced height from 1125px to 600px
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f5f5f5",
          border: "1px dashed #ccc",
          borderRadius: "8px",
        }}
      >
        <div className="text-center">
          <p className="text-gray-600 font-medium">
            No substation data available
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Please check Map View page for full map functionality.
          </p>
        </div>
      </div>
    );
  }

  console.log("HomePageMap: Rendering map with", mapData.length, "markers");

  return (
    <div
      style={{ width: "100%", height: "600px", position: "relative" }}
      onClick={handleMapClick}
      onBlur={handleMapBlur}
      tabIndex={0}
    >
      {" "}
      {/* Reduced height from 1125px to 600px */}
      <MapContainer
        bounds={FOCUSED_REGION_BOUNDS}
        style={{
          height: "100%",
          width: "100%",
          borderRadius: "8px",
          outline: isMapInteractive ? "2px solid #3b82f6" : "none",
        }}
        whenCreated={handleMapLoad}
        scrollWheelZoom={false} // Disable scroll wheel zoom by default
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {mapData.map((station) =>
          station.position && station.position.length === 2 ? (
            <Marker
              key={
                station.id || `${station.position[0]}-${station.position[1]}`
              }
              position={[station.position[0], station.position[1]]}
            >
              {station.popupText && <Popup>{station.popupText}</Popup>}
            </Marker>
          ) : null
        )}
      </MapContainer>
      <div
        style={{
          position: "absolute",
          bottom: "10px",
          right: "10px",
          background: "rgba(255, 255, 255, 0.8)",
          padding: "5px 10px",
          borderRadius: "4px",
          fontSize: "12px",
          zIndex: 1000,
        }}
      >
        Substation Cluster Area
      </div>
      {/* Visual indicator for map interaction mode */}
      <div
        style={{
          position: "absolute",
          top: "10px",
          left: "10px",
          background: isMapInteractive
            ? "rgba(59, 130, 246, 0.9)"
            : "rgba(107, 114, 128, 0.9)",
          color: "white",
          padding: "5px 10px",
          borderRadius: "4px",
          fontSize: "12px",
          zIndex: 1000,
          transition: "background 0.3s ease",
        }}
      >
        {isMapInteractive
          ? "Interactive Mode (Ctrl/Cmd + Scroll to Zoom)"
          : "Scroll Mode (Click to Interact)"}
      </div>
    </div>
  );
};

export default HomePageMap;