#!/usr/bin/env python3
import os, sys, json, time, logging, hashlib, datetime
from io import StringIO
from typing import List, Tuple
import requests, pandas as pd, psycopg2
from dotenv import load_dotenv

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s",
                    handlers=[logging.StreamHandler(sys.stdout), logging.FileHandler("rebuild_schema.log")])
log = logging.getLogger("rebuild")

API_ENDPOINTS = {
    "grid_and_primary_sites": {"endpoint": "/grid-and-primary-sites", "pagination": {"max_per_page": 100}},
    "ukpn_embedded_capacity_register": {"endpoint": "/ukpn-embedded-capacity-register", "pagination": {"max_per_page": 100}},
    "ukpn_embedded_capacity_register_1_under_1mw": {"endpoint": "/ukpn-embedded-capacity-register-1-under-1mw", "pagination": {"max_per_page": 100}},
    "ltds_table_5_generation": {"endpoint": "/ltds-table-5-generation", "pagination": {"max_per_page": 100}},
    "ukpn_dnoa": {"endpoint": "/ukpn-dnoa", "pagination": {"max_per_page": 100}},
    "ukpn_ltds_infrastructure_projects": {"endpoint": "/ukpn-ltds-infrastructure-projects", "pagination": {"max_per_page": 100}},
    "ukpn_grid_supply_points_overview": {"endpoint": "/ukpn-grid-supply-points-overview", "pagination": {"max_per_page": 100}},
}

def md5_hex(s: str) -> str: return hashlib.md5(s.encode("utf-8")).hexdigest()
def canonical_row_json(row: dict) -> str: 
    # Convert numpy types to Python native types for JSON serialization
    clean_row = {}
    for k, v in row.items():
        if hasattr(v, 'item'):  # numpy scalar
            clean_row[k] = v.item()
        elif pd.isna(v):  # pandas NaN
            clean_row[k] = None
        else:
            clean_row[k] = v
    return json.dumps(clean_row, sort_keys=True, separators=(",", ":"))

def fetch_all(base, key, endpoint, limit=100) -> List[dict]:
    rows, offset = [], 0
    while True:
        url = f"{base.rstrip('/')}/{endpoint.lstrip('/')}/records/"
        resp = requests.get(url, params={"limit": limit, "offset": offset, "apikey": key}, timeout=60)
        if resp.status_code != 200: log.error("Fetch failed %s: %s %s", endpoint, resp.status_code, resp.text[:200]); break
        data = resp.json()
        page = data.get("results") or data.get("data") or data.get("items") or (data if isinstance(data, list) else [])
        if not page: break
        rows.extend(page)
        if len(page) < limit: break
        offset += limit; time.sleep(0.05)
    return rows

def union_columns(rows: List[dict]) -> List[str]:
    cols = set()
    for r in rows:
        if isinstance(r, dict): cols.update(r.keys())
    cols = sorted(cols)
    if "id" not in cols: cols = ["id"] + cols  # ensure id exists; will be NULL if absent
    return cols

def coerce(val): 
    if isinstance(val, (dict, list)): return json.dumps(val, ensure_ascii=False)
    return val

def df_with_meta(rows: List[dict], columns: List[str]) -> pd.DataFrame:
    df = pd.DataFrame(rows, columns=[c for c in columns if c != "id"])
    if "id" in columns:
        # ensure id column from original rows
        df.insert(0, "id", [str(r.get("id") if r else "") for r in rows] if rows else [])
    for c in df.columns: df[c] = df[c].apply(coerce)
    # guard: id cannot be null for PK
    if df.empty:
        df = pd.DataFrame(columns=["id"] + [c for c in columns if c != "id"])
    
    # Handle id column - generate unique IDs if missing or empty
    if "id" in df.columns:
        df["id"] = df["id"].astype(str).fillna("")
        # Generate unique IDs for rows with empty IDs or "None" values
        empty_id_mask = (df["id"].str.len() == 0) | (df["id"] == "None") | (df["id"] == "null") | (df["id"] == "NULL")
        if empty_id_mask.any():
            log.info(f"Found {empty_id_mask.sum()} rows with empty/None IDs, generating unique IDs")
            # Generate unique IDs based on row content hash
            for idx in df[empty_id_mask].index:
                row_data = {c: df.loc[idx, c] for c in df.columns if c != "id"}
                row_hash = md5_hex(canonical_row_json(row_data))[:12]  # Use first 12 chars of hash
                df.loc[idx, "id"] = f"gen_{row_hash}"
        
        # Final check - ensure no null or empty IDs remain
        final_null = df["id"].isnull().sum()
        final_empty = (df["id"].astype(str).str.len() == 0).sum()
        final_none = (df["id"] == "None").sum()
        if final_null > 0 or final_empty > 0 or final_none > 0:
            log.warning(f"Still have {final_null} null IDs, {final_empty} empty IDs, and {final_none} 'None' IDs after processing - forcing unique IDs")
            # Force fill any remaining nulls/empties/nones
            df["id"] = df["id"].fillna("").astype(str)
            problem_mask = (df["id"].str.len() == 0) | (df["id"] == "None") | (df["id"] == "null") | (df["id"] == "NULL")
            df.loc[problem_mask, "id"] = [f"force_{i}" for i in range(problem_mask.sum())]
    
    # hash (exclude meta)
    base_cols = [c for c in df.columns]
    df["__hash"] = [md5_hex(canonical_row_json({c:(r[c] if pd.notna(r[c]) else None) for c in base_cols})) for _, r in df[base_cols].iterrows()]
    df["__ingested_at"] = datetime.datetime.utcnow().isoformat(timespec="seconds")+"Z"
    return df

