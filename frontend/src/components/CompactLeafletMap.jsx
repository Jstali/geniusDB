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
  center: [52.3, 0.1], // Updated to requested coordinates
  zoom: 8, // Updated to requested zoom level
  bounds: "auto-fit-to-markers",
  padding: 20,
  controls: {
    zoom: true,
    fullscreen: false, // Disable for home page
    layers: false, // Simplified for overview
  },
};

const CompactLeafletMap = ({
  isHomePage = false,
  data = [],
  filters,
  onMarkerClick,
  selectedColumns = [], // Add this prop
  activeView = null, // Add this prop to track active view
}) => {
  const [markers, setMarkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const mapRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Get API base URL from environment or default to localhost:8000
  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

  // Set default filters if not provided
  const effectiveFilters = filters || useMemo(() => ({}), []);

  // Convert frontend filters to backend format
  const convertFilters = (frontendFilters) => {
    const backendFilters = {};

    // Site Name filter
    if (frontendFilters.siteName && frontendFilters.siteName.trim() !== "") {
      backendFilters["site_name"] = frontendFilters.siteName.trim();
    }

    // Voltage Level filter
    if (frontendFilters.voltage && frontendFilters.voltage !== "") {
      backendFilters["voltage_level"] = parseInt(frontendFilters.voltage);
    }

    // Available Power filter - use >= operator as per requirements
    if (
      frontendFilters.powerRange &&
      frontendFilters.powerRange.min !== undefined &&
      frontendFilters.powerRange.min > 0
    ) {
      backendFilters["available_power"] = frontendFilters.powerRange.min;
    }

    // Network Operator filter
    if (frontendFilters.operators && frontendFilters.operators !== "") {
      backendFilters["network_operator"] = frontendFilters.operators;
    }

    console.log("Converted filters:", backendFilters);
    return backendFilters;
  };

  // Fetch filtered map data from backend when filters change
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
            "CompactLeafletMap: Fetching filtered map data with active view",
            {
              activeView,
              filters: effectiveFilters,
            }
          );

          // Convert frontend filters to backend format
          const backendFilters = convertFilters(effectiveFilters);

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
          console.log("CompactLeafletMap: Received filtered map data", result);

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
        } else if (isHomePage) {
          // For home page, use the new /api/map-data endpoint
          console.log(
            "CompactLeafletMap: Fetching filtered map data for home page",
            {
              filters: effectiveFilters,
            }
          );

          // Convert frontend filters to backend format
          const backendFilters = convertFilters(effectiveFilters);

          // Log filters before sending to backend
          console.log("Sending filters to home page endpoint:", backendFilters);

          // Prepare the request payload with the correct structure
          const payload = {
            filters: backendFilters,
          };

          // Make request to the new home page backend endpoint
          const response = await fetch(`${API_BASE}/api/map-data`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
            signal: abortControllerRef.current.signal,
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const result = await response.json();
          console.log("CompactLeafletMap: Received home page map data", result);

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
            };
          });

          setMarkers(transformedMarkers);
        } else {
          // Apply filters to the data
          const filteredData = data.filter((site) => {
            // Site name filter
            if (
              effectiveFilters.siteName &&
              effectiveFilters.siteName.trim() !== ""
            ) {
              const siteName = site["Site Name"] || "";
              if (
                !siteName
                  .toLowerCase()
                  .includes(effectiveFilters.siteName.toLowerCase())
              ) {
                return false;
              }
            }

            // Voltage filter
            if (effectiveFilters.voltage && effectiveFilters.voltage !== "") {
              const siteVoltage = site["Site Voltage"];
              if (siteVoltage && siteVoltage !== effectiveFilters.voltage) {
                return false;
              }
            }

            // Power range filter - only show sites with availablePower >= selectedValue
            if (
              effectiveFilters.powerRange &&
              effectiveFilters.powerRange.min > 0
            ) {
              const headroom = site["Generation Headroom Mw"];
              if (
                headroom !== undefined &&
                headroom !== null &&
                !isNaN(headroom)
              ) {
                if (headroom < effectiveFilters.powerRange.min) {
                  return false;
                }
              } else {
                // If headroom is undefined/null/NaN, we still include the site
                // This ensures sites without power data are still visible
              }
            }

            // Operator filter
            if (
              effectiveFilters.operators &&
              effectiveFilters.operators !== ""
            ) {
              const licenceArea = site["Licence Area"];
              if (licenceArea && licenceArea !== effectiveFilters.operators) {
                return false;
              }
            }

            // Check if site has valid coordinates
            const spatialCoords = site["Spatial Coordinates"];
            if (!spatialCoords || spatialCoords === "\\N") {
              console.log(
                "Site filtered out due to missing coordinates:",
                site["Site Name"]
              );
              return false;
            }

            return true;
          });

          // Transform the filtered data into the format expected by the map component
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

                // Get site name
                const siteName = site["Site Name"] || "Unknown Site";

                // Get Generation Headroom Mw value
                const generationHeadroom = site["Generation Headroom Mw"];

                // Create a unique ID by combining site ID or name with index to prevent duplicates
                const uniqueId = site["id"]
                  ? `${site["id"]}-${index}`
                  : `${siteName}-${index}`;

                return {
                  id: uniqueId,
                  position: [lat, lng],
                  popupText: `${siteName} (${site["Site Type"] || "Unknown"})`,
                  siteName: siteName,
                  siteType: site["Site Type"] || "Unknown",
                  siteVoltage: site["Site Voltage"] || "Unknown",
                  county: site["County"] || "Unknown",
                  generationHeadroom: generationHeadroom,
                  color: getMarkerColor(generationHeadroom),
                  // Include only selected columns in the marker data if provided
                  ...(selectedColumns.length > 0
                    ? selectedColumns.reduce((acc, col) => {
                        acc[col] = site[col];
                        return acc;
                      }, {})
                    : site),
                };
              } catch (e) {
                console.error("Error processing site coordinates:", site, e);
                return null;
              }
            })
            .filter((marker) => marker !== null); // Remove null markers

          setMarkers(transformedMarkers);
          console.log(
            "CompactLeafletMap: Markers set:",
            transformedMarkers.length
          );
        }

        // Auto-fit map to markers after data is loaded (only for home page)
        if (isHomePage && mapRef.current && markers.length > 0) {
          console.log("Auto-fitting map to markers for home page");
          // Calculate bounds of all markers
          const bounds = L.latLngBounds(
            markers.map((marker) => marker.position)
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
        } else if (isHomePage && markers.length === 0) {
          console.log("No markers to display on home page map");
          // Set map to default view (this will not override user interactions)
          setTimeout(() => {
            if (mapRef.current && !mapRef.current.hasBoundsSet) {
              mapRef.current.setView(
                homePageMapConfig.center,
                homePageMapConfig.zoom
              );
              console.log("Map set to default view");
            }
          }, 100);
        }
      } catch (err) {
        if (err.name === "AbortError") {
          console.log("CompactLeafletMap: Request was cancelled");
          return; // Exit early if request was cancelled
        }

        console.error("CompactLeafletMap: Error processing map data:", err);
        setError("Failed to process map data: " + err.message);
        // Fallback to sample data if processing fails
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
        // Auto-fit map to sample markers (only for home page)
        if (isHomePage && mapRef.current && sampleMarkers.length > 0) {
          const bounds = L.latLngBounds(
            sampleMarkers.map((marker) => marker.position)
          );

          setTimeout(() => {
            if (mapRef.current) {
              mapRef.current.fitBounds(bounds, {
                padding: [homePageMapConfig.padding, homePageMapConfig.padding],
                maxZoom: 12,
              });
            }
          }, 100);
        }
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
  }, [data, isHomePage, selectedColumns, activeView, effectiveFilters]);

  useEffect(() => {
    // Handle window resize to ensure map resizes properly
    const handleResize = () => {
      if (mapRef.current) {
        setTimeout(() => {
          mapRef.current.invalidateSize();
        }, 100);
      }
    };

    window.addEventListener("resize", handleResize);

    // Initial resize check
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

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

  // If there are no markers on the home page, show a friendly message
  if (isHomePage && (!markers || markers.length === 0)) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-gray-600">
          No site markers available. Please check backend or data source.
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
      style={
        isHomePage
          ? {
              height: "600px",
              position: "relative",
              zIndex: "1",
            }
          : { position: "relative", zIndex: "1" }
      }
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
        className={`relative w-full rounded-lg overflow-hidden ${
          isHomePage
            ? "home-page-map-container border border-gray-300"
            : "h-[calc(100%-2rem)]"
        }`}
      >
        <MapContainer
          center={isHomePage ? homePageMapConfig.center : [52.0, 0.5]}
          zoom={isHomePage ? homePageMapConfig.zoom : 8}
          style={{ height: "100%", width: "100%" }}
          eventHandlers={
            isHomePage
              ? {
                  click: () => {
                    // Clear selection when clicking on the map background
                    if (onMarkerClick) {
                      onMarkerClick(null);
                    }
                  },
                }
              : {
                  click: (event) => {
                    const { lat, lng } = event.latlng;
                    const newMarker = {
                      id: markers.length + 1,
                      position: [lat, lng],
                      popupText: `Marker #${markers.length + 1}`,
                    };
                    setMarkers([...markers, newMarker]);
                  },
                }
          }
          whenCreated={(map) => {
            mapRef.current = map;
            // Set view only once on initial load for home page
            if (isHomePage) {
              // Use setView to ensure the map is centered at the specified coordinates with zoom level 8
              map.setView([52.3, 0.1], 8);

              // Auto-fit map to markers after initial view is set (if there are markers)
              if (markers.length > 0) {
                // Use a slight delay to ensure the initial view is set first
                setTimeout(() => {
                  const bounds = L.latLngBounds(
                    markers.map((marker) => marker.position)
                  );
                  map.fitBounds(bounds, {
                    padding: [
                      homePageMapConfig.padding,
                      homePageMapConfig.padding,
                    ],
                    maxZoom: 12,
                  });
                }, 50);
              }
            }
          }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            eventHandlers={{
              load: () => {},
              error: () => {},
            }}
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

export default CompactLeafletMap;
