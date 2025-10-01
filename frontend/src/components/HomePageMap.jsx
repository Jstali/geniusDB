import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

// Utility function for marker color
function getMarkerColor(headroom) {
  if (headroom >= 50) {
    return "#008000"; // Green for 50MW and greater
  } else if (headroom >= 20) {
    return "#FFA500"; // Amber for 20MW to 50MW
  } else {
    return "#FF0000"; // Red for less than 20MW
  }
}

// Custom marker icon component with color coding
const createMarkerIcon = (color) =>
  L.divIcon({
    className: "custom-icon",
    html: `
      <div style="
        width: 24px; 
        height: 24px; 
        background-color: ${color};
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 0 5px rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 12px;
      ">
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });

// Define the focused region bounds for the substation cluster area
const FOCUSED_REGION_BOUNDS = [
  [51.3, -1.2], // Southwest corner [lat, lng]
  [52.3, 0.5], // Northeast corner [lat, lng]
];

const HomePageMap = ({
  substationData,
  onMarkerClick,
  selectedMarkerId,
  onTableRowSelect,
  tableData,
}) => {
  const [mapData, setMapData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMapInteractive, setIsMapInteractive] = useState(false);
  const [selectedSite, setSelectedSite] = useState(null);
  const [filters, setFilters] = useState({
    siteName: "",
    voltage: [],
    powerRange: { min: 0, max: 200 },
    operators: [],
  });
  const [voltageLevels, setVoltageLevels] = useState([]);
  const [operators, setOperators] = useState([]);
  const [summaryStats, setSummaryStats] = useState(null);
  const mapRef = useRef(null);
  const markerRefs = useRef({});

  // Extract unique voltage levels and operators from data
  useEffect(() => {
    if (substationData && substationData.length > 0) {
      const voltages = [
        ...new Set(
          substationData.map((item) => item.site_voltage).filter(Boolean)
        ),
      ].sort((a, b) => a - b);
      const ops = [
        ...new Set(
          substationData.map((item) => item.licence_area).filter(Boolean)
        ),
      ].sort();
      setVoltageLevels(voltages);
      setOperators(ops);
    }
  }, [substationData]);

  // Calculate summary statistics
  const calculateSummaryStats = useCallback((data) => {
    if (!data || data.length === 0) return null;

    const totalSubstations = data.length;
    const headroomValues = data
      .map((item) => item.generation_headroom)
      .filter((val) => val !== null && val !== undefined);

    const avgHeadroom =
      headroomValues.length > 0
        ? headroomValues.reduce((sum, val) => sum + val, 0) /
          headroomValues.length
        : null;

    const greenSites = data.filter(
      (item) => item.generation_headroom >= 50
    ).length;
    const amberSites = data.filter(
      (item) => item.generation_headroom >= 20 && item.generation_headroom < 50
    ).length;
    const redSites = data.filter(
      (item) => item.generation_headroom < 20
    ).length;

    return {
      totalSubstations,
      avgHeadroom,
      greenSites,
      amberSites,
      redSites,
    };
  }, []);

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

      // Add color information to each marker
      const dataWithColors = substationData.map((site) => ({
        ...site,
        color: getMarkerColor(site.generation_headroom),
      }));

      setMapData(dataWithColors);
      setSummaryStats(calculateSummaryStats(dataWithColors));
    } else {
      setMapData([]);
      setSummaryStats(null);
    }
    setLoading(false);
  }, [substationData]);

  const filteredMapData = useMemo(() => {
    return mapData.filter((site) => {
      // Site name filter
      if (
        filters.siteName &&
        !site.site_name?.toLowerCase().includes(filters.siteName.toLowerCase())
      )
        return false;

      // Voltage filter
      if (
        filters.voltage.length > 0 &&
        !filters.voltage.includes(site.site_voltage)
      )
        return false;

      // Power range filter
      if (
        site.generation_headroom !== null &&
        site.generation_headroom !== undefined
      ) {
        if (site.generation_headroom > filters.powerRange.max) return false;
      }

      // Operator filter
      if (
        filters.operators.length > 0 &&
        !filters.operators.includes(site.licence_area)
      )
        return false;

      return true;
    });
  }, [mapData, filters]);

  // Handle keyboard events for map interaction
  const handleKeyDown = useCallback((e) => {
    if (e.key === "Control" || e.key === "Meta") {
      setIsMapInteractive(true);
    }
  }, []);

  const handleKeyUp = useCallback((e) => {
    if (e.key === "Control" || e.key === "Meta") {
      setIsMapInteractive(false);
    }
  }, []);

  // Handle map initialization
  const handleMapLoad = useCallback((map) => {
    mapRef.current = map;
    map.setMinZoom(8); // Set minimum zoom level
    map.setMaxZoom(18); // Set maximum zoom level
  }, []);

  // Handle marker click events
  const handleMarkerClick = useCallback(
    (site) => {
      setSelectedSite(site);
      if (onMarkerClick) {
        onMarkerClick(site);
      }
    },
    [onMarkerClick]
  );

  // Add event listeners for keyboard interactions
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  // Filter handlers
  const handleSiteNameSearch = (siteName) => {
    setFilters((prev) => ({ ...prev, siteName }));
  };

  const handleVoltageFilter = (voltageLevel, isChecked) => {
    setFilters((prev) => ({
      ...prev,
      voltage: isChecked
        ? [...prev.voltage, voltageLevel]
        : prev.voltage.filter((v) => v !== voltageLevel),
    }));
  };

  const handlePowerRangeChange = (maxValue) => {
    setFilters((prev) => ({
      ...prev,
      powerRange: { ...prev.powerRange, max: maxValue },
    }));
  };

  const handleOperatorFilter = (operator, isChecked) => {
    setFilters((prev) => ({
      ...prev,
      operators: isChecked
        ? [...prev.operators, operator]
        : prev.operators.filter((o) => o !== operator),
    }));
  };

  if (loading) {
    return (
      <div className="grid grid-cols-6 gap-6 w-full px-6 min-h-[80vh]">
        <div className="col-span-1 flex flex-col bg-white rounded-xl shadow p-4 h-[600px] justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
        <div className="col-span-4 flex items-center justify-center">
          <div className="w-full h-[600px] rounded-lg shadow flex items-center justify-center bg-gray-100">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
        <div className="col-span-1 flex flex-col bg-white rounded-xl shadow p-4 h-[600px] justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid grid-cols-6 gap-6 w-full px-6 min-h-[80vh]">
        <div className="col-span-1 flex flex-col bg-white rounded-xl shadow p-4 h-[600px] justify-center items-center">
          <div className="text-red-500 font-medium">Filters Error: {error}</div>
        </div>
        <div className="col-span-4 flex items-center justify-center">
          <div className="w-full h-[600px] rounded-lg shadow flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <p className="text-red-500 font-medium">Map Error: {error}</p>
              <p className="text-sm text-gray-600 mt-2">
                Please check Map View page for full functionality.
              </p>
            </div>
          </div>
        </div>
        <div className="col-span-1 flex flex-col bg-white rounded-xl shadow p-4 h-[600px] justify-center items-center">
          <div className="text-red-500 font-medium">Details Error: {error}</div>
        </div>
      </div>
    );
  }

  // Fallback if no data
  if (!mapData || mapData.length === 0) {
    return (
      <div className="grid grid-cols-6 gap-6 w-full px-6 min-h-[80vh]">
        <div className="col-span-1 flex flex-col bg-white rounded-xl shadow p-4 h-[600px] justify-center items-center">
          <div className="text-gray-600 font-medium">No filter data</div>
        </div>
        <div className="col-span-4 flex items-center justify-center">
          <div className="w-full h-[600px] rounded-lg shadow flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <p className="text-gray-600 font-medium">
                No substation data available
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Please check Map View page for full map functionality.
              </p>
            </div>
          </div>
        </div>
        <div className="col-span-1 flex flex-col bg-white rounded-xl shadow p-4 h-[600px] justify-center items-center">
          <div className="text-gray-600 font-medium">No details data</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="grid grid-cols-6 gap-6 w-full px-6 min-h-[80vh]"
      style={{ zIndex: "1" }}
    >
      {/* Filters Panel */}
      <div className="col-span-1 flex flex-col bg-white rounded-xl shadow p-6 h-[600px] justify-between">
        <div className="space-y-6">
          <h2 className="font-bold text-xl">Filters</h2>

          {/* Site Name Filter */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Site Name
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter site name..."
              value={filters.siteName}
              onChange={(e) => handleSiteNameSearch(e.target.value)}
            />
          </div>

          {/* Voltage Level Filter */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Voltage Level
            </label>
            <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
              {voltageLevels.map((voltage) => (
                <label key={voltage} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    checked={filters.voltage.includes(voltage)}
                    onChange={(e) =>
                      handleVoltageFilter(voltage, e.target.checked)
                    }
                  />
                  <span className="text-sm text-gray-700">{voltage} kV</span>
                </label>
              ))}
            </div>
          </div>

          {/* Available Power Filter */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Available Power (MW)
            </label>
            <div className="px-2">
              <input
                type="range"
                min="0"
                max="200"
                step="1"
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                value={filters.powerRange.max}
                onChange={(e) =>
                  handlePowerRangeChange(parseInt(e.target.value))
                }
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0 MW</span>
                <span className="font-medium">
                  Show sites with ≤ {filters.powerRange.max} MW
                </span>
                <span>200 MW</span>
              </div>
            </div>
          </div>

          {/* Network Operator Filter */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Network Operator
            </label>
            <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
              {operators.map((operator) => (
                <label key={operator} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    checked={filters.operators.includes(operator)}
                    onChange={(e) =>
                      handleOperatorFilter(operator, e.target.checked)
                    }
                  />
                  <span className="text-sm text-gray-700">{operator}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        {/* User Info */}
        <div className="flex items-center gap-3 mt-8">
          <img
            src="https://randomuser.me/api/portraits/women/44.jpg"
            alt="Charlotte Davies"
            className="w-8 h-8 rounded-full"
          />
          <span className="text-sm font-medium">Charlotte Davies</span>
        </div>
      </div>
      {/* Map Container */}
      <div className="col-span-4 flex items-center justify-center">
        <div className="w-full h-[600px] rounded-lg shadow relative bg-white">
          <MapContainer
            center={[52.2053, 0.1218]}
            zoom={8}
            style={{
              height: "100%",
              width: "100%",
              borderRadius: "0.75rem",
              outline: isMapInteractive ? "2px solid #3b82f6" : "none",
            }}
            whenCreated={handleMapLoad}
            scrollWheelZoom={false}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {filteredMapData.map((site) =>
              site.position && site.position.length === 2 ? (
                <Marker
                  key={site.id}
                  position={[site.position[0], site.position[1]]}
                  icon={createMarkerIcon(site.color)}
                  ref={(ref) => {
                    markerRefs.current[site.id] = ref;
                  }}
                  eventHandlers={{ click: () => handleMarkerClick(site) }}
                >
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-bold text-lg mb-1">
                        {site.site_name}
                      </h3>
                      {site.generation_headroom !== null &&
                        site.generation_headroom !== undefined && (
                          <p className="text-sm mt-1">
                            <span className="font-medium">
                              Generation Headroom:
                            </span>{" "}
                            <span
                              className={
                                site.generation_headroom >= 50
                                  ? "text-green-600"
                                  : site.generation_headroom >= 20
                                  ? "text-orange-500"
                                  : "text-red-600"
                              }
                            >
                              {site.generation_headroom} MW
                            </span>
                          </p>
                        )}
                      <p className="text-sm mt-1">
                        <span className="font-medium">Voltage:</span>{" "}
                        {site.site_voltage} kV
                      </p>
                      <p className="text-sm mt-1">
                        <span className="font-medium">County:</span>{" "}
                        {site.county}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              ) : null
            )}
          </MapContainer>
          {/* Map Controls */}
          <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-10">
            <div className="bg-white rounded-lg shadow-md p-2">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-600 rounded-full mr-1"></div>
                <span className="text-xs">≥ 50MW</span>
              </div>
              <div className="flex items-center mt-1">
                <div className="w-3 h-3 bg-orange-500 rounded-full mr-1"></div>
                <span className="text-xs">20-50MW</span>
              </div>
              <div className="flex items-center mt-1">
                <div className="w-3 h-3 bg-red-600 rounded-full mr-1"></div>
                <span className="text-xs">&lt; 20MW</span>
              </div>
            </div>
          </div>
          {/* Map Interaction Indicator */}
          <div className="absolute bottom-4 left-4 bg-gray-800 bg-opacity-90 text-white px-3 py-2 rounded-lg text-sm z-10">
            {isMapInteractive
              ? "Interactive Mode (Ctrl/Cmd + Scroll to Zoom)"
              : "Scroll Mode (Click to Interact)"}
          </div>
        </div>
      </div>
      {/* Site Details Panel */}
      <div className="col-span-1 flex flex-col bg-white rounded-xl shadow p-6 h-[600px]">
        {selectedSite ? (
          <>
            <div className="space-y-6">
              {/* Header */}
              <div className="space-y-2">
                <h3 className="font-bold text-lg text-gray-900">
                  {selectedSite.site_name}
                </h3>
                <div className="text-xs text-gray-500 space-y-1">
                  <div>Created: by Charlotte Davies</div>
                  <div>Last updated: 2 months ago</div>
                </div>
              </div>

              {/* Point of Connection */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-700">
                  Point of Connection
                </h4>
                <div className="flex items-center gap-2 text-2xl font-bold">
                  <span>56</span>
                  <span className="text-base font-normal">M</span>
                  <span>⚡</span>
                </div>
                <div className="space-y-2">
                  <div className="flex gap-3 text-xs">
                    <span className="border-r pr-3 text-gray-600">
                      11kV Underground Cables
                    </span>
                    <span className="text-gray-700">Available</span>
                  </div>
                  <div className="flex gap-3 text-xs">
                    <span className="border-r pr-3 text-gray-600">
                      11kV Underground Cables
                    </span>
                    <span className="text-gray-700">Available</span>
                  </div>
                </div>
              </div>

              {/* Available Power */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-700">Available Power</h4>
                <div className="space-y-2">
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <div className="text-xs text-gray-500 mb-1">
                      Direct (11kV):
                    </div>
                    <div className="text-2xl font-bold text-yellow-600">
                      3.6 MVA
                    </div>
                    <div className="text-xs text-blue-600 cursor-pointer mt-2">
                      Show detail &gt;
                    </div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="text-xs text-gray-500 mb-1">
                      Upstream (33kV):
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      22.7 MVA
                    </div>
                    <div className="text-xs text-blue-600 cursor-pointer mt-2">
                      Show detail &gt;
                    </div>
                  </div>
                </div>
              </div>

              {/* Future Outlook */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-700">Future Outlook</h4>
                <div className="flex gap-6">
                  <div className="space-y-1">
                    <div className="text-xs text-gray-500">Live offers</div>
                    <div className="text-lg font-bold">1.4 MVA</div>
                    <div className="text-xs text-gray-500 space-y-0.5">
                      <div>39% of headroom</div>
                      <div>8 applications</div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-gray-500">Accepted offers</div>
                    <div className="text-lg font-bold">2.9 MVA</div>
                    <div className="text-xs text-gray-500 space-y-0.5">
                      <div>81% of headroom</div>
                      <div>5 applications</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 text-xs text-gray-600">
                  <div>
                    Demand at this primary substation is expected to increase by
                    33% over the next 5 years.
                  </div>
                  <div>Peak demand will exceed firm capacity by 2027.</div>
                  <div>
                    The 33kV circuit is being replaced will increase the
                    capacity by 17.5 MVA.
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col justify-between h-full">
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-lg text-gray-900">
                  Site Details
                </h3>
                <div className="text-gray-500 text-sm mt-2">
                  Select a marker on the map to view details
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text bg-gray-800">
                  Summary Statistics
                </h4>
                {summaryStats && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                      <span className="text-sm text-gray-600">
                        Total Substations:
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        {summaryStats.totalSubstations}
                      </span>
                    </div>

                    <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                      <span className="text-sm text-gray-600">
                        Avg. Headroom:
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        {summaryStats.avgHeadroom?.toFixed(2) || "N/A"} MW
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-2 rounded-lg bg-green-50">
                        <span className="text-sm text-gray-600">
                          Green Sites (≥50MW):
                        </span>
                        <span className="text-sm font-semibold text-green-700">
                          {summaryStats.greenSites || 0}
                        </span>
                      </div>

                      <div className="flex justify-between items-center p-2 rounded-lg bg-orange-50">
                        <span className="text-sm text-gray-600">
                          Amber Sites (20-50MW):
                        </span>
                        <span className="text-sm font-semibold text-orange-700">
                          {summaryStats.amberSites || 0}
                        </span>
                      </div>

                      <div className="flex justify-between items-center p-2 rounded-lg bg-red-50">
                        <span className="text-sm text-gray-600">
                          Red Sites (&lt;20MW):
                        </span>
                        <span className="text-sm font-semibold text-red-700">
                          {summaryStats.redSites || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePageMap;
