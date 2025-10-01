// Test script to verify frontend-backend communication for filters
console.log("=== Frontend Filter Test Script ===");

// Test 1: Check if we can access the API base URL
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";
console.log("API Base URL:", API_BASE);

// Test 2: Try to make a request to the backend with filters
async function testFilterRequest() {
  try {
    console.log("Testing filter request...");

    // Test data with filters
    const testData = {
      filters: {
        site_name: "Substation",
      },
    };

    console.log("Sending request with data:", testData);

    const response = await fetch(`${API_BASE}/api/map-data`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testData),
    });

    console.log("Response status:", response.status);

    if (response.ok) {
      const result = await response.json();
      console.log("Success! Received data with", result.count, "rows");
      console.log("First few rows:", result.rows.slice(0, 3));
    } else {
      console.error("Request failed with status:", response.status);
      const errorText = await response.text();
      console.error("Error response:", errorText);
    }
  } catch (error) {
    console.error("Request failed with error:", error);
  }
}

// Test 3: Try different filter combinations
async function testMultipleFilters() {
  try {
    console.log("Testing multiple filters...");

    // Test data with multiple filters
    const testData = {
      filters: {
        site_name: "Substation",
        voltage_level: 33,
        available_power: 10,
        network_operator: "Eastern Power Networks (EPN)",
      },
    };

    console.log("Sending request with multiple filters:", testData);

    const response = await fetch(`${API_BASE}/api/map-data`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testData),
    });

    console.log("Response status:", response.status);

    if (response.ok) {
      const result = await response.json();
      console.log("Success! Received data with", result.count, "rows");
      console.log("First few rows:", result.rows.slice(0, 3));
    } else {
      console.error("Request failed with status:", response.status);
      const errorText = await response.text();
      console.error("Error response:", errorText);
    }
  } catch (error) {
    console.error("Request failed with error:", error);
  }
}

// Run the tests
console.log("Running filter tests...");
testFilterRequest()
  .then(() => {
    console.log("First test completed");
    return testMultipleFilters();
  })
  .then(() => {
    console.log("All tests completed");
  })
  .catch((error) => {
    console.error("Test error:", error);
  });