def psql(conn, sql, args=None):
    with conn.cursor() as cur: cur.execute(sql, args or ())

def table_exists(conn, schema, table) -> bool:
    with conn.cursor() as cur:
        cur.execute("""SELECT EXISTS (SELECT 1 FROM information_schema.tables
                     WHERE table_schema=%s AND table_name=%s);""", (schema, table))
        return cur.fetchone()[0]

def drop_or_archive(conn, schema, table, archive=True):
    fq = f'"{schema}"."{table}"'
    if not table_exists(conn, schema, table): return
    if archive:
        suffix = datetime.datetime.now().strftime("%Y%m%d%H%M")
        psql(conn, f'ALTER TABLE {fq} RENAME TO "{table}__bak_{suffix}";')
        log.info("Archived %s -> %s__bak_%s", fq, table, suffix)
    else:
        psql(conn, f"DROP TABLE {fq} CASCADE;"); log.info("Dropped %s", fq)

def create_table(conn, schema, table, columns: List[str]):
    fq = f'"{schema}"."{table}"'
    # id as TEXT NOT NULL primary key; other discovered columns as TEXT
    other_cols = [c for c in columns if c != "id"]
    col_defs = ['"id" TEXT NOT NULL'] + [f'"{c}" TEXT' for c in other_cols] + ['"__hash" TEXT', '"__ingested_at" TIMESTAMPTZ']
    psql(conn, f'CREATE TABLE {fq} ({", ".join(col_defs)}, PRIMARY KEY("id"));')

def copy_dataframe(conn, df: pd.DataFrame, schema: str, table: str):
    if df.empty: return
    fq = f'"{schema}"."{table}"'
    cols = list(df.columns)
    
    buf = StringIO(); df.to_csv(buf, index=False, header=False, na_rep="\\N"); buf.seek(0)
    with conn.cursor() as cur:
        cur.copy_expert(f"COPY {fq} ({', '.join([f'\"{c}\"' for c in cols])}) FROM STDIN WITH (FORMAT CSV, HEADER FALSE, DELIMITER ',')", buf)

def create_clean_view(conn, schema: str, table: str, columns: List[str]):
    view = f'"{schema}"."{table}__view"'; fq_table = f'"{schema}"."{table}"'
    select_cols = ", ".join([f'"{c}"' for c in (["id"] + [c for c in columns if c not in ["id"]])])
    psql(conn, f"DROP VIEW IF EXISTS {view};")
    psql(conn, f"CREATE VIEW {view} AS SELECT {select_cols} FROM {fq_table};")

def main():
    load_dotenv()
    api_base = os.getenv("API_BASE_URL"); api_key = os.getenv("API_KEY")
    db_name = os.getenv("DB_NAME"); db_host = os.getenv("DB_HOST","localhost")
    db_port = int(os.getenv("DB_PORT","5432")); db_user = os.getenv("DB_USER","postgres")
    db_password = os.getenv("DB_PASSWORD"); db_schema = os.getenv("DB_SCHEMA","public")
    ARCHIVE_OLD = os.getenv("ARCHIVE_OLD","true").lower()=="true"
    SEED_AFTER_CREATE = os.getenv("SEED_AFTER_CREATE","true").lower()=="true"
    if not all([api_base, api_key, db_name, db_password]): log.error("Missing env"); return 1

    conn = psycopg2.connect(host=db_host, port=db_port, dbname=db_name, user=db_user, password=db_password)
    conn.autocommit = False
    try:
        psql(conn, f'CREATE SCHEMA IF NOT EXISTS "{db_schema}";')
        total = 0
        for table, cfg in API_ENDPOINTS.items():
            ep = cfg["endpoint"]; limit = cfg.get("pagination",{}).get("max_per_page",100)
            log.info("=== Rebuilding %s ===", table)
            rows = fetch_all(api_base, api_key, ep, limit)
            cols = union_columns(rows)
            if "id" not in cols: log.warning("[%s] API has no 'id' column—generating unique IDs for all rows.", table)
            drop_or_archive(conn, db_schema, table, archive=ARCHIVE_OLD)
            create_table(conn, db_schema, table, cols)
            create_clean_view(conn, db_schema, table, cols)
            if SEED_AFTER_CREATE:
                df = df_with_meta(rows, cols)
                # No need to filter empty IDs since we now generate unique IDs for them
                copy_dataframe(conn, df, db_schema, table); total += len(df)
                log.info("[%s] seeded %d rows", table, len(df))
            conn.commit(); log.info("[%s] done.", table)
        log.info("Rebuild complete. Seeded rows: %d", total); return 0
    except Exception as e:
        conn.rollback(); log.exception("Rebuild failed: %s", e); return 2
    finally:
        conn.close()

if __name__ == "__main__": sys.exit(main())
