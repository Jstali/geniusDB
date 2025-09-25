import React, { useEffect, useRef, useState } from "react";
import * as echarts from "echarts/core";
import { Bar3DChart, Scatter3DChart } from "echarts-gl/charts";
import { Grid3DComponent } from "echarts-gl/components";
import { CanvasRenderer } from "echarts/renderers";
import { TooltipComponent, VisualMapComponent } from "echarts/components";

// Register the required components
echarts.use([
  Bar3DChart,
  Scatter3DChart,
  Grid3DComponent,
  CanvasRenderer,
  TooltipComponent,
  VisualMapComponent,
]);

const Chart3D = () => {
  const chartRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAndRenderChart = async () => {
      try {
        setLoading(true);
        // In a real implementation, you would fetch from: http://127.0.0.1:8000/grid-data
        // For now, we'll use sample data
        const sampleData = [
          [10, 20, 30],
          [20, 30, 40],
          [30, 40, 50],
          [40, 50, 60],
          [50, 60, 70],
          [60, 70, 80],
          [70, 80, 90],
          [80, 90, 100],
          [90, 100, 110],
          [100, 110, 120],
        ];

        if (chartRef.current) {
          const chart = echarts.init(chartRef.current);

          const option = {
            tooltip: {},
            visualMap: {
              show: true,
              dimension: 2,
              min: 0,
              max: 120,
              inRange: {
                color: [
                  "#313695",
                  "#4575b4",
                  "#74add1",
                  "#abd9e9",
                  "#e0f3f8",
                  "#ffffbf",
                  "#fee090",
                  "#fdae61",
                  "#f46d43",
                  "#d73027",
                  "#a50026",
                ],
              },
            },
            xAxis3D: {
              type: "value",
            },
            yAxis3D: {
              type: "value",
            },
            zAxis3D: {
              type: "value",
            },
            grid3D: {
              viewControl: {
                projection: "orthographic",
              },
            },
            series: [
              {
                type: "scatter3D",
                symbolSize: 10,
                data: sampleData,
              },
            ],
          };

          chart.setOption(option);

          // Handle window resize
          const handleResize = () => chart.resize();
          window.addEventListener("resize", handleResize);

          // Cleanup
          return () => {
            window.removeEventListener("resize", handleResize);
            chart.dispose();
          };
        }
      } catch (err) {
        setError("Failed to load chart data");
        console.error("Error fetching chart data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAndRenderChart();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 h-full">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        3D Scatter Chart
      </h2>
      <p className="text-gray-600 mb-4">
        Interactive 3D visualization of data points
      </p>

      {loading && (
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Error! </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div
        ref={chartRef}
        className={`w-full ${loading || error ? "hidden" : "block"}`}
        style={{ height: "500px" }}
      />

      <div className="mt-4 text-sm text-gray-500">
        <p>Data visualization using ECharts 3D scatter plot</p>
      </div>
    </div>
  );
};

export default Chart3D;
