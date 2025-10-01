// Utility functions for applying view configurations

/**
 * Apply view configuration to table
 * @param {Array} data - The raw data
 * @param {Object} viewConfig - The view configuration
 * @returns {Object} - Processed data and columns for the table
 */
export const applyViewToTable = (data, viewConfig) => {
  if (!data || !viewConfig) {
    return { data, columns: [] };
  }

  const { selectedColumns = [], filters = {} } = viewConfig;

  // Filter data based on filters
  let filteredData = [...data];

  // Apply filters
  Object.entries(filters).forEach(([column, columnFilters]) => {
    if (columnFilters && columnFilters.length > 0) {
      filteredData = filteredData.filter((item) => {
        const itemValue = item[column];
        return columnFilters.some((filter) => {
          const { operator, value } = filter;

          switch (operator) {
            case "=":
              return String(itemValue) === String(value);
            case "!=":
              return String(itemValue) !== String(value);
            case ">":
              return Number(itemValue) > Number(value);
            case "<":
              return Number(itemValue) < Number(value);
            case ">=":
              return Number(itemValue) >= Number(value);
            case "<=":
              return Number(itemValue) <= Number(value);
            case "contains":
              return String(itemValue)
                .toLowerCase()
                .includes(String(value).toLowerCase());
            case "in":
              return String(value)
                .split(",")
                .map((v) => v.trim())
                .includes(String(itemValue));
            default:
              return true;
          }
        });
      });
    }
  });

  // If no selected columns, return all columns
  if (!selectedColumns || selectedColumns.length === 0) {
    const allColumns =
      data.length > 0
        ? Object.keys(data[0]).map((key) => ({
            accessorKey: key,
            header:
              key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " "),
          }))
        : [];

    return { data: filteredData, columns: allColumns };
  }

  // Filter data to only include selected columns
  const columnFilteredData = filteredData.map((item) => {
    const newItem = {};
    selectedColumns.forEach((col) => {
      newItem[col] = item[col];
    });
    return newItem;
  });

  // Generate columns based on selected columns
  const columns = selectedColumns.map((col) => ({
    accessorKey: col,
    header: col.charAt(0).toUpperCase() + col.slice(1).replace(/_/g, " "),
  }));

  return { data: columnFilteredData, columns };
};

/**
 * Apply view configuration to map
 * @param {Array} data - The raw data
 * @param {Object} viewConfig - The view configuration
 * @returns {Array} - Processed markers for the map
 */
export const applyViewToMap = (data, viewConfig) => {
  if (!data || !viewConfig) {
    return [];
  }

  const { selectedColumns = [], filters = {} } = viewConfig;

  // Filter data based on filters
  let filteredData = [...data];

  // Apply filters
  Object.entries(filters).forEach(([column, columnFilters]) => {
    if (columnFilters && columnFilters.length > 0) {
      filteredData = filteredData.filter((item) => {
        const itemValue = item[column];
        return columnFilters.some((filter) => {
          const { operator, value } = filter;

          switch (operator) {
            case "=":
              return String(itemValue) === String(value);
            case "!=":
              return String(itemValue) !== String(value);
            case ">":
              return Number(itemValue) > Number(value);
            case "<":
              return Number(itemValue) < Number(value);
            case ">=":
              return Number(itemValue) >= Number(value);
            case "<=":
              return Number(itemValue) <= Number(value);
            case "contains":
              return String(itemValue)
                .toLowerCase()
                .includes(String(value).toLowerCase());
            case "in":
              return String(value)
                .split(",")
                .map((v) => v.trim())
                .includes(String(itemValue));
            default:
              return true;
          }
        });
      });
    }
  });

  // Transform data into map markers
  const markers = filteredData
    .map((site, index) => {
      // Get spatial coordinates (format: "lat, lng")
      const spatialCoords = site["Spatial Coordinates"];
      if (!spatialCoords || spatialCoords === "\\N") {
        return null;
      }

      try {
        const coords = spatialCoords.trim().split(", ");
        if (coords.length !== 2) return null;

        const lat = parseFloat(coords[0]);
        const lng = parseFloat(coords[1]);

        if (isNaN(lat) || isNaN(lng)) return null;

        // Get site name
        const siteName = site["Site Name"] || "Unknown Site";

        // Get Generation Headroom Mw value
        const generationHeadroom = site["Generation Headroom Mw"];

        // Create a unique ID
        const uniqueId = site["id"]
          ? `${site["id"]}-${index}`
          : `${siteName}-${index}`;

        // Determine marker color based on generation headroom
        let color = "#808080"; // Gray for unknown values
        if (generationHeadroom !== null && generationHeadroom !== undefined) {
          if (generationHeadroom >= 50) {
            color = "#008000"; // Green for 50MW and greater
          } else if (generationHeadroom >= 20) {
            color = "#FFA500"; // Amber for 20MW to 50MW
          } else {
            color = "#FF0000"; // Red for less than 20MW
          }
        }

        return {
          id: uniqueId,
          position: [lat, lng],
          popupText: `${siteName} (${site["Site Type"] || "Unknown"})`,
          siteName: siteName,
          siteType: site["Site Type"] || "Unknown",
          siteVoltage: site["Site Voltage"] || "Unknown",
          county: site["County"] || "Unknown",
          generationHeadroom: generationHeadroom,
          color: color,
          // Include only selected columns in the marker data
          ...(selectedColumns.length > 0
            ? selectedColumns.reduce((acc, col) => {
                acc[col] = site[col];
                return acc;
              }, {})
            : site),
        };
      } catch (e) {
        console.error("Error processing site coordinates:", site, e);
        return null;
      }
    })
    .filter((marker) => marker !== null);

  return markers;
};

