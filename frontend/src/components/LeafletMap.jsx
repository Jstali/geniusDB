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

const LeafletMap = () => {
  const [markers, setMarkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMapData = async () => {
      try {
        setLoading(true);
        // Fetch real map data from the backend API
        const response = await fetch("http://localhost:8000/data/map");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const mapData = await response.json();

        // Transform the data into the format expected by the map component
        const transformedMarkers = mapData.map((site) => ({
          id: site.id,
          position: site.position,
          popupText: site.popup_text,
          siteName: site.site_name,
          siteType: site.site_type,
          siteVoltage: site.site_voltage,
          county: site.county,
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
          },
          {
            id: 2,
            position: [52.3727, 1.1056],
            popupText: "Diss Grid Substation",
          },
          {
            id: 3,
            position: [51.8259, 1.1794],
            popupText: "Clacton Grid Substation",
          },
          {
            id: 4,
            position: [51.8779, 0.9301],
            popupText: "Colchester Grid Substation",
          },
          {
            id: 5,
            position: [51.716, 0.5185],
            popupText: "Chelmsford East Grid Substation",
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

  return (
    <div className="w-full h-full">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          Grid Substations Map
        </h2>
        <p className="text-gray-600 mb-4">
          Locations of electrical grid substations
        </p>

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
              <Marker key={marker.id} position={marker.position}>
                <Popup>
                  <div className="p-2">
                    <h3 className="font-bold text-lg mb-1">
                      {marker.popupText}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Lat: {marker.position[0].toFixed(4)}, Lng:{" "}
                      {marker.position[1].toFixed(4)}
                    </p>
                    <p className="text-xs mt-2 text-gray-500">
                      Click anywhere else to add more markers
                    </p>
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
