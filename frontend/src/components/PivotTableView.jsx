import { useState, useMemo, useRef } from "react";
import PropTypes from "prop-types";
import { HotTable } from "@handsontable/react";
import "handsontable/dist/handsontable.full.css";
import PivotConfigPanel from "./PivotConfigPanel";

// Register Handsontable plugins
import { registerAllModules } from "handsontable/registry";
registerAllModules();

// Helper function to group data by multiple keys
const groupBy = (array, keys) => {
  return array.reduce((groups, item) => {
    const groupKey = keys.map((key) => item[key]).join("|");
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {});
};

// Helper function to sum values in an array
const sum = (array, key) => {
  return array.reduce((total, item) => {
    const value = item[key];
    // Handle different data types that can be converted to numbers
    if (value === null || value === undefined || value === "") return total;
    const numValue = Number(value);
    return isNaN(numValue) ? total : total + numValue;
  }, 0);
};

// Helper function to calculate average
const average = (array, key) => {
  if (array.length === 0) return 0;
  const sumValue = sum(array, key);
  return sumValue / array.length;
};

// Helper function to count items
const count = (array) => {
  return array.length;
};

// Helper function to find min value
const min = (array, key) => {
  const validValues = array
    .map((item) => {
      const value = item[key];
      if (value === null || value === undefined || value === "") return null;
      const numValue = Number(value);
      return isNaN(numValue) ? null : numValue;
    })
    .filter((val) => val !== null);

  if (validValues.length === 0) return 0;
  return Math.min(...validValues);
};

// Helper function to find max value
const max = (array, key) => {
  const validValues = array
    .map((item) => {
      const value = item[key];
      if (value === null || value === undefined || value === "") return null;
      const numValue = Number(value);
      return isNaN(numValue) ? null : numValue;
    })
    .filter((val) => val !== null);

  if (validValues.length === 0) return 0;
  return Math.max(...validValues);
};

// Convert data to column format for PivotConfigPanel
const convertToColumns = (data) => {
  if (!data || data.length === 0) return [];

  const keys = Object.keys(data[0]);
  return keys.map((key) => ({
    accessorKey: key,
    header: key,
  }));
};

const PivotTableView = ({ data }) => {
  // Only use provided data, don't fallback to sample data
  // const rowData = useMemo(() => {
  //   if (data && data.length > 0) {
  //     return data;
  //   }
  //   // Return empty array when no data is provided
  //   return [];
  // }, [data]);

  // Convert data to column format for PivotConfigPanel
  const columns = useMemo(() => {
    return convertToColumns(data);
  }, [data]);

  // State for pivot configuration from PivotConfigPanel
  const [pivotConfig, setPivotConfig] = useState(null);

  // State to track if pivot table has been generated
  const [isGenerated, setIsGenerated] = useState(false);

  // Generate pivot table data based on configuration
  const pivotData = useMemo(() => {
    // Only generate data when configuration is provided
    if (
      !data ||
      data.length === 0 ||
      !pivotConfig ||
      pivotConfig.rows.length === 0 ||
      pivotConfig.values.length === 0
    ) {
      return [];
    }

    try {
      // Get all row fields
      const rowFields = pivotConfig.rows;

      // Get all value fields with their aggregations
      const valueConfigs = pivotConfig.values;

      // Group data by all row dimensions
      const groupedData = groupBy(data, rowFields);

      // Create result array
      const result = [];

      // Process each group
      Object.entries(groupedData).forEach(([groupKey, groupItems]) => {
        const row = {};

        // Add all row group values
        const rowKeys = groupKey.split("|");
        rowFields.forEach((field, index) => {
          row[field] = rowKeys[index] || "";
        });

        // Calculate aggregated values for each value field
        valueConfigs.forEach((valueConfig) => {
          const valueField = valueConfig.field;
          const aggFunc = valueConfig.aggregation.toLowerCase();

          let aggValue;
          switch (aggFunc) {
            case "sum":
              aggValue = sum(groupItems, valueField);
              break;
            case "avg":
              aggValue = average(groupItems, valueField);
              break;
            case "count":
              aggValue = count(groupItems);
              break;
            case "min":
              aggValue = min(groupItems, valueField);
              break;
            case "max":
              aggValue = max(groupItems, valueField);
              break;
            default:
              aggValue = sum(groupItems, valueField);
          }
          row[valueField] = aggValue;
        });

        result.push(row);
      });

      return result;
    } catch (error) {
      console.error("Error generating pivot data:", error);
      return [];
    }
  }, [data, pivotConfig]);

  // Prepare column definitions for Handsontable based on pivot data
  const columnDefs = useMemo(() => {
    if (pivotData && pivotData.length > 0) {
      const firstRow = pivotData[0];
      return Object.keys(firstRow).map((key) => {
        // Determine column type based on data
        if (typeof firstRow[key] === "number") {
          return {
            data: key,
            type: "numeric",
            width: 120,
            numericFormat: { pattern: "0,0.00" },
          };
        }
        return { data: key, type: "text", width: 120 };
      });
    }
    // Return empty array when no pivot data
    return [];
  }, [pivotData]);

  // Get column headers based on pivot data
  const columnHeaders = useMemo(() => {
    if (pivotData && pivotData.length > 0) {
      return Object.keys(pivotData[0]);
    }
    // Return empty array when no pivot data
    return [];
  }, [pivotData]);

  // Configure Handsontable settings
  const hotSettings = {
    data: pivotData,
    columns: columnDefs,
    colHeaders: columnHeaders,
    rowHeaders: true,
    filters: true,
    dropdownMenu: true,
    contextMenu: true,
    manualColumnResize: true,
    manualRowResize: true,
    columnSorting: true,
    licenseKey: "non-commercial-and-evaluation",
    height: 500,
    width: "100%",
    className: "htCenter",
    // Ensure all data is displayed without virtualization limits
    renderAllRows: true,
    // Disable pagination/virtualization that might limit rows
    viewportRowRenderingOffset: "auto",
    // Ensure the table can grow to accommodate all data
    stretchH: "all",
  };

  const hotTableRef = useRef();

  // Export to CSV function
  const exportToCSV = () => {
    if (hotTableRef.current && hotTableRef.current.hotInstance) {
      const exportPlugin =
        hotTableRef.current.hotInstance.getPlugin("exportFile");
      if (exportPlugin) {
        exportPlugin.downloadFile("csv", {
          bom: false,
          columnDelimiter: ",",
          columnHeaders: true,
          exportHiddenColumns: true,
          exportHiddenRows: true,
          fileExtension: "csv",
          filename: "pivot-table-data_[YYYY]-[MM]-[DD]",
          mimeType: "text/csv",
          rowDelimiter: "\r\n",
          rowHeaders: true,
        });
      }
    }
  };

  // Export to Excel function
  const exportToExcel = () => {
    if (hotTableRef.current && hotTableRef.current.hotInstance) {
      const exportPlugin =
        hotTableRef.current.hotInstance.getPlugin("exportFile");
      if (exportPlugin) {
        exportPlugin.downloadFile("xlsx", {
          bom: false,
          columnDelimiter: ",",
          columnHeaders: true,
          exportHiddenColumns: true,
          exportHiddenRows: true,
          fileExtension: "xlsx",
          filename: "pivot-table-data_[YYYY]-[MM]-[DD]",
          mimeType:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          rowDelimiter: "\r\n",
          rowHeaders: true,
        });
      }
    }
  };

  // Handle pivot configuration from PivotConfigPanel
  const handleDataGenerate = (config) => {
    console.log("Received pivot configuration:", config);
    setPivotConfig(config);
    setIsGenerated(true);
  };

  // Handle cancel from PivotConfigPanel
  const handleCancel = () => {
    setPivotConfig(null);
    setIsGenerated(false);
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden">
      {/* Use the PivotConfigPanel component */}
      {data && data.length > 0 && !isGenerated && (
        <PivotConfigPanel
          columns={columns}
          onDataGenerate={handleDataGenerate}
          onCancel={handleCancel}
        />
      )}

      {/* Export buttons - only show when there's data and pivot table is generated */}
      {isGenerated && pivotData.length > 0 && (
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-end space-x-2">
          <button
            onClick={exportToCSV}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
          >
            Export to CSV
          </button>
          <button
            onClick={exportToExcel}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-sm"
          >
            Export to Excel
          </button>
        </div>
      )}

      {/* Message when no data or not generated */}
      {data && data.length > 0 && !isGenerated && (
        <div className="p-8 text-center text-gray-500">
          <p>
            Configure the pivot table above and click &quot;Generate Pivot
            Table&quot;
          </p>
        </div>
      )}

      {/* Message when no data available after generation */}
      {data && data.length > 0 && isGenerated && pivotData.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          <p>
            No data available for the selected options. Please try different
            selections.
          </p>
        </div>
      )}

      {/* Handsontable component - only show when there's data to display */}
      {isGenerated && pivotData.length > 0 && (
        <HotTable ref={hotTableRef} settings={hotSettings} />
      )}
    </div>
  );
};

PivotTableView.propTypes = {
  data: PropTypes.array,
};

export default PivotTableView;
