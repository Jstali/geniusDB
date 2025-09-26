// Test script to verify data format transformation
const sampleBackendData = [
  {
    id: 0,
    position: [52.0685789944063, 0.605358966326239],
    site_name: "BELCHAMP GRID 132/33kV",
    site_type: "Grid Substation",
    site_voltage: 132,
    county: "Suffolk",
    generation_headroom: -211.39,
    popup_text: "BELCHAMP GRID 132/33kV (Grid Substation)",
  },
  {
    id: 1,
    position: [52.3727260812354, 1.10555170588195],
    site_name: "DISS GRID 132/33kV",
    site_type: "Grid Substation",
    site_voltage: 132,
    county: "Norfolk",
    generation_headroom: -102.92,
    popup_text: "DISS GRID 132/33kV (Grid Substation)",
  },
];

// Transform backend data to match HomePageMap expected format
const transformedData = sampleBackendData.map((site) => ({
  id: site.id,
  position: site.position,
  popupText: site.popup_text,
}));

console.log("Transformed data:", JSON.stringify(transformedData, null, 2));
