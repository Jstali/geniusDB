import React, { useState, useEffect } from "react";
import {
  VictoryChart,
  VictoryLine,
  VictoryBar,
  VictoryPie,
  VictoryTheme,
  VictoryAxis,
  VictoryContainer,
  VictoryScatter,
} from "victory";

const VictoryCharts = () => {
  const [aggregatedData, setAggregatedData] = useState(null);
  const [calculatedData, setCalculatedData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch aggregated data
        const aggregatedResponse = await fetch(
          "http://localhost:8000/data/aggregated"
        );
        if (!aggregatedResponse.ok) {
          throw new Error(`HTTP error! status: ${aggregatedResponse.status}`);
        }
        const aggregatedJson = await aggregatedResponse.json();

        // Fetch calculated data
        const calculatedResponse = await fetch(
          "http://localhost:8000/data/calculated"
        );
        if (!calculatedResponse.ok) {
          throw new Error(`HTTP error! status: ${calculatedResponse.status}`);
        }
        const calculatedJson = await calculatedResponse.json();

        setAggregatedData(aggregatedJson);
        setCalculatedData(calculatedJson);
      } catch (err) {
        setError("Failed to fetch data from backend");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Sample data for Line Chart based on real data
  const lineData = calculatedData
    ? Object.keys(calculatedData)
        .slice(0, 7)
        .map((key, index) => ({
          x: index + 1,
          y: index * 2 + Math.random() * 3,
          label: key,
        }))
    : [
        { x: 1, y: 2 },
        { x: 2, y: 3 },
        { x: 3, y: 5 },
        { x: 4, y: 4 },
        { x: 5, y: 7 },
        { x: 6, y: 6 },
        { x: 7, y: 9 },
      ];

  // Sample data for Bar Chart based on real data
  const barData = aggregatedData
    ? Object.keys(aggregatedData)
        .slice(0, 5)
        .map((key, index) => ({
          x: key,
          y: (index + 1) * 10 + Math.random() * 20,
        }))
    : [
        { x: "ECR > 1MW", y: 35 },
        { x: "ECR < 1MW", y: 45 },
        { x: "Connected", y: 20 },
        { x: "Accepted", y: 55 },
        { x: "Capacity", y: 30 },
      ];

  // Sample data for Pie Chart based on real data
  const pieData = calculatedData
    ? Object.keys(calculatedData)
        .slice(0, 4)
        .map((key, index) => ({
          x: key,
          y: (index + 1) * 25,
        }))
    : [
        { x: "Spare Summer", y: 35 },
        { x: "Spare Winter", y: 25 },
        { x: "Generation", y: 20 },
        { x: "Firm Cap", y: 20 },
      ];

  // Custom color scale for charts
  const colorScale = ["#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#feca57"];

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Victory Charts
        </h2>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Victory Charts
        </h2>
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

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Data Visualizations
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Line Chart */}
        <div className="bg-gray-50 p-4 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4 text-center text-gray-700">
            Calculated Metrics
          </h3>
          <VictoryChart
            theme={VictoryTheme.material}
            height={300}
            width={400}
            containerComponent={<VictoryContainer responsive={true} />}
            animate={{
              duration: 1000,
              onLoad: { duration: 500 },
            }}
          >
            <VictoryAxis
              label="Metrics"
              style={{
                axisLabel: { padding: 30 },
                tickLabels: { angle: 45, fontSize: 8 },
              }}
            />
            <VictoryAxis
              dependentAxis
              label="Values"
              style={{
                axisLabel: { padding: 35 },
              }}
            />
            <VictoryLine
              data={lineData}
              style={{
                data: {
                  stroke: "#ff6b6b",
                  strokeWidth: 3,
                },
              }}
              animate={{
                duration: 1000,
                onLoad: { duration: 500 },
              }}
            />
            <VictoryScatter
              data={lineData}
              style={{
                data: {
                  fill: "#ff6b6b",
                  stroke: "#fff",
                  strokeWidth: 2,
                  size: 5,
                },
              }}
              animate={{
                duration: 1000,
                onLoad: { duration: 500 },
              }}
            />
          </VictoryChart>
        </div>

        {/* Bar Chart */}
        <div className="bg-gray-50 p-4 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4 text-center text-gray-700">
            Aggregated Data
          </h3>
          <VictoryChart
            theme={VictoryTheme.material}
            height={300}
            width={400}
            containerComponent={<VictoryContainer responsive={true} />}
            animate={{
              duration: 1000,
              onLoad: { duration: 500 },
            }}
          >
            <VictoryAxis
              label="Categories"
              style={{
                axisLabel: { padding: 30 },
              }}
            />
            <VictoryAxis
              dependentAxis
              label="Values"
              style={{
                axisLabel: { padding: 35 },
              }}
            />
            <VictoryBar
              data={barData}
              style={{
                data: {
                  fill: ({ datum }) =>
                    colorScale[barData.indexOf(datum) % colorScale.length],
                  stroke: "#fff",
                  strokeWidth: 1,
                },
              }}
              barWidth={20}
              animate={{
                duration: 1000,
                onLoad: { duration: 500 },
              }}
            />
          </VictoryChart>
        </div>

        {/* Pie Chart */}
        <div className="bg-gray-50 p-4 rounded-lg shadow md:col-span-2 lg:col-span-1">
          <h3 className="text-xl font-semibold mb-4 text-center text-gray-700">
            Calculated Formulas
          </h3>
          <div className="flex justify-center">
            <VictoryPie
              data={pieData}
              colorScale={colorScale}
              labels={({ datum }) => `${datum.x}: ${datum.y}%`}
              labelRadius={80}
              style={{
                labels: {
                  fontSize: 12,
                  fill: "#fff",
                  fontWeight: "bold",
                },
              }}
              animate={{
                duration: 1000,
                onLoad: { duration: 500 },
              }}
              height={300}
              width={400}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VictoryCharts;
