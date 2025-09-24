import React from "react";
import LeafletMap from "./LeafletMap";

const MapViewComponent = () => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 h-full">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Map View</h2>
      <p className="text-gray-600 mb-4">Interactive map using React Leaflet</p>
      <LeafletMap />
    </div>
  );
};

export default MapViewComponent;
