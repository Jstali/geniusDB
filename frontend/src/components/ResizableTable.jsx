import React, { useState, useRef, useEffect } from "react";

const ResizableTable = ({ data, columns }) => {
  const [columnSizes, setColumnSizes] = useState({});
  const [isResizing, setIsResizing] = useState(null);
  const tableRef = useRef(null);
  const containerRef = useRef(null);

  // Default column width
  const DEFAULT_COLUMN_WIDTH = 180;
  const MIN_COLUMN_WIDTH = 50;
  const MAX_COLUMN_WIDTH = 800;

  // Initialize column sizes
  useEffect(() => {
    if (columns && columns.length > 0) {
      const initialSizes = {};
      columns.forEach((col) => {
        // Handle both accessorKey and id properties
        const columnId = col.accessorKey || col.id;
        if (columnId) {
          initialSizes[columnId] = DEFAULT_COLUMN_WIDTH;
        }
      });
      setColumnSizes(initialSizes);
    }
  }, [columns]);

  // Handle mouse events for column resizing
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;

      setColumnSizes((prev) => ({
        ...prev,
        [isResizing]: Math.min(
          MAX_COLUMN_WIDTH,
          Math.max(MIN_COLUMN_WIDTH, prev[isResizing] + e.movementX)
        ),
      }));
    };

    const handleMouseUp = () => {
      setIsResizing(null);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  // Calculate total table width
  const getTotalWidth = () => {
    if (!columns) return 0;
    return columns.reduce((total, col) => {
      const columnId = col.accessorKey || col.id;
      return (
        total +
        (columnId
          ? columnSizes[columnId] || DEFAULT_COLUMN_WIDTH
          : DEFAULT_COLUMN_WIDTH)
      );
    }, 0);
  };

  // Get column size with fallback
  const getColumnSize = (columnId) => {
    return columnSizes[columnId] || DEFAULT_COLUMN_WIDTH;
  };

  // Get column header with fallback
  const getColumnHeader = (column) => {
    if (column.header) return column.header;
    if (column.accessorKey)
      return (
        column.accessorKey.charAt(0).toUpperCase() +
        column.accessorKey.slice(1).replace(/_/g, " ")
      );
    if (column.id)
      return (
        column.id.charAt(0).toUpperCase() +
        column.id.slice(1).replace(/_/g, " ")
      );
    return "Unknown";
  };

  // Get column id with fallback
  const getColumnId = (column) => {
    return column.accessorKey || column.id || "unknown";
  };

  if (!data || !columns) {
    return (
      <div className="rounded-lg shadow-sm bg-white p-8 text-center border">
        <div className="text-red-600 text-lg font-semibold mb-2">
          Missing Data or Columns
        </div>
        <p className="text-gray-500">
          Unable to display table. Data or columns are missing.
        </p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-lg shadow-sm bg-white p-8 text-center border">
        <div className="text-red-600 text-lg font-semibold mb-2">
          No Data Available
        </div>
        <p className="text-gray-500">The data array is empty.</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="overflow-x-auto rounded-lg border shadow-sm"
    >
      <table
        ref={tableRef}
        className="min-w-full divide-y divide-gray-200"
        style={{ width: `${getTotalWidth()}px` }}
      >
        <thead className="bg-blue-600">
          <tr>
            {columns.map((column) => {
              const columnId = getColumnId(column);
              const columnSize = getColumnSize(columnId);
              const columnHeader = getColumnHeader(column);

              return (
                <th
                  key={columnId}
                  className="text-left text-xs font-medium text-white uppercase tracking-wider border-r border-blue-700 last:border-r-0 relative"
                  style={{
                    width: `${columnSize}px`,
                    minWidth: `${MIN_COLUMN_WIDTH}px`,
                    maxWidth: `${MAX_COLUMN_WIDTH}px`,
                  }}
                >
                  <div className="flex items-center justify-between h-full">
                    <div className="px-4 py-3 truncate">{columnHeader}</div>

                    {/* Resize Handle */}
                    <div
                      className="absolute right-0 top-0 h-full w-1 cursor-col-resize bg-blue-400 hover:bg-blue-300 opacity-0 hover:opacity-100 transition-opacity"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setIsResizing(columnId);
                      }}
                    />
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className={`hover:bg-gray-50 ${
                rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"
              }`}
            >
              {columns.map((column) => {
                const columnId = getColumnId(column);
                const columnSize = getColumnSize(columnId);
                const cellValue = row[columnId];

                return (
                  <td
                    key={`${rowIndex}-${columnId}`}
                    className="text-sm text-gray-900 border-r border-gray-100 last:border-r-0"
                    style={{
                      width: `${columnSize}px`,
                      minWidth: `${MIN_COLUMN_WIDTH}px`,
                      maxWidth: `${MAX_COLUMN_WIDTH}px`,
                    }}
                  >
                    <div
                      className="px-4 py-3 truncate"
                      title={String(cellValue)}
                    >
                      {cellValue !== null && cellValue !== undefined
                        ? String(cellValue)
                        : ""}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResizableTable;
