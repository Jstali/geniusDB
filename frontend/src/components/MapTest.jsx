import React from "react";
import CompactLeafletMap from "./CompactLeafletMap";

const MapTest = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Map Test</h1>
      <div className="h-96">
        <CompactLeafletMap isHomePage={true} />
      </div>
    </div>
  );
};

export default MapTest;
