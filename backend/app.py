from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import json
import os

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
DATA_DIR = "data"

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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)