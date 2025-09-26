import sys
from typing import Optional

import psycopg2


HOST = "127.0.0.1"
PORT = 5435
USER = "HiepData"
PASSWORD = "123456"

# Prefer db_fin as requested, fallback to historical name if needed
DB_CANDIDATES = ["db_fin", "db_fin_customer"]


def connect_any() -> Optional[psycopg2.extensions.connection]:
    last_err = None
    for dbname in DB_CANDIDATES:
        try:
            conn = psycopg2.connect(
                host=HOST,
                port=PORT,
                dbname=dbname,
                user=USER,
                password=PASSWORD,
            )
            conn.autocommit = True
            print(f"Connected to database: {dbname}")
            return conn
        except Exception as e:
            last_err = e
    if last_err:
        print(f"Failed to connect to any DB in {DB_CANDIDATES}: {last_err}")
    return None


DDL = """
CREATE TABLE IF NOT EXISTS customer_accounts (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL UNIQUE,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
"""


UPSERT = """
INSERT INTO customer_accounts(customer_id, username, password)
VALUES (%s, %s, %s)
ON CONFLICT (customer_id) DO UPDATE SET
  username = EXCLUDED.username,
  password = EXCLUDED.password,
  updated_at = NOW();
"""


def main() -> int:
    conn = connect_any()
    if conn is None:
        return 1

    try:
        with conn.cursor() as cur:
            cur.execute(DDL)

            data = [(i, f"khachhang{i}", "123456") for i in range(1, 501)]
            cur.executemany(UPSERT, data)

            cur.execute("SELECT COUNT(*) FROM customer_accounts;")
            total = cur.fetchone()[0]

            cur.execute(
                "SELECT customer_id, username FROM customer_accounts ORDER BY customer_id ASC LIMIT 5;"
            )
            sample = cur.fetchall()

            print(f"customer_accounts total rows: {total}")
            print(f"sample rows: {sample}")
    finally:
        conn.close()

    return 0


if __name__ == "__main__":
    sys.exit(main())


