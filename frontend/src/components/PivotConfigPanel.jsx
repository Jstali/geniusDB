import { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";

const PivotConfigPanel = ({ columns, onDataGenerate, onCancel }) => {
  const [rows, setRows] = useState([]);
  const [columnsFields, setColumnsFields] = useState([]);
  const [values, setValues] = useState([]);
  const [aggregations, setAggregations] = useState([]);
  const [error, setError] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);

  // Available aggregation functions
  const aggregationOptions = useMemo(
    () => ["SUM", "AVG", "COUNT", "MIN", "MAX"],
    []
  );

  // Initialize with first column as row, second as column, third as value
  // Only initialize once, not on every render
  useEffect(() => {
    console.log("=== PIVOT CONFIG PANEL INITIALIZATION ===");
    console.log("Initializing PivotConfigPanel with columns:", columns);
    if (!isInitialized && columns && columns.length > 0) {
      const columnKeys = columns.map((col) => col.accessorKey);
      console.log("Available column keys:", columnKeys);
      if (columnKeys.length > 0) {
        setRows([columnKeys[0]]);
        console.log("Initialized rows with:", columnKeys[0]);
      }
      if (columnKeys.length > 1) {
        setColumnsFields([columnKeys[1]]);
        console.log("Initialized columns with:", columnKeys[1]);
      }
      if (columnKeys.length > 2) {
        setValues([columnKeys[2]]);
        setAggregations([aggregationOptions[0]]);
        console.log("Initialized values with:", columnKeys[2]);
      }
      setIsInitialized(true);
    }
  }, [columns, isInitialized, aggregationOptions]);

  const handleAddValue = () => {
    console.log("Adding new value field");
    if (columns && columns.length > 0) {
      const columnKeys = columns.map((col) => col.accessorKey);
      if (columnKeys.length > 0) {
        setValues([...values, columnKeys[0]]);
        setAggregations([...aggregations, aggregationOptions[0]]);
        console.log("Added value field:", columnKeys[0]);
      }
    }
  };

  const handleRemoveValue = (index) => {
    console.log("Removing value field at index:", index);
    if (values.length <= 1) {
      const errorMsg = "At least one value field is required";
      console.warn(errorMsg);
      setError(errorMsg);
      return;
    }

    const newValues = [...values];
    const newAggregations = [...aggregations];
    newValues.splice(index, 1);
    newAggregations.splice(index, 1);
    setValues(newValues);
    setAggregations(newAggregations);
    setError("");
    console.log("Removed value field at index:", index);
  };

  const handleValueChange = (index, value) => {
    console.log(`Changing value at index ${index} to:`, value);
    const newValues = [...values];
    newValues[index] = value;
    setValues(newValues);
  };

  const handleAggregationChange = (index, aggregation) => {
    console.log(`Changing aggregation at index ${index} to:`, aggregation);
    const newAggregations = [...aggregations];
    newAggregations[index] = aggregation;
    setAggregations(newAggregations);
  };

  const handleGenerate = () => {
    console.log("=== GENERATING PIVOT TABLE ===");
    console.log("Generating pivot table with current configuration");

    // Validation
    if (rows.length === 0) {
      const errorMsg = "Please select at least one field for Rows";
      console.warn(errorMsg);
      setError(errorMsg);
      return;
    }
    if (columnsFields.length === 0) {
      const errorMsg = "Please select at least one field for Columns";
      console.warn(errorMsg);
      setError(errorMsg);
      return;
    }
    if (values.length === 0) {
      const errorMsg = "Please select at least one field for Values";
      console.warn(errorMsg);
      setError(errorMsg);
      return;
    }

    setError("");
    console.log("Validation passed");

    // Prepare configuration
    const config = {
      rows,
      columns: columnsFields,
      values: values.map((value, index) => ({
        field: value,
        aggregation: aggregations[index] || "SUM", // Default to SUM if not specified
      })),
    };

    console.log("Prepared configuration:", config);

    // Additional validation to ensure we have valid configuration
    if (!config.rows || config.rows.length === 0) {
      const errorMsg = "Configuration error: No rows specified";
      console.error(errorMsg);
      setError(errorMsg);
      return;
    }

    if (!config.columns || config.columns.length === 0) {
      const errorMsg = "Configuration error: No columns specified";
      console.error(errorMsg);
      setError(errorMsg);
      return;
    }

    if (!config.values || config.values.length === 0) {
      const errorMsg = "Configuration error: No values specified";
      console.error(errorMsg);
      setError(errorMsg);
      return;
    }

    // Validate that all fields exist in the data
    console.log("Sending configuration to parent component");
    onDataGenerate(config);
  };

  // Get column options for dropdowns
  const columnOptions = columns
    ? columns.map((col) => ({
        value: col.accessorKey,
        label: col.header,
      }))
    : [];

  console.log("Column options for dropdowns:", columnOptions);

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 mb-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Pivot Table Configuration
      </h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md border border-red-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Rows Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rows (Multi-select)
          </label>
          <div className="border rounded-md p-3 min-h-24 max-h-40 overflow-y-auto">
            {columnOptions.map((option) => (
              <label
                key={`row-${option.value}`}
                className="flex items-center mb-2"
              >
                <input
                  type="checkbox"
                  checked={rows.includes(option.value)}
                  onChange={(e) => {
                    console.log(
                      `Toggling row field ${option.value}:`,
                      e.target.checked
                    );
                    if (e.target.checked) {
                      setRows([...rows, option.value]);
                    } else {
                      setRows(rows.filter((row) => row !== option.value));
                    }
                  }}
                  className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Columns Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Columns (Multi-select)
          </label>
          <div className="border rounded-md p-3 min-h-24 max-h-40 overflow-y-auto">
            {columnOptions.map((option) => (
              <label
                key={`col-${option.value}`}
                className="flex items-center mb-2"
              >
                <input
                  type="checkbox"
                  checked={columnsFields.includes(option.value)}
                  onChange={(e) => {
                    console.log(
                      `Toggling column field ${option.value}:`,
                      e.target.checked
                    );
                    if (e.target.checked) {
                      setColumnsFields([...columnsFields, option.value]);
                    } else {
                      setColumnsFields(
                        columnsFields.filter((col) => col !== option.value)
                      );
                    }
                  }}
                  className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Values and Aggregations */}
        <div className="md:col-span-2">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Values and Aggregations
            </label>
            <button
              type="button"
              onClick={handleAddValue}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Add Value
            </button>
          </div>

          <div className="border rounded-md p-3">
            {values.length === 0 ? (
              <p className="text-sm text-gray-500 italic">
                No values added yet
              </p>
            ) : (
              values.map((value, index) => (
                <div
                  key={`value-${index}-${value}`}
                  className="flex items-center mb-3 last:mb-0"
                >
                  <select
                    value={value}
                    onChange={(e) => handleValueChange(index, e.target.value)}
                    className="flex-1 mr-2 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    {columnOptions.map((option) => (
                      <option
                        key={`value-option-${index}-${option.value}`}
                        value={option.value}
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>

                  <select
                    value={aggregations[index] || "SUM"}
                    onChange={(e) =>
                      handleAggregationChange(index, e.target.value)
                    }
                    className="flex-1 mr-2 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    {aggregationOptions.map((option) => (
                      <option key={`agg-${option}`} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>

                  {values.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveValue(index)}
                      className="inline-flex items-center p-2 border border-transparent rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleGenerate}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Generate Pivot Table
        </button>
      </div>
    </div>
  );
};

PivotConfigPanel.propTypes = {
  columns: PropTypes.array,
  onDataGenerate: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default PivotConfigPanel;
