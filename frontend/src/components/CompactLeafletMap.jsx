import React, { useState, useEffect, useRef } from "react";
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

// Home page map settings
const homePageMapConfig = {
  center: [54.5, -2.0], // UK center coordinates
  zoom: 6, // Adjust to show UK with markers
  bounds: "auto-fit-to-markers",
  padding: 20,
  controls: {
    zoom: true,
    fullscreen: false, // Disable for home page
    layers: false, // Simplified for overview
  },
};

const CompactLeafletMap = ({ isHomePage = false }) => {
  const [markers, setMarkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    const fetchMapData = async () => {
      try {
        setLoading(true);
        console.log("Fetching map data...");
        // Fetch real map data from the backend API
        const response = await fetch("http://localhost:8000/data/map");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const mapData = await response.json();
        console.log("Map data received:", mapData);

        // Transform the data into the format expected by the map component
        const transformedMarkers = mapData.map((site) => ({
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
        console.log("Markers set:", transformedMarkers);

        // Auto-fit map to markers after data is loaded (only for home page)
        if (isHomePage && mapRef.current && transformedMarkers.length > 0) {
          console.log("Auto-fitting map to markers for home page");
          // Calculate bounds of all markers
          const bounds = L.latLngBounds(
            transformedMarkers.map((marker) => marker.position)
          );

          // Fit map to bounds with padding
          setTimeout(() => {
            if (mapRef.current) {
              mapRef.current.fitBounds(bounds, {
                padding: [homePageMapConfig.padding, homePageMapConfig.padding],
                maxZoom: 12,
              });
              console.log("Map fitted to bounds");
            }
          }, 100);
        }
      } catch (err) {
        console.error("Error fetching map data:", err);
        setError("Failed to fetch map data from backend");
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
        console.log("Using sample markers:", sampleMarkers);

        // Auto-fit map to sample markers (only for home page)
        if (isHomePage && mapRef.current && sampleMarkers.length > 0) {
          console.log("Auto-fitting map to sample markers for home page");
          const bounds = L.latLngBounds(
            sampleMarkers.map((marker) => marker.position)
          );

          setTimeout(() => {
            if (mapRef.current) {
              mapRef.current.fitBounds(bounds, {
                padding: [homePageMapConfig.padding, homePageMapConfig.padding],
                maxZoom: 12,
              });
              console.log("Map fitted to sample bounds");
            }
          }, 100);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMapData();
  }, [isHomePage]);

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
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Error! </strong>
          <span className="block sm:inline">{error}</span>
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
    <div
      className={`w-full ${
        isHomePage
          ? "home-page-map"
          : "h-full bg-white rounded-lg shadow-lg p-4"
      }`}
    >
      {!isHomePage && (
        <div className="flex justify-between items-center mb-3">
          <div>
            <h3 className="text-lg font-bold text-gray-800">
              Grid Substations Map
            </h3>
            <p className="text-xs text-gray-600">{markers.length} sites</p>
          </div>
          <div className="flex space-x-2">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-600 rounded-full mr-1"></div>
              <span className="text-xs">{greenMarkers}</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-orange-500 rounded-full mr-1"></div>
              <span className="text-xs">{amberMarkers}</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-600 rounded-full mr-1"></div>
              <span className="text-xs">{redMarkers}</span>
            </div>
          </div>
        </div>
      )}

      <div
        className={`relative w-full rounded-lg overflow-hidden border border-gray-300 ${
          isHomePage ? "" : "h-[calc(100%-2rem)]"
        }`}
      >
        <MapContainer
          center={isHomePage ? homePageMapConfig.center : [52.0, 0.5]}
          zoom={isHomePage ? homePageMapConfig.zoom : 8}
          style={{ height: "100%", width: "100%" }}
          eventHandlers={{
            click: handleMapClick,
          }}
          whenCreated={(map) => {
            mapRef.current = map;
            console.log("Map created with markers:", markers);
            // Auto-fit map to markers when map is created (only for home page)
            if (isHomePage && markers.length > 0) {
              console.log(
                "Auto-fitting map to markers on creation for home page"
              );
              const bounds = L.latLngBounds(
                markers.map((marker) => marker.position)
              );
              setTimeout(() => {
                if (mapRef.current) {
                  map.fitBounds(bounds, {
                    padding: [
                      homePageMapConfig.padding,
                      homePageMapConfig.padding,
                    ],
                    maxZoom: 12,
                  });
                  console.log("Map fitted to bounds on creation");
                }
              }, 100);
            }
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
                  <h3 className="font-bold text-sm mb-1">{marker.popupText}</h3>
                  <p className="text-xs text-gray-600">
                    Lat: {marker.position[0].toFixed(4)}, Lng:{" "}
                    {marker.position[1].toFixed(4)}
                  </p>
                  {marker.generationHeadroom !== null &&
                    marker.generationHeadroom !== undefined && (
                      <p className="text-xs mt-1">
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
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default CompactLeafletMap;
