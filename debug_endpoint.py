#!/usr/bin/env python3
"""
Debug script to test the map data endpoint directly
"""

import requests
import json

def debug_endpoint():
    base_url = "http://localhost:8000"
    
    # Test with a simple request
    payload = {
        "selected_columns": [
            "site_name", 
            "latitude", 
            "longitude", 
            "voltage_level", 
            "available_power", 
            "network_operator"
        ]
    }
    
    print("Testing endpoint with payload:")
    print(json.dumps(payload, indent=2))
    
    try:
        response = requests.post(
            f"{base_url}/api/views/View 1/map-data?user_id=1",
            json=payload,
            timeout=10
        )
        print(f"\nStatus Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
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
    debug_endpoint()