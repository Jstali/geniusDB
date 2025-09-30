"""Simple CSV to PostgreSQL loader script.

Usage:
  python load_csv_to_postgres.py /path/to/transformed_transformer_data.csv --table sites

This script reads the CSV and bulk-inserts into a PostgreSQL table using COPY.
Requires psycopg2 and proper DB_* environment variables (or .env file).
"""
import os
import sys
import argparse
import psycopg2
from dotenv import load_dotenv
import csv

load_dotenv()

DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = os.getenv('DB_PORT', '5432')
DB_NAME = os.getenv('DB_NAME', 'ukpn_opendata')
DB_USER = os.getenv('DB_USER', 'postgres')
DB_PASSWORD = os.getenv('DB_PASSWORD', '')

parser = argparse.ArgumentParser(description="Load CSV into Postgres using COPY")
parser.add_argument('csvfile', help='Path to CSV file')
parser.add_argument('--table', default='sites', help='Destination table name')
args = parser.parse_args()

if not DB_PASSWORD:
    print('DB_PASSWORD not set in environment. Set it in your .env or environment variables and retry.')
    sys.exit(1)

if not os.path.exists(args.csvfile):
    print(f"CSV file not found: {args.csvfile}")
    sys.exit(1)

conn = psycopg2.connect(host=DB_HOST, port=DB_PORT, database=DB_NAME, user=DB_USER, password=DB_PASSWORD)
cur = conn.cursor()

with open(args.csvfile, 'r', encoding='utf-8') as f:
    # Use COPY to load CSV. Assumes the CSV header matches the table columns.
    sql = f"COPY {args.table} FROM STDIN WITH CSV HEADER DELIMITER ','"
    try:
        cur.copy_expert(sql, f)
        conn.commit()
        print(f"Successfully loaded {args.csvfile} into {args.table}")
    except Exception as e:
        conn.rollback()
        print('Failed to load CSV:', e)
        raise
    finally:
        cur.close()
        conn.close()
