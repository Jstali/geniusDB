import React, { useState, useCallback } from "react";
import Map from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const InteractiveMap = () => {
  const [viewport, setViewport] = useState({
    latitude: 37.7749,
    longitude: -122.4194,
    zoom: 10,
  });

  const [marker, setMarker] = useState({
    latitude: 37.7749,
    longitude: -122.4194,
  });

  const [showPopup, setShowPopup] = useState(false);
  const [mapStyle, setMapStyle] = useState(
    "mapbox://styles/mapbox/streets-v12"
  );

  const handleMapClick = useCallback((event) => {
    const { lngLat } = event;
    setMarker({
      latitude: lngLat.lat,
      longitude: lngLat.lng,
    });
    setShowPopup(true);
  }, []);

  const handleMarkerClick = useCallback((event) => {
    event.originalEvent.stopPropagation();
    setShowPopup(true);
  }, []);

  const handleStyleChange = (style) => {
    setMapStyle(`mapbox://styles/mapbox/${style}`);
  };

  // Get the Mapbox token from environment variables
  const mapboxToken =
    import.meta.env.VITE_MAPBOX_TOKEN || import.meta.env.REACT_APP_MAPBOX_TOKEN;

  return (
    <div className="w-full h-screen relative">
      <div className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-lg p-4">
        <h3 className="font-bold mb-2">Map Styles</h3>
        <div className="flex flex-col space-y-2">
          <button
            className={`px-3 py-1 rounded text-sm ${
              mapStyle.includes("streets")
                ? "bg-blue-500 text-white"
                : "bg-gray-200"
            }`}
            onClick={() => handleStyleChange("streets-v12")}
          >
            Streets
          </button>
          <button
            className={`px-3 py-1 rounded text-sm ${
              mapStyle.includes("light")
                ? "bg-blue-500 text-white"
                : "bg-gray-200"
            }`}
            onClick={() => handleStyleChange("light-v11")}
          >
            Light
          </button>
          <button
            className={`px-3 py-1 rounded text-sm ${
              mapStyle.includes("dark")
                ? "bg-blue-500 text-white"
                : "bg-gray-200"
            }`}
            onClick={() => handleStyleChange("dark-v11")}
          >
            Dark
          </button>
          <button
            className={`px-3 py-1 rounded text-sm ${
              mapStyle.includes("satellite")
                ? "bg-blue-500 text-white"
                : "bg-gray-200"
            }`}
            onClick={() => handleStyleChange("satellite-streets-v12")}
          >
            Satellite
          </button>
        </div>
      </div>

      {mapboxToken ? (
        <Map
          initialViewState={viewport}
          onMove={(evt) => setViewport(evt.viewState)}
          onClick={handleMapClick}
          mapStyle={mapStyle}
          mapboxAccessToken={mapboxToken}
          style={{ width: "100%", height: "100%" }}
        >
          {/* Marker */}
          <div
            className="cursor-pointer"
            style={{
              position: "absolute",
              transform: "translate(-50%, -100%)",
            }}
            onClick={handleMarkerClick}
          >
            <svg
              width="30"
              height="30"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z"
                fill="#FF0000"
              />
            </svg>
          </div>

          {showPopup && (
            <div
              style={{
                position: "absolute",
                transform: "translate(-50%, -120%)",
                backgroundColor: "white",
                padding: "10px",
                borderRadius: "4px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                zIndex: 1000,
                minWidth: "150px",
              }}
            >
              <div className="font-bold">San Francisco</div>
              <div className="text-sm">
                Latitude: {marker.latitude.toFixed(4)}
              </div>
              <div className="text-sm">
                Longitude: {marker.longitude.toFixed(4)}
              </div>
              <button
                className="mt-2 text-xs text-blue-500"
                onClick={() => setShowPopup(false)}
              >
                Close
              </button>
            </div>
          )}
        </Map>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-100">
          <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
            <h3 className="text-xl font-bold mb-2">Mapbox Token Missing</h3>
            <p className="mb-4">
              Please add your Mapbox access token to the .env file:
            </p>
            <code className="block bg-gray-200 p-2 rounded text-sm mb-4">
              VITE_MAPBOX_TOKEN=your-mapbox-access-token-here
            </code>
            <p className="text-sm text-gray-600">
              Get your token from{" "}
              <a
                href="https://account.mapbox.com/access-tokens/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline"
              >
                Mapbox Account
              </a>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractiveMap;
