# Verification Script

## Prerequisites

1. Restart the backend server to pick up code changes
2. Ensure the frontend is running

## Manual Testing Steps

### 1. Test Basic Map Loading

1. Open the application in a browser
2. Navigate to the Map View
3. Verify that the map loads with markers

### 2. Test Site Name Filter

1. In the filter sidebar, enter "GRID" in the Site Name search box
2. Verify that:
   - Only sites with "GRID" in their name are displayed
   - Network tab shows the request with `{"filters": {"site_name": [{"op": "contains", "value": "GRID"}]}}`
   - Console logs show the filters being sent
   - Map markers update correctly

### 3. Test Voltage Level Filter

1. Select "33" kV from the Voltage Level checkboxes
2. Verify that:
   - Only sites with 33 kV voltage are displayed
   - Network tab shows the request with `{"filters": {"voltage_level": [{"op": "in", "value": [33]}]}}`
   - Console logs show the filters being sent
   - Map markers update correctly

### 4. Test Available Power Filter

1. Move the Available Power slider to 50 MW
2. Verify that:
   - Only sites with available power > 50 MW are displayed
   - Network tab shows the request with `{"filters": {"available_power": [{"op": ">", "value": 50}]}}`
   - Console logs show the filters being sent
   - Map markers update correctly

### 5. Test Network Operator Filter

1. Select "Eastern Power Networks (EPN)" from the Network Operators checkboxes
2. Verify that:
   - Only sites operated by EPN are displayed
   - Network tab shows the request with `{"filters": {"network_operator": [{"op": "in", "value": ["Eastern Power Networks (EPN)"]}]}}`
   - Console logs show the filters being sent
   - Map markers update correctly

### 6. Test Combined Filters

1. Apply all the above filters simultaneously
2. Verify that:
   - Only sites matching ALL filters are displayed
   - Network tab shows the request with all filters combined
   - Console logs show the filters being sent
   - Map markers update correctly

### 7. Test No Results Case

1. Enter a non-existent site name like "XYZNONEXISTENT"
2. Verify that:
   - "No sites match these filters" message is displayed
   - Response contains `{"count": 0, "rows": []}`
   - No markers are displayed on the map

### 8. Test Filter Clearing

1. Clear all filters
2. Verify that:
   - All sites are displayed again
   - Map markers show the full dataset

## Automated Testing

Run the automated test script:

```bash
cd /Users/stalin_j/geniusdb
python3 test_map_filters.py
```

This script tests:

- Basic request without filters
- Site name filter (contains)
- Voltage level filter (in)
- Available power filter (>)
- Network operator filter (in)
- Combined filters

## Expected Results

When the implementation is working correctly, you should see:

1. Map markers update in real-time as filters are applied
2. Network requests contain properly formatted filter objects
3. Backend responses contain `{"count": N, "rows": [...]}` format
4. Console logs show debugging information
5. "No sites match these filters" message appears when appropriate
6. All QA acceptance criteria are met

## Debugging

If issues occur, check:

1. Browser console for JavaScript errors
2. Network tab for request/response details
3. Backend logs for processing information
4. Verify that the server has picked up code changes
