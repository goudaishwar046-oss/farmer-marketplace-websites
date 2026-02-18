#!/usr/bin/env python3
import os
import re
import requests
import json
from pathlib import Path

# Read environment variables
SUPABASE_URL = "https://oeadhywwkcqrtcvksrsl.supabase.co"
SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lYWRoeXd3a2NxcnRjdmtzcnNsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTA3NjE1NCwiZXhwIjoyMDg0NjUyMTU0fQ.WU0JPqAQEWId6Jj-oglHS0GG1WSK8Qv-rolKHMo8PM0"

# Read the migration SQL
sql_file = Path("scripts/create-tables.sql")
with open(sql_file, "r") as f:
    sql_content = f.read()

# Split by semicolons and filter out comments/empty statements
statements = [s.strip() for s in sql_content.split(";") if s.strip() and not s.strip().startswith("--")]

# Headers for API requests
headers = {
    "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
    "Content-Type": "application/json",
    "ApiKey": SERVICE_ROLE_KEY  # Some Supabase endpoints require ApiKey header too
}

print(f"Found {len(statements)} SQL statements to execute.")

success_count = 0
error_count = 0

for idx, stmt in enumerate(statements, 1):
    # Skip very short statements (likely just comments)
    if len(stmt) < 10:
        continue
    
    stmt_preview = stmt[:80].replace("\n", " ") + ("..." if len(stmt) > 80 else "")
    print(f"\n[{idx}] Executing: {stmt_preview}")
    
    try:
        # Use the SQL RPC endpoint (if available) or direct query endpoint
        # Supabase doesn't have a direct SQL execution endpoint via REST in older versions
        # Instead, we'll try the rpc/exec_sql if configured
        response = requests.post(
            f"{SUPABASE_URL}/rest/v1/rpc/exec_sql",
            headers=headers,
            json={"sql": stmt},
            timeout=10
        )
        
        if response.status_code in (200, 204):
            print(f"    ✓ Success (status: {response.status_code})")
            success_count += 1
        else:
            print(f"    ✗ Error (status: {response.status_code})")
            print(f"    Response: {response.text[:200]}")
            error_count += 1
    except Exception as e:
        print(f"    ✗ Exception: {str(e)}")
        error_count += 1

print(f"\n\n=== Migration Summary ===")
print(f"Successful statements: {success_count}")
print(f"Failed statements: {error_count}")
print(f"\nNote: If all statements failed, the rpc/exec_sql endpoint may not be available.")
print(f"To manually run the migration, visit https://app.supabase.com/sql/project and paste scripts/create-tables.sql")
