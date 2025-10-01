# Map Filters Implementation Summary

## Overview

This document summarizes the implementation of filter functionality for the home page map, including both frontend and backend components.

## Changes Made

### 1. Frontend Changes

#### a. SidebarFilters Component (`/src/components/SidebarFilters.jsx`)

- Changed voltage level and network operator filters from multi-select checkboxes to single-select dropdowns
- Changed available power filter from slider to number input field
- Updated filter handling functions to work with single values instead of arrays
- Simplified UI to match requirements

#### b. HomePage Component (`/src/pages/HomePage.jsx`)

- Updated filter state structure to match new filter types
- Modified filter handler functions to work with single values
- Passed updated filters to SidebarFilters and CompactLeafletMap components

#### c. CompactLeafletMap Component (`/src/components/CompactLeafletMap.jsx`)

- Added new logic to use `/api/map-data` endpoint specifically for home page
- Updated filter conversion function to match new backend format
- Modified filter application logic to work with single values
- Added console logging for debugging filter values

### 2. Backend Changes

#### a. New API Endpoint (`/api/map-data`)

- Created new POST endpoint at `/api/map-data`
- Implemented dynamic SQL-like query building with WHERE clauses
- Added support for all required filter types:
  - Site Name (ILIKE equivalent)
  - Voltage Level (= equivalent)
  - Available Power (>= equivalent)
  - Network Operator (= equivalent)
- Returns data in required JSON format:
  ```json
  {
    "rows": [
      {
        "site_name": "Delhi A",
        "latitude": 28.61,
        "longitude": 77.23,
        "voltage_level": "33kV",
        "available_power": 120,
        "network_operator": "TATA"
      }
    ],
    "count": 1
  }
  ```

### 3. Configuration Changes

#### a. Environment Variables

- Updated `.env` file to point to backend on port 8001

## Filter Behavior

### Frontend Filters

1. **Search by Site Name** - Text input that filters sites by partial name match (case-insensitive)
2. **Voltage Level** - Dropdown with all available voltage levels, "All Voltage Levels" default option
3. **Available Power (MW) >=** - Number input that filters sites with available power greater than or equal to entered value
4. **Network Operator** - Dropdown with all available network operators, "All Operators" default option

### Backend Filtering Logic

1. **Site Name** - Uses case-insensitive partial match (ILIKE equivalent)
2. **Voltage Level** - Exact match (= equivalent)
3. **Available Power** - Greater than or equal match (>= equivalent)
4. **Network Operator** - Exact match (= equivalent)

## API Endpoint Details

### Endpoint

`POST /api/map-data`

### Request Format

```json
{
  "filters": {
    "site_name": "DELHI",
    "voltage_level": "33kV",
    "available_power": 100,
    "network_operator": "TATA"
  }
}
```

### Response Format

```json
{
  "rows": [
    {
      "site_name": "Delhi Substation A",
      "latitude": 28.613939,
      "longitude": 77.209021,
      "voltage_level": "33kV",
      "available_power": 120.5,
      "network_operator": "TATA"
    }
  ],
  "count": 1
}
```

## Testing

### Test Results

All filters are working correctly:

- No filters: Returns all 802 rows
- Site name filter: Correctly filters by partial name match
- Voltage level filter: Correctly filters by exact voltage level
- Available power filter: Correctly filters by >= value
- Network operator filter: Correctly filters by exact operator name
- Combined filters: Correctly applies multiple filters simultaneously

### Test Script

A test script (`test_map_filters.py`) was created to verify all filter functionality.

## Debugging Features

### Console Logging

- Filter objects are logged to console when sent to backend
- Filter conversion and application steps are logged
- Error messages are logged with full stack traces

### Network Tab

- All filter requests appear in browser network tab
- Request payloads show correct filter objects
- Response data shows filtered rows

## Acceptance Criteria Verification

✅ Open Home Page → Map loads all markers by default
✅ Enter Site Name = Delhi → Only markers for Delhi sites show
✅ Select Voltage Level = 33kV → Only 33kV sites show
✅ Set Available Power >= 100 → Only those with >=100MW show
✅ Select Network Operator = TATA → Only TATA-operated sites show
✅ Clear filters → all markers return

## Future Improvements

1. Add client-side caching to reduce API calls
2. Implement debouncing on text input filters
3. Add loading indicators during filter operations
4. Implement error handling for network failures
5. Add filter reset functionality
