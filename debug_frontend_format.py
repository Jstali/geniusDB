#!/usr/bin/env python3
"""
Debug script to test the map data endpoint with the exact format used by frontend
"""

import requests
import json

def debug_frontend_format():
    base_url = "http://localhost:8000"
    
    # Test with the exact format used by frontend
    payload = {
        "filters": {},
        "selected_columns": [
            "site_name", 
            "latitude", 
            "longitude", 
            "voltage_level", 
            "available_power", 
            "network_operator"
        ]
    }
    
    print("Testing endpoint with frontend format payload:")
    print(json.dumps(payload, indent=2))
    
    try:
        response = requests.post(
            f"{base_url}/api/views/View 1/map-data?user_id=1",
            json=payload,
            timeout=10
        )
        print(f"\nStatus Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response Data:")
            print(json.dumps(data, indent=2))
        else:
            print(f"Error Response: {response.text}")
    except Exception as e:
        print(f"Request failed: {e}")
        print(f"Error type: {type(e)}")
        
    # Test with a simple filter
    print("\n" + "="*50)
    print("Testing with a site name filter:")
    payload_with_filter = {
        "filters": {
            "site_name": [{"op": "contains", "value": "GRID"}]
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
    
    print("Payload with filter:")
    print(json.dumps(payload_with_filter, indent=2))
    
    try:
        response = requests.post(
            f"{base_url}/api/views/View 1/map-data?user_id=1",
            json=payload_with_filter,
            timeout=10
        )
        print(f"\nStatus Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response Data:")
            print(json.dumps(data, indent=2))
        else:
            print(f"Error Response: {response.text}")
    except Exception as e:
        print(f"Request failed: {e}")
        print(f"Error type: {type(e)}")

if __name__ == "__main__":
    debug_frontend_format()