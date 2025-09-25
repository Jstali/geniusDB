import React, { useState } from "react";
import { Map, Marker, ZoomControl, Overlay } from "pigeon-maps";

const PigeonMap = () => {
  const [center, setCenter] = useState([37.7749, -122.4194]);
  const [zoom, setZoom] = useState(11);
  const [markers, setMarkers] = useState([
    { id: 1, anchor: [37.7749, -122.4194], title: "San Francisco" },
  ]);
  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayAnchor, setOverlayAnchor] = useState([37.7749, -122.4194]);

  const handleMapClick = (event) => {
    const { latLng } = event;
    const newMarker = {
      id: markers.length + 1,
      anchor: [latLng.lat, latLng.lng],
      title: `Marker ${markers.length + 1}`,
    };
    setMarkers([...markers, newMarker]);
  };

  const handleMarkerClick = (marker) => {
    console.log("Marker clicked:", marker);
    setOverlayAnchor(marker.anchor);
    setShowOverlay(true);
  };

  const handleOverlayClose = () => {
    setShowOverlay(false);
  };

  return (
    <div className="w-full h-full">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          Interactive Pigeon Map
        </h2>
        <p className="text-gray-600 mb-4">
          Click anywhere on the map to add a new marker
        </p>

        <div className="relative w-full h-[500px] rounded-lg overflow-hidden border border-gray-300">
          <Map
            center={center}
            zoom={zoom}
            onBoundsChanged={({ center, zoom }) => {
              setCenter(center);
              setZoom(zoom);
            }}
            onClick={handleMapClick}
            animate={true}
          >
            <ZoomControl />

            {/* Default marker at San Francisco center */}
            <Marker
              anchor={[37.7749, -122.4194]}
              payload={1}
              onClick={() => handleMarkerClick(markers[0])}
            />

            {/* Custom markers */}
            {markers.map((marker) => (
              <Marker
                key={marker.id}
                anchor={marker.anchor}
                payload={marker.id}
                onClick={() => handleMarkerClick(marker)}
              />
            ))}

            {/* Custom HTML marker using Overlay */}
            <Overlay anchor={[37.7749, -122.4194]} offset={[15, 30]}>
              <div
                className="cursor-pointer"
                onClick={() => handleMarkerClick(markers[0])}
              >
                <div className="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors">
                  📍
                </div>
              </div>
            </Overlay>

            {/* Optional overlay for displaying information */}
            {showOverlay && (
              <Overlay anchor={overlayAnchor} offset={[0, -20]}>
                <div className="bg-white p-3 rounded-lg shadow-xl border border-gray-200 min-w-[200px]">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-gray-800">Location Info</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Lat: {overlayAnchor[0].toFixed(4)}
                      </p>
                      <p className="text-sm text-gray-600">
                        Lng: {overlayAnchor[1].toFixed(4)}
                      </p>
                    </div>
                    <button
                      onClick={handleOverlayClose}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    Click on the map to add more markers
                  </div>
                </div>
              </Overlay>
            )}
          </Map>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <div className="bg-blue-50 px-3 py-2 rounded-lg">
            <span className="text-sm font-medium text-blue-800">Center:</span>
            <span className="text-sm text-blue-600 ml-2">
              {center[0].toFixed(4)}, {center[1].toFixed(4)}
            </span>
          </div>
          <div className="bg-green-50 px-3 py-2 rounded-lg">
            <span className="text-sm font-medium text-green-800">Zoom:</span>
            <span className="text-sm text-green-600 ml-2">{zoom}</span>
          </div>
          <div className="bg-purple-50 px-3 py-2 rounded-lg">
            <span className="text-sm font-medium text-purple-800">
              Markers:
            </span>
            <span className="text-sm text-purple-600 ml-2">
              {markers.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PigeonMap;
