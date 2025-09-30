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

const MapSection = ({ data = [], filters = {}, onMarkerClick }) => {
  const [markers, setMarkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const mapRef = useRef(null);

  // Apply filters to the data
  const filteredData = useMemo(() => {
    if (!data || data.length === 0) {
      return [];
    }

    return data.filter((site) => {
      // Site name filter
      if (filters.siteName && filters.siteName.trim() !== "") {
        const siteName = site["Site Name"] || "";
        if (!siteName.toLowerCase().includes(filters.siteName.toLowerCase())) {
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
        if (headroom !== undefined && headroom !== null && !isNaN(headroom)) {
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
  }, [data, filters]);

  useEffect(() => {
    const processMapData = () => {
      try {
        setLoading(true);
        console.log("Processing map data with filters...", {
          filters,
          dataLength: data.length,
          filteredDataLength: filteredData.length,
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
        console.log("Markers set:", transformedMarkers.length);

        // Auto-fit map to markers
        if (mapRef.current && transformedMarkers.length > 0) {
          const bounds = L.latLngBounds(
            transformedMarkers.map((marker) => marker.position)
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
        console.error("Error processing map data:", err);
        setError("Failed to process map data");
      } finally {
        setLoading(false);
      }
    };

    processMapData();
  }, [filteredData]);

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
