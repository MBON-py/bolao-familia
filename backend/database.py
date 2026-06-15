import os

import psycopg2
import psycopg2.extras
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.environ["DATABASE_URL"]


class DictConnection(psycopg2.extensions.connection):
    """Connection that returns dict-like rows and supports conn.execute(...)."""

    def execute(self, sql, params=None):
        cur = self.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute(sql, params)
        return cur


def get_conn():
    return psycopg2.connect(DATABASE_URL, connection_factory=DictConnection)


def init_db():
    conn = get_conn()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            phone TEXT NOT NULL,
            is_admin INTEGER NOT NULL DEFAULT 0,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        CREATE TABLE IF NOT EXISTS matches (
            id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            team_a TEXT NOT NULL,
            team_b TEXT NOT NULL,
            flag_a TEXT NOT NULL DEFAULT '',
            flag_b TEXT NOT NULL DEFAULT '',
            match_date TEXT NOT NULL,
            phase TEXT NOT NULL DEFAULT 'Fase de Grupos',
            group_name TEXT NOT NULL DEFAULT '',
            venue TEXT NOT NULL DEFAULT '',
            score_a INTEGER,
            score_b INTEGER,
            status TEXT NOT NULL DEFAULT 'scheduled'
        );
        CREATE TABLE IF NOT EXISTS predictions (
            id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            user_id BIGINT NOT NULL REFERENCES users(id),
            match_id BIGINT NOT NULL REFERENCES matches(id),
            score_a INTEGER NOT NULL,
            score_b INTEGER NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            UNIQUE(user_id, match_id)
        );
    """)
    conn.commit()
    conn.close()


def calc_points(pred_a, pred_b, real_a, real_b):
    if pred_a == real_a and pred_b == real_b:
        return 3
    p = (1 if pred_a > pred_b else (-1 if pred_a < pred_b else 0))
    r = (1 if real_a > real_b else (-1 if real_a < real_b else 0))
    return 1 if p == r and r != 0 else 0


def short_name(full_name: str) -> str:
    """'Maria da Silva Santos' -> 'Maria Santos'"""
    parts = full_name.strip().split()
    if len(parts) <= 2:
        return full_name.strip()
    return f"{parts[0]} {parts[-1]}"
