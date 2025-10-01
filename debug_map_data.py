#!/usr/bin/env python3
"""
Debug script to understand map data structure
"""

import pandas as pd
import os

# Get the data directory
DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend", "data")

def debug_map_data():
    # Read the CSV file
    df = pd.read_csv(os.path.join(DATA_DIR, "transformed_transformer_data.csv"))
    print(f"Total rows in CSV: {len(df)}")
    
    # Check column names
    print("\nColumn names:")
    for i, col in enumerate(df.columns):
        print(f"{i+1:2d}. {col}")
    
    # Check a few rows
    print("\nFirst 3 rows:")
    for i in range(min(3, len(df))):
        print(f"\nRow {i}:")
        print(f"  Site Name: {df.iloc[i]['Site Name']}")
        print(f"  Site Voltage: {df.iloc[i]['Site Voltage']}")
        print(f"  Generation Headroom Mw: {df.iloc[i]['Generation Headroom Mw']}")
        print(f"  Licence Area: {df.iloc[i]['Licence Area']}")
        print(f"  Spatial Coordinates: {df.iloc[i]['Spatial Coordinates']}")

if __name__ == "__main__":
    debug_map_data()