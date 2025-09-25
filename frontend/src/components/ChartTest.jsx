import React from "react";
import CustomChartBuilder from "./CustomChartBuilder";

const ChartTest = () => {
  // Sample data for testing
  const sampleData = [
    { name: "Product A", sales: 120, category: "Electronics", rating: 4.5 },
    { name: "Product B", sales: 85, category: "Clothing", rating: 3.8 },
    { name: "Product C", sales: 210, category: "Electronics", rating: 4.9 },
    { name: "Product D", sales: 65, category: "Home", rating: 4.2 },
    { name: "Product E", sales: 150, category: "Clothing", rating: 4.0 },
    { name: "Product F", sales: 95, category: "Home", rating: 3.5 },
    { name: "Product G", sales: 180, category: "Electronics", rating: 4.7 },
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Chart Builder Test</h1>
      <CustomChartBuilder data={sampleData} />
    </div>
  );
};

export default ChartTest;
