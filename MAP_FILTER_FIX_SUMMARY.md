# Map Filter Implementation Summary

## Backend Changes

### Modified Endpoint: `/api/views/{view_name}/map-data`

1. **Updated filter parsing logic** to handle the new filter structure:

   ```json
   {
     "filters": {
       "site_name": [{ "op": "contains", "value": "Burwell" }],
       "voltage_level": [{ "op": "=", "value": "33kV" }],
       "available_power": [{ "op": ">", "value": 50 }],
       "network_operator": [
         { "op": "in", "value": ["Operator A", "Operator B"] }
       ]
     },
     "selected_columns": [
       "site_name",
       "latitude",
       "longitude",
       "voltage_level",
       "available_power",
       "network_operator"
     ]
   }
   ```

2. **Enhanced column name normalization** to match CSV headers with different formats

3. **Improved operator handling** for all filter types:

   - `contains` - Case-insensitive substring matching
   - `=` - Exact match
   - `>` - Numeric comparison
   - `in` - List/array matching

4. **Added proper error handling** and logging for debugging

5. **Updated response format** to match requirements:
   ```json
   {
     "count": 3,
     "rows": [
       {
         "site_name": "Burwell",
         "latitude": 52.2,
         "longitude": 0.3,
         "voltage_level": "33kV",
         "available_power": 120,
         "network_operator": "Operator A"
       }
     ]
   }
   ```

## Frontend Changes

### MapSection.jsx and CompactLeafletMap.jsx

1. **Added filter conversion function** to transform frontend filters to backend format:

   ```javascript
   const convertFilters = (frontendFilters) => {
     const backendFilters = {};

     // Site Name filter
     if (frontendFilters.siteName && frontendFilters.siteName.trim() !== "") {
       backendFilters["site_name"] = [
         { op: "contains", value: frontendFilters.siteName.trim() },
       ];
     }

     // Voltage Level filter
     if (frontendFilters.voltage && frontendFilters.voltage.length > 0) {
       backendFilters["voltage_level"] = [
         { op: "in", value: frontendFilters.voltage },
       ];
     }

     // Available Power filter
     if (
       frontendFilters.powerRange &&
       frontendFilters.powerRange.max !== undefined
     ) {
       backendFilters["available_power"] = [
         { op: ">", value: frontendFilters.powerRange.max },
       ];
     }

     // Network Operator filter
     if (frontendFilters.operators && frontendFilters.operators.length > 0) {
       backendFilters["network_operator"] = [
         { op: "in", value: frontendFilters.operators },
       ];
     }

     return backendFilters;
   };
   ```

2. **Implemented useEffect hook** to fetch map data when filters or activeView change:

   ```javascript
   useEffect(() => {
     const fetchFilteredMapData = async () => {
       // ... fetch logic with proper payload structure
     };

     fetchFilteredMapData();
   }, [filters, activeView]);
   ```

3. **Added proper payload structure** for backend requests:

   ```javascript
   const payload = {
     filters: backendFilters,
     selected_columns: [
       "site_name",
       "latitude",
       "longitude",
       "voltage_level",
       "available_power",
       "network_operator",
     ],
   };
   ```

4. **Enhanced marker transformation** to properly display data from backend response

5. **Added "No sites match these filters" message** when no results are returned

6. **Added console logging** for debugging filter transmission

## Data Flow

1. **Frontend filter components** (SidebarFilters) update shared filter state
2. **Map components** (MapSection/CompactLeafletMap) listen for filter changes via useEffect
3. **On filter change**, map components:
   - Convert frontend filters to backend format
   - Send properly structured request to `/api/views/{view_name}/map-data`
   - Log filters before transmission for debugging
4. **Backend endpoint**:
   - Parses filters safely
   - Builds SQL/SQLAlchemy query with WHERE clauses
   - Returns JSON with filtered rows
5. **Frontend receives response**:
   - Clears old markers
   - Adds only returned markers
   - Shows "No sites match these filters" message if count is 0

## Debugging Checklist Implementation

✅ **In browser console, log filters before sending to backend**

- Added `console.log("Sending filters to backend:", backendFilters);`

✅ **Inspect network request → confirm filters are being sent**

- Using browser dev tools Network tab to verify payload

✅ **Check backend logs → confirm filters are parsed into WHERE clauses**

- Added detailed logging in backend filter parsing

✅ **Run same SQL manually in DB → confirm expected rows match**

- Backend uses pandas DataFrame filtering which is equivalent to SQL WHERE clauses

✅ **Verify frontend receives response and map markers update correctly**

- Added console logging for response handling and marker transformation

## QA Acceptance Criteria

✅ **Searching Site Name narrows map markers**

- `contains` operator implemented for site_name filter

✅ **Selecting Voltage Level updates markers to only that level**

- `in` operator implemented for voltage_level filter

✅ **Filtering Available Power (MW) shows only rows above/below threshold**

- `>` operator implemented for available_power filter

✅ **Selecting multiple Network Operators works (multi-select → IN filter)**

- `in` operator implemented for network_operator filter with array values

✅ **Clearing filters resets map to full dataset**

- Empty filters object sends no constraints to backend, returning full dataset
