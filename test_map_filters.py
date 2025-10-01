import requests
import json

# Test the new /api/map-data endpoint
def test_map_filters():
    base_url = "http://localhost:8001"  # Updated to port 8001
    
    # Test 1: No filters (should return all rows)
    print("Test 1: No filters")
    response = requests.post(f"{base_url}/api/map-data", json={})
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Count: {data.get('count', 0)}")
        print(f"First few rows: {data.get('rows', [])[:2] if data.get('rows') else []}")
    else:
        print(f"Error: {response.text}")
    print()
    
    # Test 2: Site name filter
    print("Test 2: Site name filter (BELCHAMP)")
    response = requests.post(f"{base_url}/api/map-data", json={
        "filters": {
            "site_name": "BELCHAMP"
        }
    })
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Count: {data.get('count', 0)}")
        print(f"Rows: {data.get('rows', [])}")
    else:
        print(f"Error: {response.text}")
    print()
    
    # Test 3: Voltage level filter
    print("Test 3: Voltage level filter (132)")
    response = requests.post(f"{base_url}/api/map-data", json={
        "filters": {
            "voltage_level": 132
        }
    })
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Count: {data.get('count', 0)}")
        print(f"First few rows: {data.get('rows', [])[:2] if data.get('rows') else []}")
    else:
        print(f"Error: {response.text}")
    print()
    
    # Test 4: Available power filter
    print("Test 4: Available power filter (>= 50)")
    response = requests.post(f"{base_url}/api/map-data", json={
        "filters": {
            "available_power": 50
        }
    })
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Count: {data.get('count', 0)}")
        print(f"First few rows: {data.get('rows', [])[:2] if data.get('rows') else []}")
    else:
        print(f"Error: {response.text}")
    print()
    
    # Test 5: Network operator filter
    print("Test 5: Network operator filter (Eastern Power Networks)")
    response = requests.post(f"{base_url}/api/map-data", json={
        "filters": {
            "network_operator": "Eastern Power Networks (EPN)"
        }
    })
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Count: {data.get('count', 0)}")
        print(f"First few rows: {data.get('rows', [])[:2] if data.get('rows') else []}")
    else:
        print(f"Error: {response.text}")
    print()
    
    # Test 6: Combined filters
    print("Test 6: Combined filters (BELCHAMP, >= 50)")
    response = requests.post(f"{base_url}/api/map-data", json={
        "filters": {
            "site_name": "BELCHAMP",
            "available_power": 50
        }
    })
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Count: {data.get('count', 0)}")
        print(f"Rows: {data.get('rows', [])}")
    else:
        print(f"Error: {response.text}")

if __name__ == "__main__":
    test_map_filters()