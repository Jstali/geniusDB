// Test script to verify frontend filter functionality
// This would be run in the browser console

// Function to simulate filter changes and check what gets sent to backend
function testFilterSending() {
  console.log("Testing filter sending to backend...");

  // Mock the fetch function to capture what gets sent
  const originalFetch = window.fetch;
  window.fetch = function (url, options) {
    console.log("Fetch called with:", { url, options });
    if (options && options.body) {
      try {
        const body = JSON.parse(options.body);
        console.log("Request body:", body);
      } catch (e) {
        console.log("Request body (non-JSON):", options.body);
      }
    }
    return originalFetch.apply(this, arguments);
  };

  console.log("Mock fetch installed. Now test the filters in the UI.");
  console.log("Check the console for filter data being sent to the backend.");
}

// Function to test filter conversion
function testFilterConversion() {
  // Example filter objects that might be sent from frontend
  const testFilters = [
    // No filters
    {},

    // Site name only
    { siteName: "DELHI" },

    // Voltage level only
    { voltage: 132 },

    // Available power only
    { powerRange: { min: 100 } },

    // Network operator only
    { operators: "TATA" },

    // All filters
    {
      siteName: "DELHI",
      voltage: 33,
      powerRange: { min: 100 },
      operators: "TATA",
    },
  ];

  console.log("Testing filter conversion...");

  // Simulate the convertFilters function from CompactLeafletMap.jsx
  function convertFilters(frontendFilters) {
    const backendFilters = {};

    // Site Name filter
    if (frontendFilters.siteName && frontendFilters.siteName.trim() !== "") {
      backendFilters["site_name"] = frontendFilters.siteName.trim();
    }

    // Voltage Level filter
    if (frontendFilters.voltage && frontendFilters.voltage !== "") {
      backendFilters["voltage_level"] = frontendFilters.voltage;
    }

    // Available Power filter
    if (
      frontendFilters.powerRange &&
      frontendFilters.powerRange.min !== undefined &&
      frontendFilters.powerRange.min > 0
    ) {
      backendFilters["available_power"] = frontendFilters.powerRange.min;
    }

    // Network Operator filter
    if (frontendFilters.operators && frontendFilters.operators !== "") {
      backendFilters["network_operator"] = frontendFilters.operators;
    }

    return backendFilters;
  }

  testFilters.forEach((filters, index) => {
    const converted = convertFilters(filters);
    console.log(`Test ${index + 1}:`, { original: filters, converted });
  });
}

// Run the tests
console.log("Frontend Filter Testing");
console.log("=====================");
testFilterConversion();
console.log("\nTo test actual network requests, run:");
console.log("testFilterSending();");
console.log("Then interact with the filter UI.");
