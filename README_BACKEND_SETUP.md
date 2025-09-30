Quick backend & DB debug guide

1. Start FastAPI locally

# from repository root

cd backend

# set env (use .env file or export vars in shell)

uvicorn app:app --reload --host 0.0.0.0 --port 8000

2. Test the API

curl http://localhost:8000/health
curl http://localhost:8000/data/transformers
curl http://localhost:8000/process/transformers

3. Check DB row counts (psql)

psql "host=$DB_HOST port=$DB_PORT dbname=$DB_NAME user=$DB_USER" -c "SELECT COUNT(\*) FROM grid_and_primary_sites;"

4. Load CSV into Postgres (example)

# ensure DB env vars are set in .env or exported

python backend/scripts/load_csv_to_postgres.py backend/data/transformed_transformer_data.csv --table grid_and_primary_sites

Notes:

- The processing script logs stdout/stderr to FastAPI logs; check terminal where uvicorn is running.
- If the processing script fails, the /process/transformers endpoint now returns 500 and logs the stderr.
