import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "bolao.db")


def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


def init_db():
    conn = get_conn()
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            phone TEXT NOT NULL,
            is_admin INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
        CREATE TABLE IF NOT EXISTS matches (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
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
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            match_id INTEGER NOT NULL,
            score_a INTEGER NOT NULL,
            score_b INTEGER NOT NULL,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (match_id) REFERENCES matches(id),
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
    return 1 if p == r else 0


def short_name(full_name: str) -> str:
    """'Maria da Silva Santos' -> 'Maria Santos'"""
    parts = full_name.strip().split()
    if len(parts) <= 2:
        return full_name.strip()
    return f"{parts[0]} {parts[-1]}"
