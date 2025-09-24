import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";

const DataTable = ({ data, columns }) => {
  const [columnFilters, setColumnFilters] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 100,
  });

  // State for dropdown filters
  const [openDropdowns, setOpenDropdowns] = useState({});
  const [columnMultiSelectValues, setColumnMultiSelectValues] = useState({});
  const dropdownRefs = useRef({});

  const table = useReactTable({
    data,
    columns: columns.map((col) => ({
      ...col,
      filterFn: col.accessorKey ? "multiSelect" : undefined,
    })),
    state: {
      columnFilters,
      globalFilter,
      sorting,
      pagination,
    },
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    filterFns: {
      multiSelect: (row, columnId, filterValues) => {
        if (!filterValues || filterValues.length === 0) return true;
        const cellValue = row.getValue(columnId);
        return filterValues.includes(cellValue);
      },
    },
    debugTable: false,
  });

  // Get unique values for each column
  const getColumnFilterOptions = useMemo(() => {
    const options = {};
    columns.forEach((column) => {
      if (column.accessorKey) {
        const uniqueValues = [
          ...new Set(data.map((row) => row[column.accessorKey])),
        ];
        options[column.accessorKey] = uniqueValues
          .filter((val) => val !== null && val !== undefined && val !== "")
          .slice(0, 500)
          .sort((a, b) => String(a).localeCompare(String(b)));
      }
    });
    return options;
  }, [data, columns]);

  // Handle clicking outside dropdowns to close them
  useEffect(() => {
    const handleClickOutside = (event) => {
      Object.keys(dropdownRefs.current).forEach((columnId) => {
        if (
          dropdownRefs.current[columnId] &&
          !dropdownRefs.current[columnId].contains(event.target)
        ) {
          setOpenDropdowns((prev) => ({ ...prev, [columnId]: false }));
        }
      });
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Toggle dropdown visibility
  const toggleDropdown = (columnId) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [columnId]: !prev[columnId],
    }));
  };

  // Handle multi-select filter changes
  const handleMultiSelectChange = (columnId, value, isChecked) => {
    setColumnMultiSelectValues((prev) => {
      const currentValues = prev[columnId] || [];
      let newValues;

      if (value === "SELECT_ALL") {
        if (isChecked) {
          newValues = [...getColumnFilterOptions[columnId]];
        } else {
          newValues = [];
        }
      } else {
        if (isChecked) {
          newValues = [...currentValues, value];
        } else {
          newValues = currentValues.filter((v) => v !== value);
        }
      }

      return { ...prev, [columnId]: newValues };
    });

    // Update column filters
    setColumnFilters((prev) => {
      const otherFilters = prev.filter((f) => f.id !== columnId);
      const currentValues = columnMultiSelectValues[columnId] || [];
      let newValues;

      if (value === "SELECT_ALL") {
        if (isChecked) {
          newValues = [...getColumnFilterOptions[columnId]];
        } else {
          newValues = [];
        }
      } else {
        if (isChecked) {
          newValues = [...currentValues, value];
        } else {
          newValues = currentValues.filter((v) => v !== value);
        }
      }

      if (
        newValues.length === 0 ||
        newValues.length === getColumnFilterOptions[columnId]?.length
      ) {
        return otherFilters;
      }

      return [...otherFilters, { id: columnId, value: newValues }];
    });
  };

  // Clear all filters
  const clearAllFilters = () => {
    setColumnFilters([]);
    setColumnMultiSelectValues({});
    setGlobalFilter("");
    setOpenDropdowns({});
  };

  // Clear specific column filter
  const clearColumnFilter = (columnId) => {
    setColumnFilters((prev) => prev.filter((f) => f.id !== columnId));
    setColumnMultiSelectValues((prev) => ({ ...prev, [columnId]: [] }));
  };

  // Error handling for missing data
  if (!data || !columns || data.length === 0) {
    return (
      <div className="rounded-lg shadow-lg bg-white p-8 text-center">
        <div className="text-red-500 text-lg font-semibold mb-2">
          ⚠️ Error: Server is down
        </div>
        <p className="text-gray-600">
          Unable to load table data. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg shadow-lg bg-white p-4 w-full">
      {/* Global Filter and Controls */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <input
              type="text"
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search entire table..."
              className="block w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pl-10"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 absolute left-3 top-3 text-gray-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-600 font-medium">
            **Showing {table.getFilteredRowModel().rows.length} total rows**
          </span>
          <button
            onClick={clearAllFilters}
            className="px-4 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors duration-200 font-medium"
          >
            Clear All Filters
          </button>
        </div>
      </div>

      {/* Active Filters Display */}
      {(columnFilters.length > 0 || globalFilter) && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-blue-800">
              Active Filters:
            </span>
            {globalFilter && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                <span className="font-medium">Global:</span>
                <span className="ml-1 truncate max-w-[80px]">
                  {globalFilter}
                </span>
                <button
                  onClick={() => setGlobalFilter("")}
                  className="ml-2 text-purple-600 hover:text-purple-800"
                >
                  ×
                </button>
              </span>
            )}
            {columnFilters.map((filter) => {
              const column = columns.find(
                (col) => col.accessorKey === filter.id
              );
              const filterValueCount = Array.isArray(filter.value)
                ? filter.value.length
                : 1;
              return (
                <span
                  key={filter.id}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  <span className="font-medium truncate max-w-[80px]">
                    {column?.header}:
                  </span>
                  <span className="ml-1">{filterValueCount} selected</span>
                  <button
                    onClick={() => clearColumnFilter(filter.id)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Table Content with Horizontal Scroll */}
      <div
        className="overflow-auto rounded-lg border border-gray-200"
        style={{ maxHeight: "600px" }}
      >
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0 z-10">
            {/* Column Headers */}
            <tr>
              {table.getHeaderGroups()[0].headers.map((header) => {
                const sortDirection = header.column.getIsSorted();
                const columnId = header.column.columnDef.accessorKey;
                const hasFilter = columnFilters.some((f) => f.id === columnId);

                return (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 last:border-r-0 min-w-[200px] relative"
                  >
                    <div className="flex items-center justify-between">
                      <div
                        className="flex items-center cursor-pointer hover:text-gray-700 flex-1"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <span className="truncate mr-2">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </span>
                        <span>
                          {sortDirection === "asc" ? (
                            <span className="text-blue-600">↑</span>
                          ) : sortDirection === "desc" ? (
                            <span className="text-blue-600">↓</span>
                          ) : (
                            <span className="text-gray-300">↕</span>
                          )}
                        </span>
                      </div>

                      {/* Filter Button */}
                      {columnId && (
                        <div
                          className="relative"
                          ref={(el) => (dropdownRefs.current[columnId] = el)}
                        >
                          <button
                            onClick={() => toggleDropdown(columnId)}
                            className={`ml-2 p-1 rounded hover:bg-gray-200 transition-colors ${
                              hasFilter
                                ? "text-blue-600 bg-blue-100"
                                : "text-gray-400"
                            }`}
                          >
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>

                          {/* Filter Dropdown */}
                          {openDropdowns[columnId] && (
                            <div className="absolute top-full right-0 mt-1 w-80 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-80 overflow-hidden">
                              <div className="p-3 border-b border-gray-200 bg-gray-50">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium text-sm text-gray-700">
                                    Filter {header.column.columnDef.header}
                                  </span>
                                  <button
                                    onClick={() => toggleDropdown(columnId)}
                                    className="text-gray-400 hover:text-gray-600"
                                  >
                                    ×
                                  </button>
                                </div>
                              </div>

                              <div className="p-2">
                                {/* Search within filter options */}
                                <div className="mb-2">
                                  <input
                                    type="text"
                                    placeholder="Search..."
                                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  />
                                </div>

                                <div className="max-h-60 overflow-y-auto">
                                  {/* Select All option */}
                                  <label className="flex items-center px-2 py-1 hover:bg-gray-50 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={
                                        !columnMultiSelectValues[columnId] ||
                                        columnMultiSelectValues[columnId]
                                          .length === 0 ||
                                        columnMultiSelectValues[columnId]
                                          .length ===
                                          getColumnFilterOptions[columnId]
                                            ?.length
                                      }
                                      onChange={(e) =>
                                        handleMultiSelectChange(
                                          columnId,
                                          "SELECT_ALL",
                                          e.target.checked
                                        )
                                      }
                                      className="mr-2 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <span className="text-sm font-medium text-blue-600">
                                      (Select All)
                                    </span>
                                  </label>

                                  {/* Individual options */}
                                  {getColumnFilterOptions[columnId]?.map(
                                    (option, idx) => {
                                      const isSelected =
                                        columnMultiSelectValues[
                                          columnId
                                        ]?.includes(option) ||
                                        !columnMultiSelectValues[columnId] ||
                                        columnMultiSelectValues[columnId]
                                          .length === 0;

                                      return (
                                        <label
                                          key={idx}
                                          className="flex items-center px-2 py-1 hover:bg-gray-50 cursor-pointer"
                                        >
                                          <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={(e) =>
                                              handleMultiSelectChange(
                                                columnId,
                                                option,
                                                e.target.checked
                                              )
                                            }
                                            className="mr-2 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                          />
                                          <span className="text-xs text-gray-700 truncate">
                                            {String(option).length > 30
                                              ? String(option).substring(
                                                  0,
                                                  30
                                                ) + "..."
                                              : String(option) || "(Empty)"}
                                          </span>
                                        </label>
                                      );
                                    }
                                  )}
                                </div>

                                {/* Filter Actions */}
                                <div className="flex justify-between pt-2 mt-2 border-t border-gray-200">
                                  <button
                                    onClick={() => clearColumnFilter(columnId)}
                                    className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                                  >
                                    Clear
                                  </button>
                                  <button
                                    onClick={() => toggleDropdown(columnId)}
                                    className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                  >
                                    Apply
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.map((row, idx) => (
              <tr
                key={row.id}
                className={`hover:bg-gray-50 transition-colors duration-150 ${
                  idx % 2 === 0 ? "bg-white" : "bg-gray-25"
                }`}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 border-r border-gray-100 last:border-r-0 min-w-[200px]"
                  >
                    <div className="truncate" title={String(cell.getValue())}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Enhanced Pagination */}
      <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 mt-4">
        <div className="flex flex-1 justify-between sm:hidden">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing{" "}
              <span className="font-medium">
                {table.getState().pagination.pageIndex *
                  table.getState().pagination.pageSize +
                  1}
              </span>{" "}
              to{" "}
              <span className="font-medium">
                {Math.min(
                  (table.getState().pagination.pageIndex + 1) *
                    table.getState().pagination.pageSize,
                  table.getFilteredRowModel().rows.length
                )}
              </span>{" "}
              of{" "}
              <span className="font-medium">
                {table.getFilteredRowModel().rows.length}
              </span>{" "}
              results
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <label htmlFor="page-size" className="text-sm text-gray-700">
                Show:
              </label>
              <select
                id="page-size"
                value={table.getState().pagination.pageSize}
                onChange={(e) => {
                  table.setPageSize(Number(e.target.value));
                }}
                className="rounded-md border-gray-300 text-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              >
                {[10, 20, 50, 100, 200].map((pageSize) => (
                  <option key={pageSize} value={pageSize}>
                    {pageSize}
                  </option>
                ))}
              </select>
            </div>
            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
              <button
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
                className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">First</span>
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M15.79 14.77a.75.75 0 01-1.06.02l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 111.04 1.08L11.832 10l3.938 3.71a.75.75 0 01.02 1.06zm-6 0a.75.75 0 01-1.06.02l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 111.04 1.08L5.832 10l3.938 3.71a.75.75 0 01.02 1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="relative inline-flex items-center px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Previous</span>
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300">
                {table.getState().pagination.pageIndex + 1} of{" "}
                {table.getPageCount()}
              </span>

              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="relative inline-flex items-center px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Next</span>
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <button
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
                className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Last</span>
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.21 5.23a.75.75 0 011.06-.02L9.832 10 5.894 14.29a.75.75 0 11-1.04-1.08L8.792 10 4.854 6.29a.75.75 0 01-.02-1.06zm6 0a.75.75 0 011.06-.02L15.832 10l-3.938 3.71a.75.75 0 11-1.04-1.08L14.792 10l-3.938-3.71a.75.75 0 01-.02-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
