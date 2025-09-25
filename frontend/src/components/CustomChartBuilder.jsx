import React, { useState, useMemo, useEffect } from "react";
import Plot from "react-plotly.js";

const CustomChartBuilder = ({ data, columns }) => {
  const [chartType, setChartType] = useState("bar");
  const [xAxis, setXAxis] = useState("");
  const [yAxis, setYAxis] = useState("");
  const [generatedChart, setGeneratedChart] = useState(null);
  const [error, setError] = useState("");
  const [presetChart, setPresetChart] = useState(""); // For predefined charts
  const [chartData, setChartData] = useState(data || []); // Local data state
  const [chartColumns, setChartColumns] = useState(columns || []); // Local columns state
  const [loading, setLoading] = useState(false); // Loading state for data fetching

  // Fetch data from the database when component mounts and no data is provided
  useEffect(() => {
    console.log("CustomChartBuilder: useEffect triggered");
    // Only fetch data if none was provided via props or if provided data is empty
    if (!data || data.length === 0) {
      console.log(
        "CustomChartBuilder: No data provided or empty data, fetching from database"
      );
      fetchData();
    } else if (data && data.length > 0) {
      // Use provided data
      console.log("CustomChartBuilder: Using provided data");
      setChartData(data);
      // Generate columns from the provided data if columns aren't provided
      if (!columns || columns.length === 0) {
        const generatedColumns = Object.keys(data[0]).map((key) => ({
          accessorKey: key,
          header: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " "),
        }));
        console.log(
          "CustomChartBuilder: Generated columns from data:",
          generatedColumns
        );
        setChartColumns(generatedColumns);
      } else {
        setChartColumns(columns || []);
      }
    }
  }, [data, columns]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      console.log("CustomChartBuilder: Starting data fetch from database...");

      // First, trigger the data processing script
      const processResponse = await fetch(
        "http://localhost:8000/process/transformers"
      );
      console.log(
        "CustomChartBuilder: Process response status:",
        processResponse.status
      );
      if (!processResponse.ok) {
        throw new Error(
          `HTTP error while processing data! status: ${processResponse.status}`
        );
      }
      const processResult = await processResponse.json();
      console.log("CustomChartBuilder: Process result:", processResult);
      if (processResult.status === "error") {
        throw new Error(processResult.message);
      }

      // Then fetch the transformer data from the backend API
      const response = await fetch("http://localhost:8000/data/transformers");
      console.log("CustomChartBuilder: Data response status:", response.status);
      if (!response.ok) {
        throw new Error(
          `HTTP error while fetching data! status: ${response.status}`
        );
      }
      const jsonData = await response.json();
      console.log("CustomChartBuilder: Received data:", jsonData);

      // Set the transformer data directly
      setChartData(jsonData);

      // Generate columns from the data
      if (jsonData && jsonData.length > 0) {
        const generatedColumns = Object.keys(jsonData[0]).map((key) => ({
          accessorKey: key,
          header: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " "),
        }));
        console.log("CustomChartBuilder: Generated columns:", generatedColumns);
        setChartColumns(generatedColumns);
      }

      console.log("CustomChartBuilder: Data fetch completed successfully");
    } catch (err) {
      setError("Failed to fetch data from database: " + err.message);
      console.error("CustomChartBuilder: Error fetching data:", err);
    } finally {
      setLoading(false);
      console.log("CustomChartBuilder: Loading state set to false");
    }
  };

  // Debug: Log the data and columns
  React.useEffect(() => {
    console.log("=== CustomChartBuilder Debug Info ===");
    console.log("Props data:", data);
    console.log("Props columns:", columns);
    console.log("Local chartData:", chartData);
    console.log("Local chartColumns:", chartColumns);
    console.log("Data length:", chartData ? chartData.length : "No data");
    console.log(
      "Columns length:",
      chartColumns ? chartColumns.length : "No columns"
    );
    console.log("Preset chart selected:", presetChart);

    // Log first few items of data if available
    if (chartData && chartData.length > 0) {
      console.log("First data item:", chartData[0]);
      console.log("Data keys:", Object.keys(chartData[0]));
    }

    // Log first few columns if available
    if (chartColumns && chartColumns.length > 0) {
      console.log("First column:", chartColumns[0]);
      console.log("All columns:", chartColumns);
    }

    console.log("=====================================");
  }, [data, columns, chartData, chartColumns, presetChart]);

  // Get column options from chartColumns state or derive from chartData
  const columnOptions = useMemo(() => {
    console.log("=== Column Options Generation ===");
    console.log("chartColumns:", chartColumns);
    console.log("chartData:", chartData);

    // Always use chartColumns if available, otherwise derive from chartData
    if (chartColumns && chartColumns.length > 0) {
      console.log("Using chartColumns");
      const result = chartColumns.map((col) => ({
        accessorKey: col.accessorKey,
        header: col.header,
      }));
      console.log("Generated column options:", result);
      console.log("===============================");
      return result;
    } else if (chartData && chartData.length > 0) {
      // Fallback to deriving from data keys
      console.log("Deriving columns from chartData keys");
      const result = Object.keys(chartData[0]).map((key) => ({
        accessorKey: key,
        header: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " "),
      }));
      console.log("Derived column options:", result);
      console.log("===============================");
      return result;
    }
    console.log("No columns or data available");
    console.log("===============================");
    return [];
  }, [chartData, chartColumns]);

  // Filter column options for X axis (exclude selected Y axis)
  const xColumnOptions = useMemo(() => {
    console.log("=== X Column Options ===");
    console.log("yAxis:", yAxis);
    console.log("columnOptions:", columnOptions);
    if (!yAxis) {
      console.log("No yAxis selected, returning all column options");
      console.log("========================");
      return columnOptions;
    }
    const result = columnOptions.filter((col) => col.accessorKey !== yAxis);
    console.log("Filtered xColumnOptions:", result);
    console.log("========================");
    return result;
  }, [columnOptions, yAxis]);

  // Filter column options for Y axis (exclude selected X axis)
  const yColumnOptions = useMemo(() => {
    console.log("=== Y Column Options ===");
    console.log("xAxis:", xAxis);
    console.log("columnOptions:", columnOptions);
    if (!xAxis) {
      console.log("No xAxis selected, returning all column options");
      console.log("========================");
      return columnOptions;
    }
    const result = columnOptions.filter((col) => col.accessorKey !== xAxis);
    console.log("Filtered yColumnOptions:", result);
    console.log("========================");
    return result;
  }, [columnOptions, xAxis]);

  // Predefined chart configurations
  const presetCharts = [
    {
      id: "top_sites_generation",
      name: "Top 10 Sites by Generation Capacity",
      type: "bar",
      xAxis: "", // Will be determined based on data
      yAxis: "", // Will be determined based on data
      description: "Bar chart showing top 10 sites by generation capacity",
    },
    {
      id: "top_sites_ecr",
      name: "Top 10 Sites by Total ECR Capacity",
      type: "bar",
      xAxis: "", // Will be determined based on data
      yAxis: "", // Will be determined based on data
      description: "Bar chart showing top 10 sites by total ECR capacity",
    },
    {
      id: "risk_level_distribution",
      name: "Risk Level Distribution",
      type: "pie",
      xAxis: "", // Will be determined based on data
      yAxis: "", // Will be determined based on data
      description: "Pie chart showing distribution of risk levels",
    },
    {
      id: "site_type_distribution",
      name: "Site Type Distribution",
      type: "pie",
      xAxis: "", // Will be determined based on data
      yAxis: "", // Will be determined based on data
      description: "Pie chart showing distribution of site types",
    },
  ];

  // Handle chart generation
  const generateChart = () => {
    console.log("=== Generate Chart Called ===");
    console.log("Preset chart:", presetChart);
    console.log("Chart type:", chartType);
    console.log("X axis:", xAxis);
    console.log("Y axis:", yAxis);
    console.log("Data:", chartData);

    // Validation
    if (!chartData || chartData.length === 0) {
      setError("No data available to chart");
      console.log("Error: No data available");
      console.log("=========================");
      return;
    }

    // Handle preset charts
    if (presetChart) {
      const preset = presetCharts.find((chart) => chart.id === presetChart);
      if (preset) {
        console.log("Generating preset chart:", preset);
        generatePresetChart(preset);
        return;
      }
    }

    // Handle custom charts
    if (!xAxis) {
      setError("Please select an X axis");
      console.log("Error: No X axis selected");
      console.log("=========================");
      return;
    }

    if (!yAxis && chartType !== "pie") {
      setError("Please select a Y axis");
      console.log("Error: No Y axis selected for non-pie chart");
      console.log("=========================");
      return;
    }

    if (chartType === "pie" && !xAxis) {
      setError("Please select a category for pie chart");
      console.log("Error: No category selected for pie chart");
      console.log("=========================");
      return;
    }

    setError("");

    // Find the actual keys for the selected headers
    const xColumn = columnOptions.find((col) => col.accessorKey === xAxis);
    const yColumn = columnOptions.find((col) => col.accessorKey === yAxis);

    const xKey = xColumn ? xColumn.accessorKey : xAxis;
    const yKey = yColumn ? yColumn.accessorKey : yAxis;

    console.log("X key:", xKey);
    console.log("Y key:", yKey);

    // Prepare data for plotting
    let xValues = chartData.map((item) => item[xKey]);
    let yValues =
      chartType !== "pie" ? chartData.map((item) => item[yKey]) : null;

    console.log("X values:", xValues);
    console.log("Y values:", yValues);

    // Convert to numbers where possible
    if (yValues) {
      yValues = yValues.map((val) => {
        const num = parseFloat(val);
        return isNaN(num) ? val : num;
      });
      console.log("Converted Y values:", yValues);
    }

    // Create chart configuration
    let chartConfig = {};

    switch (chartType) {
      case "bar":
        chartConfig = {
          data: [
            {
              x: xValues,
              y: yValues,
              type: "bar",
              marker: { color: "#4f46e5" },
            },
          ],
          layout: {
            title: `${yColumn?.header || yAxis} by ${xColumn?.header || xAxis}`,
            xaxis: { title: xColumn?.header || xAxis },
            yaxis: { title: yColumn?.header || yAxis },
          },
        };
        break;

      case "line":
        chartConfig = {
          data: [
            {
              x: xValues,
              y: yValues,
              type: "scatter",
              mode: "lines+markers",
              marker: { color: "#10b981" },
              line: { color: "#10b981" },
            },
          ],
          layout: {
            title: `${yColumn?.header || yAxis} by ${xColumn?.header || xAxis}`,
            xaxis: { title: xColumn?.header || xAxis },
            yaxis: { title: yColumn?.header || yAxis },
          },
        };
        break;

      case "scatter":
        chartConfig = {
          data: [
            {
              x: xValues,
              y: yValues,
              type: "scatter",
              mode: "markers",
              marker: {
                color: "#8b5cf6",
                size: 8,
              },
            },
          ],
          layout: {
            title: `${yColumn?.header || yAxis} by ${xColumn?.header || xAxis}`,
            xaxis: { title: xColumn?.header || xAxis },
            yaxis: { title: yColumn?.header || yAxis },
          },
        };
        break;

      case "pie":
        // For pie charts, we need to aggregate data by unique x values
        const aggregatedData = {};
        xValues.forEach((x, i) => {
          if (!aggregatedData[x]) {
            aggregatedData[x] = 0;
          }
          // Try to convert to number if possible, otherwise count occurrences
          const yVal = chartData[i][yKey];
          if (yVal !== undefined && yVal !== null) {
            const num = parseFloat(yVal);
            if (!isNaN(num)) {
              aggregatedData[x] += num;
            } else {
              aggregatedData[x] += 1;
            }
          } else {
            aggregatedData[x] += 1;
          }
        });

        chartConfig = {
          data: [
            {
              labels: Object.keys(aggregatedData),
              values: Object.values(aggregatedData),
              type: "pie",
              marker: {
                colors: [
                  "#4f46e5",
                  "#10b981",
                  "#8b5cf6",
                  "#f59e0b",
                  "#ef4444",
                  "#06b6d4",
                  "#8b5cf6",
                  "#ec4899",
                ],
              },
            },
          ],
          layout: {
            title: `Distribution of ${xColumn?.header || xAxis}`,
          },
        };
        break;

      case "histogram":
        // Filter out non-numeric values for histogram
        const numericYValues = yValues.filter(
          (val) => typeof val === "number" && !isNaN(val)
        );
        if (numericYValues.length === 0) {
          setError("No numeric data available for histogram");
          console.log("Error: No numeric data for histogram");
          console.log("=========================");
          return;
        }

        chartConfig = {
          data: [
            {
              x: numericYValues,
              type: "histogram",
              marker: { color: "#f59e0b" },
            },
          ],
          layout: {
            title: `Distribution of ${yColumn?.header || yAxis}`,
            xaxis: { title: yColumn?.header || yAxis },
            yaxis: { title: "Frequency" },
          },
        };
        break;

      default:
        chartConfig = {
          data: [
            {
              x: xValues,
              y: yValues,
              type: "bar",
            },
          ],
          layout: {
            title: `${yColumn?.header || yAxis} by ${xColumn?.header || xAxis}`,
            xaxis: { title: xColumn?.header || xAxis },
            yaxis: { title: yColumn?.header || yAxis },
          },
        };
    }

    console.log("Generated chart config:", chartConfig);
    console.log("=========================");
    setGeneratedChart(chartConfig);
  };

  // Generate a preset chart
  const generatePresetChart = (preset) => {
    console.log("=== Generate Preset Chart ===");
    console.log("Preset:", preset);
    console.log("Data available:", chartData ? chartData.length : "No data");
    console.log(
      "Column options available:",
      columnOptions ? columnOptions.length : "No columns"
    );

    // Log all available column names for debugging
    if (columnOptions && columnOptions.length > 0) {
      console.log(
        "Available columns:",
        columnOptions.map((col) => ({
          accessorKey: col.accessorKey,
          header: col.header,
        }))
      );
    }

    setError("");

    // Check if we have data
    if (!chartData || chartData.length === 0) {
      setError("No data available to generate chart");
      console.log("Error: No data available");
      console.log("==============================");
      return;
    }

    // Check if we have column options
    if (!columnOptions || columnOptions.length === 0) {
      setError("No column information available to generate chart");
      console.log("Error: No column information available");
      console.log("==============================");
      return;
    }

    // Try to find appropriate columns based on the preset
    let xKey, yKey, xColumn, yColumn;
    let sortedData; // Declare sortedData once here

    switch (preset.id) {
      case "top_sites_generation":
        console.log("Generating top sites by generation capacity chart");
        // Look for site name and generation capacity columns with more flexible matching
        xColumn = columnOptions.find(
          (col) =>
            col.accessorKey.toLowerCase().includes("site") ||
            col.accessorKey.toLowerCase().includes("name") ||
            col.header.toLowerCase().includes("site") ||
            col.header.toLowerCase().includes("name")
        );

        yColumn = columnOptions.find(
          (col) =>
            (col.accessorKey.toLowerCase().includes("generation") &&
              col.accessorKey.toLowerCase().includes("capacity")) ||
            (col.header.toLowerCase().includes("generation") &&
              col.header.toLowerCase().includes("capacity"))
        );

        console.log("Found xColumn:", xColumn);
        console.log("Found yColumn:", yColumn);

        // Fallback matching if primary match fails
        if (!xColumn) {
          xColumn = columnOptions.find(
            (col) =>
              col.accessorKey.toLowerCase() === "site" ||
              col.accessorKey.toLowerCase() === "sitename" ||
              col.header.toLowerCase() === "site" ||
              col.header.toLowerCase() === "site name"
          );
        }

        if (!yColumn) {
          yColumn = columnOptions.find(
            (col) =>
              col.accessorKey.toLowerCase().includes("generation capacity") ||
              col.header.toLowerCase().includes("generation capacity")
          );
        }

        console.log("After fallback - Found xColumn:", xColumn);
        console.log("After fallback - Found yColumn:", yColumn);

        if (!xColumn || !yColumn) {
          setError(
            "Could not find appropriate columns for this chart. Looking for Site/Site Name and Generation Capacity columns. Available columns: " +
              columnOptions.map((col) => col.header).join(", ")
          );
          console.log("Error: Could not find appropriate columns");
          console.log("==============================");
          return;
        }

        xKey = xColumn.accessorKey;
        yKey = yColumn.accessorKey;

        // Sort data by generation capacity and take top 10
        sortedData = [...chartData]
          .filter(
            (item) =>
              item[xKey] && item[yKey] && item[xKey] !== "" && item[yKey] !== ""
          ) // Filter out items with missing data
          .sort((a, b) => {
            const aVal = parseFloat(a[yKey]) || 0;
            const bVal = parseFloat(b[yKey]) || 0;
            return bVal - aVal;
          })
          .slice(0, 10);

        console.log("Sorted data:", sortedData);

        if (sortedData.length === 0) {
          setError("No valid data found for this chart after filtering");
          console.log("Error: No valid data after filtering");
          console.log("==============================");
          return;
        }

        const xValues = sortedData.map((item) => item[xKey]);
        const yValues = sortedData.map((item) => parseFloat(item[yKey]) || 0);

        console.log("X values:", xValues);
        console.log("Y values:", yValues);

        setGeneratedChart({
          data: [
            {
              x: xValues,
              y: yValues,
              type: "bar",
              marker: { color: "#4f46e5" },
            },
          ],
          layout: {
            title: "Top 10 Sites by Generation Capacity",
            xaxis: { title: xColumn.header },
            yaxis: { title: yColumn.header },
          },
        });
        break;

      case "top_sites_ecr":
        console.log("Generating top sites by ECR capacity chart");
        // Look for site name and ECR capacity columns with more flexible matching
        xColumn = columnOptions.find(
          (col) =>
            col.accessorKey.toLowerCase().includes("site") ||
            col.accessorKey.toLowerCase().includes("name") ||
            col.header.toLowerCase().includes("site") ||
            col.header.toLowerCase().includes("name")
        );

        yColumn = columnOptions.find(
          (col) =>
            (col.accessorKey.toLowerCase().includes("total") &&
              col.accessorKey.toLowerCase().includes("ecr") &&
              col.accessorKey.toLowerCase().includes("capacity")) ||
            (col.header.toLowerCase().includes("total") &&
              col.header.toLowerCase().includes("ecr") &&
              col.header.toLowerCase().includes("capacity"))
        );

        console.log("Found xColumn:", xColumn);
        console.log("Found yColumn:", yColumn);

        // Fallback matching if primary match fails
        if (!xColumn) {
          xColumn = columnOptions.find(
            (col) =>
              col.accessorKey.toLowerCase() === "site" ||
              col.accessorKey.toLowerCase() === "sitename" ||
              col.header.toLowerCase() === "site" ||
              col.header.toLowerCase() === "site name"
          );
        }

        if (!yColumn) {
          yColumn = columnOptions.find(
            (col) =>
              col.accessorKey.toLowerCase().includes("total ecr capacity") ||
              col.header.toLowerCase().includes("total ecr capacity")
          );
        }

        console.log("After fallback - Found xColumn:", xColumn);
        console.log("After fallback - Found yColumn:", yColumn);

        if (!xColumn || !yColumn) {
          setError(
            "Could not find appropriate columns for this chart. Looking for Site/Site Name and Total ECR Capacity columns. Available columns: " +
              columnOptions.map((col) => col.header).join(", ")
          );
          console.log("Error: Could not find appropriate columns");
          console.log("==============================");
          return;
        }

        xKey = xColumn.accessorKey;
        yKey = yColumn.accessorKey;

        // Sort data by ECR capacity and take top 10
        sortedData = [...chartData]
          .filter(
            (item) =>
              item[xKey] && item[yKey] && item[xKey] !== "" && item[yKey] !== ""
          ) // Filter out items with missing data
          .sort((a, b) => {
            const aVal = parseFloat(a[yKey]) || 0;
            const bVal = parseFloat(b[yKey]) || 0;
            return bVal - aVal;
          })
          .slice(0, 10);

        console.log("Sorted data:", sortedData);

        if (sortedData.length === 0) {
          setError("No valid data found for this chart after filtering");
          console.log("Error: No valid data after filtering");
          console.log("==============================");
          return;
        }

        const xValues2 = sortedData.map((item) => item[xKey]);
        const yValues2 = sortedData.map((item) => parseFloat(item[yKey]) || 0);

        console.log("X values:", xValues2);
        console.log("Y values:", yValues2);

        setGeneratedChart({
          data: [
            {
              x: xValues2,
              y: yValues2,
              type: "bar",
              marker: { color: "#10b981" },
            },
          ],
          layout: {
            title: "Top 10 Sites by Total ECR Capacity",
            xaxis: { title: xColumn.header },
            yaxis: { title: yColumn.header },
          },
        });
        break;

      case "risk_level_distribution":
        console.log("Generating risk level distribution chart");
        // Look for risk level column with more flexible matching
        xColumn = columnOptions.find(
          (col) =>
            col.accessorKey.toLowerCase().includes("risk") ||
            col.accessorKey.toLowerCase().includes("dnoa result") ||
            col.header.toLowerCase().includes("risk") ||
            col.header.toLowerCase().includes("dnoa result")
        );

        console.log("Found xColumn:", xColumn);

        // Fallback matching if primary match fails
        if (!xColumn) {
          // Look for any column that might contain risk-related information
          xColumn = columnOptions.find(
            (col) =>
              col.accessorKey.toLowerCase().includes("status") ||
              col.accessorKey.toLowerCase().includes("result") ||
              col.header.toLowerCase().includes("status") ||
              col.header.toLowerCase().includes("result")
          );
        }

        console.log("After fallback - Found xColumn:", xColumn);

        if (!xColumn) {
          setError(
            "Could not find appropriate columns for this chart. Looking for Risk Level or DNOA Result columns. Available columns: " +
              columnOptions.map((col) => col.header).join(", ")
          );
          console.log("Error: Could not find appropriate columns");
          console.log("==============================");
          return;
        }

        xKey = xColumn.accessorKey;

        // Filter out items with missing risk level data
        const validRiskData = chartData.filter(
          (item) => item[xKey] && item[xKey] !== ""
        );

        if (validRiskData.length === 0) {
          setError("No valid data found for this chart");
          console.log("Error: No valid data");
          console.log("==============================");
          return;
        }

        // Count occurrences of each risk level
        const riskCounts = {};
        validRiskData.forEach((item) => {
          const riskLevel = item[xKey];
          if (riskLevel) {
            riskCounts[riskLevel] = (riskCounts[riskLevel] || 0) + 1;
          }
        });

        console.log("Risk counts:", riskCounts);

        if (Object.keys(riskCounts).length === 0) {
          setError("No risk level data found to chart");
          console.log("Error: No risk level data");
          console.log("==============================");
          return;
        }

        setGeneratedChart({
          data: [
            {
              labels: Object.keys(riskCounts),
              values: Object.values(riskCounts),
              type: "pie",
              marker: {
                colors: [
                  "#ef4444",
                  "#f59e0b",
                  "#10b981",
                  "#4f46e5",
                  "#8b5cf6",
                  "#06b6d4",
                  "#ec4899",
                ],
              },
            },
          ],
          layout: {
            title: "Risk Level Distribution",
          },
        });
        break;

      case "site_type_distribution":
        console.log("Generating site type distribution chart");
        // Look for site type column with more flexible matching
        xColumn = columnOptions.find(
          (col) =>
            (col.accessorKey.toLowerCase().includes("site") &&
              col.accessorKey.toLowerCase().includes("type")) ||
            col.accessorKey.toLowerCase().includes("type") ||
            (col.header.toLowerCase().includes("site") &&
              col.header.toLowerCase().includes("type")) ||
            col.header.toLowerCase().includes("type")
        );

        console.log("Found xColumn:", xColumn);

        // Fallback matching if primary match fails
        if (!xColumn) {
          // Look for any column that might contain type information
          xColumn = columnOptions.find(
            (col) =>
              col.accessorKey.toLowerCase() === "type" ||
              col.accessorKey.toLowerCase() === "sitetype" ||
              col.header.toLowerCase() === "type" ||
              col.header.toLowerCase() === "site type"
          );
        }

        console.log("After fallback - Found xColumn:", xColumn);

        if (!xColumn) {
          setError(
            "Could not find appropriate columns for this chart. Looking for Site Type or Type columns. Available columns: " +
              columnOptions.map((col) => col.header).join(", ")
          );
          console.log("Error: Could not find appropriate columns");
          console.log("==============================");
          return;
        }

        xKey = xColumn.accessorKey;

        // Filter out items with missing site type data
        const validSiteTypeData = chartData.filter(
          (item) => item[xKey] && item[xKey] !== ""
        );

        if (validSiteTypeData.length === 0) {
          setError("No valid data found for this chart");
          console.log("Error: No valid data");
          console.log("==============================");
          return;
        }

        // Count occurrences of each site type
        const siteTypeCounts = {};
        validSiteTypeData.forEach((item) => {
          const siteType = item[xKey];
          if (siteType) {
            siteTypeCounts[siteType] = (siteTypeCounts[siteType] || 0) + 1;
          }
        });

        console.log("Site type counts:", siteTypeCounts);

        if (Object.keys(siteTypeCounts).length === 0) {
          setError("No site type data found to chart");
          console.log("Error: No site type data");
          console.log("==============================");
          return;
        }

        setGeneratedChart({
          data: [
            {
              labels: Object.keys(siteTypeCounts),
              values: Object.values(siteTypeCounts),
              type: "pie",
              marker: {
                colors: [
                  "#4f46e5",
                  "#10b981",
                  "#8b5cf6",
                  "#f59e0b",
                  "#ef4444",
                  "#06b6d4",
                  "#ec4899",
                ],
              },
            },
          ],
          layout: {
            title: "Site Type Distribution",
          },
        });
        break;

      default:
        setError("Unknown preset chart selected");
        console.log("Error: Unknown preset chart");
        console.log("==============================");
    }
    console.log("==============================");
  };

  // Reset the chart
  const resetChart = () => {
    console.log("=== Reset Chart ===");
    setGeneratedChart(null);
    setError("");
    // Reset axis selections
    setXAxis("");
    setYAxis("");
    setPresetChart("");
    console.log("Chart reset");
    console.log("===============");
  };

  // Auto-generate chart when a preset is selected
  React.useEffect(() => {
    if (presetChart && columnOptions && columnOptions.length > 0) {
      const preset = presetCharts.find((chart) => chart.id === presetChart);
      if (preset) {
        console.log("Auto-generating preset chart:", preset);
        console.log("Available column options:", columnOptions);
        // Add a small delay to ensure state is updated before generating
        const timer = setTimeout(() => {
          generatePresetChart(preset);
        }, 100);
        return () => clearTimeout(timer);
      }
    }
  }, [presetChart, columnOptions]);

  // If still loading data, show loading indicator
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 dark:bg-gray-800 dark:text-white">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">
          Custom Chart Builder
        </h2>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <span className="ml-3 text-gray-700 dark:text-gray-300">
            Loading data from database...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 dark:bg-gray-800 dark:text-white">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">
        Custom Chart Builder
      </h2>

      {/* Refresh Data Button */}
      <div className="mb-4 flex justify-end">
        <button
          onClick={fetchData}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Refreshing...
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                ></path>
              </svg>
              Refresh Data
            </>
          )}
        </button>
      </div>

      {/* Preset Charts */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Predefined Charts
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {presetCharts.map((chart) => (
            <button
              key={chart.id}
              onClick={() => {
                console.log("Selected preset chart:", chart.id);
                setPresetChart(chart.id);
                setChartType(chart.type);
              }}
              className={`p-3 text-left rounded-md border ${
                presetChart === chart.id
                  ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30"
                  : "border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
              } transition-colors`}
            >
              <div className="font-medium text-gray-900 dark:text-white">
                {chart.name}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {chart.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Chart Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Chart Type
          </label>
          <select
            value={chartType}
            onChange={(e) => {
              console.log("Chart type changed to:", e.target.value);
              setChartType(e.target.value);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            disabled={!!presetChart} // Disable when preset chart is selected
          >
            <option value="bar">Bar</option>
            <option value="line">Line</option>
            <option value="pie">Pie</option>
            <option value="scatter">Scatter</option>
            <option value="histogram">Histogram</option>
          </select>
        </div>

        {/* X Axis */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            X Axis
          </label>
          <select
            value={xAxis}
            onChange={(e) => {
              console.log("X axis changed to:", e.target.value);
              setXAxis(e.target.value);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            disabled={!!presetChart} // Disable when preset chart is selected
          >
            <option value="">Select X Axis</option>
            {xColumnOptions.map((col) => (
              <option key={col.accessorKey} value={col.accessorKey}>
                {col.header}
              </option>
            ))}
          </select>
        </div>

        {/* Y Axis (hidden for pie charts) */}
        {chartType !== "pie" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Y Axis
            </label>
            <select
              value={yAxis}
              onChange={(e) => {
                console.log("Y axis changed to:", e.target.value);
                setYAxis(e.target.value);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              disabled={!!presetChart} // Disable when preset chart is selected
            >
              <option value="">Select Y Axis</option>
              {yColumnOptions.map((col) => (
                <option key={col.accessorKey} value={col.accessorKey}>
                  {col.header}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Generate Button */}
        <div className="flex items-end">
          <button
            onClick={generateChart}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800"
            disabled={!!presetChart} // Disable when preset chart is selected
          >
            {presetChart ? "Generate Preset Chart" : "Generate Chart"}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded dark:bg-red-900 dark:border-red-700 dark:text-red-100">
          {error}
        </div>
      )}

      {/* Generated Chart */}
      {generatedChart && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Generated Chart
            </h3>
            <button
              onClick={resetChart}
              className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              Clear Chart
            </button>
          </div>
          <div className="border rounded-lg p-4 bg-white dark:bg-gray-700">
            <Plot
              data={generatedChart.data}
              layout={{
                ...generatedChart.layout,
                autosize: true,
                paper_bgcolor: "rgba(0,0,0,0)",
                plot_bgcolor: "rgba(0,0,0,0)",
                font: {
                  color: document.documentElement.classList.contains("dark")
                    ? "#ffffff"
                    : "#000000",
                },
              }}
              config={{ responsive: true }}
              style={{ width: "100%", height: "400px" }}
              useResizeHandler={true}
            />
          </div>
        </div>
      )}

      {/* Info Message */}
      {!generatedChart && !error && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-center dark:bg-blue-900 dark:border-blue-700">
          <p className="text-blue-800 dark:text-blue-200">
            {presetChart
              ? "Select a preset chart and click 'Generate Preset Chart'"
              : "Select your chart options and click 'Generate Chart' to visualize your data"}
          </p>
        </div>
      )}
    </div>
  );
};

export default CustomChartBuilder;
