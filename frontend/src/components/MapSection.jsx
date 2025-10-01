import React, { useState, useEffect, useRef, useMemo } from "react";
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

// Custom marker icon component
const createMarkerIcon = (color) => {
  return L.divIcon({
    className: "custom-icon",
    html: `
      <div style="position: relative; width: 20px; height: 20px;">
        <div style="
          width: 20px;
          height: 20px;
          background-color: ${color};
          border: 2px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        "></div>
      </div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10],
  });
};

const MapSection = ({
  data = [],
  filters = {},
  onMarkerClick,
  activeView = null,
}) => {
  const [markers, setMarkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const mapRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Get API base URL from environment or default to localhost:8000
  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

  // Convert frontend filters to backend format
  const convertFilters = (frontendFilters) => {
    const backendFilters = {};

    // Site Name filter
    if (frontendFilters.siteName && frontendFilters.siteName.trim() !== "") {
      backendFilters["site_name"] = [
        { op: "contains", value: frontendFilters.siteName.trim() },
      ];
    }

    // Voltage Level filter
    if (frontendFilters.voltage && frontendFilters.voltage.length > 0) {
      backendFilters["voltage_level"] = [
        { op: "in", value: frontendFilters.voltage },
      ];
    }

    // Available Power filter
    if (
      frontendFilters.powerRange &&
      frontendFilters.powerRange.max !== undefined
    ) {
      backendFilters["available_power"] = [
        { op: ">", value: frontendFilters.powerRange.max },
      ];
    }

    // Network Operator filter
    if (frontendFilters.operators && frontendFilters.operators.length > 0) {
      backendFilters["network_operator"] = [
        { op: "in", value: frontendFilters.operators },
      ];
    }

    return backendFilters;
  };

  // Fetch filtered map data from backend when filters or active view changes
  useEffect(() => {
    const fetchFilteredMapData = async () => {
      // Cancel any ongoing requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller for this request
      abortControllerRef.current = new AbortController();

      try {
        setLoading(true);
        setError(null);

        // If we have an active view, use the new backend endpoint
        if (activeView) {
          console.log(
            "MapSection: Fetching filtered map data with active view",
            {
              activeView,
              filters,
            }
          );

          // Convert frontend filters to backend format
          const backendFilters = convertFilters(filters);

          // Log filters before sending to backend
          console.log("Sending filters to backend:", backendFilters);

          // Prepare the request payload with the correct structure
          const payload = {
            filters: backendFilters,
            selected_columns: [
              "site_name",
              "latitude",
              "longitude",
              "voltage_level",
              "available_power",
              "network_operator",
            ],
          };

          // Make request to the new backend endpoint
          const response = await fetch(
            `${API_BASE}/api/views/${activeView}/map-data?user_id=1`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(payload),
              signal: abortControllerRef.current.signal,
            }
          );

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const result = await response.json();
          console.log("MapSection: Received filtered map data", result);

          if (result.error) {
            throw new Error(result.error);
          }

          // Transform backend response to markers
          const transformedMarkers = result.rows.map((row, index) => {
            return {
              id: `${row.site_name}-${index}`,
              position: [row.latitude, row.longitude],
              popupText: `${row.site_name}`,
              siteName: row.site_name,
              siteVoltage: row.voltage_level,
              generationHeadroom: row.available_power,
              licenceArea: row.network_operator,
              color: getMarkerColor(row.available_power),
              ...row,
            };
          });

          setMarkers(transformedMarkers);
        } else {
          // Fallback to client-side filtering if no active view
          console.log(
            "MapSection: Processing map data with client-side filters...",
            {
              filters,
              dataLength: data.length,
            }
          );

          // Apply filters to the data
          const filteredData = data.filter((site) => {
            // Site name filter
            if (filters.siteName && filters.siteName.trim() !== "") {
              const siteName = site["Site Name"] || "";
              if (
                !siteName.toLowerCase().includes(filters.siteName.toLowerCase())
              ) {
                return false;
              }
            }

            // Voltage filter
            if (filters.voltage && filters.voltage.length > 0) {
              const siteVoltage = site["Site Voltage"];
              if (siteVoltage && !filters.voltage.includes(siteVoltage)) {
                return false;
              }
            }

            // Power range filter
            if (filters.powerRange) {
              const headroom = site["Generation Headroom Mw"];
              if (
                headroom !== undefined &&
                headroom !== null &&
                !isNaN(headroom)
              ) {
                if (headroom > filters.powerRange.max) {
                  return false;
                }
              }
            }

            // Operator filter
            if (filters.operators && filters.operators.length > 0) {
              const licenceArea = site["Licence Area"];
              if (licenceArea && !filters.operators.includes(licenceArea)) {
                return false;
              }
            }

            // Check if site has valid coordinates
            const spatialCoords = site["Spatial Coordinates"];
            if (!spatialCoords || spatialCoords === "\\N") {
              return false;
            }

            return true;
          });

          // Transform the filtered data into markers
          const transformedMarkers = filteredData
            .map((site, index) => {
              // Get spatial coordinates (format: "lat, lng")
              const spatialCoords = site["Spatial Coordinates"];
              if (!spatialCoords || spatialCoords === "\\N") {
                return null;
              }

              try {
                const coords = spatialCoords.trim().split(", ");
                if (coords.length !== 2) return null;

                const lat = parseFloat(coords[0]);
                const lng = parseFloat(coords[1]);

                if (isNaN(lat) || isNaN(lng)) return null;

                const siteName = site["Site Name"] || "Unknown Site";
                const generationHeadroom = site["Generation Headroom Mw"];

                return {
                  id: `${siteName}-${index}`,
                  position: [lat, lng],
                  popupText: `${siteName} (${site["Site Type"] || "Unknown"})`,
                  siteName: siteName,
                  siteType: site["Site Type"] || "Unknown",
                  siteVoltage: site["Site Voltage"] || "Unknown",
                  county: site["County"] || "Unknown",
                  generationHeadroom: generationHeadroom,
                  color: getMarkerColor(generationHeadroom),
                  ...site,
                };
              } catch (e) {
                console.error("Error processing site coordinates:", site, e);
                return null;
              }
            })
            .filter((marker) => marker !== null);

          setMarkers(transformedMarkers);
          console.log("MapSection: Markers set:", transformedMarkers.length);
        }

        // Auto-fit map to markers
        if (mapRef.current && markers.length > 0) {
          const bounds = L.latLngBounds(
            markers.map((marker) => marker.position)
          );

          setTimeout(() => {
            if (mapRef.current) {
              mapRef.current.fitBounds(bounds, {
                padding: [20, 20],
                maxZoom: 12,
              });
            }
          }, 100);
        }
      } catch (err) {
        if (err.name === "AbortError") {
          console.log("MapSection: Request was cancelled");
          return; // Exit early if request was cancelled
        }

        console.error("MapSection: Error processing map data:", err);
        setError("Failed to process map data: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredMapData();

    // Cleanup function to cancel any ongoing requests
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [data, filters, activeView]);

  useEffect(() => {
    // Handle window resize
    const handleResize = () => {
      if (mapRef.current) {
        setTimeout(() => {
          mapRef.current.invalidateSize();
        }, 100);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-white rounded-2xl shadow-lg">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-white rounded-2xl shadow-lg">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Error! </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  // Show "No sites match these filters" message when no markers
  if (markers.length === 0 && !loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-white rounded-2xl shadow-lg">
        <div className="text-gray-600 text-center">
          <p className="font-medium">No sites match these filters.</p>
          <p className="text-sm mt-1">Try adjusting your filter criteria.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden h-full">
      <div className="relative w-full h-full">
        <MapContainer
          center={[52.3, 0.1]}
          zoom={8}
          style={{ height: "100%", width: "100%" }}
          eventHandlers={{
            click: () => {
              if (onMarkerClick) {
                onMarkerClick(null);
              }
            },
          }}
          whenCreated={(map) => {
            mapRef.current = map;
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
              eventHandlers={{
                click: () => {
                  if (onMarkerClick) {
                    onMarkerClick(marker);
                  }
                },
              }}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-bold text-sm mb-1">{marker.siteName}</h3>
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
                  {marker.siteVoltage && (
                    <p className="text-xs mt-1">
                      <span className="font-medium">Voltage:</span>{" "}
                      {marker.siteVoltage} kV
                    </p>
                  )}
                  {marker.county && (
                    <p className="text-xs mt-1">
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
    </div>
  );
};

export default MapSection;