/**
 * Apply view configuration to charts
 * @param {Array} data - The raw data
 * @param {Object} viewConfig - The view configuration
 * @returns {Array} - Processed data for charts
 */
export const applyViewToCharts = (data, viewConfig) => {
  if (!data || !viewConfig) {
    return [];
  }

  const { selectedColumns = [], filters = {} } = viewConfig;

  // Filter data based on filters
  let filteredData = [...data];

  // Apply filters
  Object.entries(filters).forEach(([column, columnFilters]) => {
    if (columnFilters && columnFilters.length > 0) {
      filteredData = filteredData.filter((item) => {
        const itemValue = item[column];
        return columnFilters.some((filter) => {
          const { operator, value } = filter;

          switch (operator) {
            case "=":
              return String(itemValue) === String(value);
            case "!=":
              return String(itemValue) !== String(value);
            case ">":
              return Number(itemValue) > Number(value);
            case "<":
              return Number(itemValue) < Number(value);
            case ">=":
              return Number(itemValue) >= Number(value);
            case "<=":
              return Number(itemValue) <= Number(value);
            case "contains":
              return String(itemValue)
                .toLowerCase()
                .includes(String(value).toLowerCase());
            case "in":
              return String(value)
                .split(",")
                .map((v) => v.trim())
                .includes(String(itemValue));
            default:
              return true;
          }
        });
      });
    }
  });

  // If no selected columns, return filtered data
  if (!selectedColumns || selectedColumns.length === 0) {
    return filteredData;
  }

  // Filter data to only include selected columns
  const columnFilteredData = filteredData.map((item) => {
    const newItem = {};
    selectedColumns.forEach((col) => {
      newItem[col] = item[col];
    });
    return newItem;
  });

  return columnFilteredData;
};

/**
 * Validate view configuration before saving
 * @param {Object} viewConfig - The view configuration to validate
 * @param {Array} allColumns - All available columns
 * @returns {Object} - Validation result
 */
export const validateViewConfig = (viewConfig, allColumns) => {
  const {
    slot,
    name,
    selectedColumns = [],
    chartConfig = {},
    filters = {},
  } = viewConfig;

  // Validate slot
  if (!slot || slot < 1 || slot > 5) {
    return { valid: false, error: "Slot must be between 1 and 5" };
  }

  // Validate name
  if (!name || name.trim() === "") {
    return { valid: false, error: "View name is required" };
  }

  // Validate selected columns
  if (selectedColumns.length === 0) {
    return { valid: false, error: "At least one column must be selected" };
  }

  // Validate chart config
  if (chartConfig.type) {
    // Validate axes are selected from selected columns
    if (chartConfig.xAxis && !selectedColumns.includes(chartConfig.xAxis)) {
      return {
        valid: false,
        error: "X-axis must be one of the selected columns",
      };
    }

    if (chartConfig.yAxis && !selectedColumns.includes(chartConfig.yAxis)) {
      return {
        valid: false,
        error: "Y-axis must be one of the selected columns",
      };
    }
  }

  // Validate filters reference only selected columns
  for (const column in filters) {
    if (!selectedColumns.includes(column)) {
      return {
        valid: false,
        error: `Filter references non-selected column "${column}"`,
      };
    }
  }

  return { valid: true };
};
