from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import json
import os
import subprocess
import sys

app = FastAPI(title="Genius DB API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load data files
import os
DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")

@app.get("/")
def read_root():
    return {"message": "Welcome to Genius DB API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.get("/data/columns")
def get_columns():
    try:
        with open(os.path.join(DATA_DIR, "table_to_columns_mapping.json")) as f:
            data = json.load(f)
        return data
    except Exception as e:
        return {"error": str(e)}

@app.get("/data/aggregated")
def get_aggregated_data():
    try:
        with open(os.path.join(DATA_DIR, "aggregated_columns.json")) as f:
            data = json.load(f)
        return data
    except Exception as e:
        return {"error": str(e)}

@app.get("/data/calculated")
def get_calculated_data():
    try:
        with open(os.path.join(DATA_DIR, "calculated_columns.json")) as f:
            data = json.load(f)
        return data
    except Exception as e:
        return {"error": str(e)}

@app.get("/data/map")
def get_map_data():
    try:
        # Read the CSV file
        df = pd.read_csv(os.path.join(DATA_DIR, "transformed_transformer_data.csv"))
        
        # Extract map data with coordinates
        map_data = []
        for index, row in df.iterrows():
            # Get spatial coordinates
            spatial_coords = row.get('Spatial Coordinates')
            if pd.isna(spatial_coords) or spatial_coords == '\\N':
                continue
                
            # Parse coordinates (format: "lat, lng")
            try:
                coords = spatial_coords.strip('"').split(', ')
                if len(coords) == 2:
                    lat = float(coords[0])
                    lng = float(coords[1])
                    
                    # Skip invalid coordinates
                    if pd.isna(lat) or pd.isna(lng):
                        continue
                    
                    # Get site name
                    site_name = row.get('Site Name', f'Site {index}')
                    if pd.isna(site_name):
                        site_name = f'Site {index}'
                    
                    # Get additional information
                    site_type = row.get('Site Type', 'Unknown')
                    if pd.isna(site_type):
                        site_type = 'Unknown'
                        
                    site_voltage = row.get('Site Voltage', 'Unknown')
                    if pd.isna(site_voltage):
                        site_voltage = 'Unknown'
                        
                    county = row.get('County', 'Unknown')
                    if pd.isna(county):
                        county = 'Unknown'
                    
                    # Get Generation Headroom Mw value
                    generation_headroom = row.get('Generation Headroom Mw', None)
                    if pd.isna(generation_headroom):
                        generation_headroom = None
                    
                    # Get Bulk Supply Point
                    bulk_supply_point = row.get('Bulk Supply Point', None)
                    if pd.isna(bulk_supply_point):
                        bulk_supply_point = None
                        
                    # Get Constraint Description
                    constraint_description = row.get('Constraint description', None)
                    if pd.isna(constraint_description):
                        constraint_description = None
                        
                    # Get Licence Area (Network Operator)
                    licence_area = row.get('Licence Area', None)
                    if pd.isna(licence_area):
                        licence_area = None
                    
                    map_data.append({
                        "id": index,
                        "position": [lat, lng],
                        "site_name": site_name,
                        "site_type": site_type,
                        "site_voltage": site_voltage,
                        "county": county,
                        "generation_headroom": generation_headroom,
                        "popup_text": f"{site_name} ({site_type})",
                        "bulk_supply_point": bulk_supply_point,
                        "constraint_description": constraint_description,
                        "licence_area": licence_area
                    })
            except (ValueError, IndexError):
                # Skip rows with invalid coordinates
                continue
                
        return map_data
    except Exception as e:
        return {"error": str(e)}

@app.get("/data/transformers")
def get_transformer_data():
    try:
        # Read the CSV file
        df = pd.read_csv(os.path.join(DATA_DIR, "transformed_transformer_data.csv"))
        
        # Comprehensive NaN and infinite value handling
        # Replace infinite values with None
        df = df.replace([float('inf'), float('-inf')], None)
        
        # Replace NaN values with None using multiple approaches
        df = df.where(pd.notna(df), None)
        
        # Additional check for any remaining problematic values
        for col in df.columns:
            if df[col].dtype == 'object':
                # For object columns, replace any string representations of nan
                df[col] = df[col].replace(['nan', 'NaN', 'null', 'None'], None)
        
        # Convert DataFrame to list of dictionaries
        transformer_data = df.to_dict('records')
        
        # Additional cleaning of the records to ensure JSON compliance
        for record in transformer_data:
            for key, value in record.items():
                # Check for any remaining float values that might be problematic
                if isinstance(value, float):
                    if pd.isna(value):  # Use pd.isna instead of pd.isfinite
                        record[key] = None
        
        return transformer_data
    except Exception as e:
        return {"error": str(e)}

@app.get("/process/transformers")
def process_transformer_data():
    try:
        import subprocess
        import sys
        import os
        
        # Run the grid_and_primary_calculated.py script
        # Get the directory of the current script
        current_dir = os.path.dirname(os.path.abspath(__file__))
        script_path = os.path.join(current_dir, "grid_and_primary_calculated.py")
        
        # Run the script
        result = subprocess.run([sys.executable, script_path], 
                              cwd=current_dir, capture_output=True, text=True, timeout=300)  # 5 minute timeout
        
        if result.returncode == 0:
            return {"status": "success", "message": "Data processed successfully"}
        else:
            return {"status": "error", "message": f"Script failed with return code {result.returncode}: {result.stderr}"}
    except subprocess.TimeoutExpired:
        return {"status": "error", "message": "Script execution timed out after 5 minutes"}
    except Exception as e:
        return {"status": "error", "message": f"Failed to execute script: {str(e)}"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)