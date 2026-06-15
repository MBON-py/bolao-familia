from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from database import get_conn, init_db, calc_points, short_name
from seed import seed
import psycopg2

seed()

app = FastAPI(title="Bolao da Familia - Copa 2026")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Schemas ---

class UserCreate(BaseModel):
    name: str
    email: str
    phone: str

class UserLogin(BaseModel):
    email: str

class PredictionCreate(BaseModel):
    user_id: int
    match_id: int
    score_a: int
    score_b: int

class MatchResultUpdate(BaseModel):
    score_a: int
    score_b: int

class MatchStatusUpdate(BaseModel):
    status: str

class UserAdminUpdate(BaseModel):
    is_admin: int

class MatchCreate(BaseModel):
    team_a: str
    team_b: str
    flag_a: str = ""
    flag_b: str = ""
    match_date: str
    phase: str = "Fase de Grupos"
    group_name: str = ""
    venue: str = ""

class MatchUpdate(BaseModel):
    team_a: str | None = None
    team_b: str | None = None
    flag_a: str | None = None
    flag_b: str | None = None
    match_date: str | None = None
    phase: str | None = None
    group_name: str | None = None
    venue: str | None = None


# --- Users ---

@app.post("/api/users/register")
def register(data: UserCreate):
    conn = get_conn()
    try:
        cur = conn.execute(
            "INSERT INTO users (name, email, phone) VALUES (%s, %s, %s) RETURNING *",
            (data.name.strip(), data.email.lower().strip(), data.phone.strip()),
        )
        user = cur.fetchone()
        conn.commit()
        user["short_name"] = short_name(user["name"])
        return user
    except psycopg2.IntegrityError:
        conn.rollback()
        raise HTTPException(400, "E-mail ja cadastrado")
    finally:
        conn.close()


@app.post("/api/users/login")
def login(data: UserLogin):
    conn = get_conn()
    row = conn.execute("SELECT * FROM users WHERE email=%s", (data.email.lower().strip(),)).fetchone()
    conn.close()
    if not row:
        raise HTTPException(404, "E-mail nao encontrado")
    user = dict(row)
    user["short_name"] = short_name(user["name"])
    return user


@app.get("/api/users")
def list_users():
    conn = get_conn()
    rows = conn.execute("SELECT * FROM users ORDER BY name").fetchall()
    conn.close()
    return [dict(r) | {"short_name": short_name(r["name"])} for r in rows]


@app.put("/api/users/{user_id}/admin")
def toggle_admin(user_id: int, data: UserAdminUpdate):
    conn = get_conn()
    user = conn.execute("SELECT * FROM users WHERE id=%s", (user_id,)).fetchone()
    if not user:
        conn.close()
        raise HTTPException(404, "Usuario nao encontrado")
    conn.execute("UPDATE users SET is_admin=%s WHERE id=%s", (data.is_admin, user_id))
    conn.commit()
    conn.close()
    return {"ok": True}


# --- Matches ---

@app.get("/api/matches")
def list_matches():
    conn = get_conn()
    rows = conn.execute("SELECT * FROM matches ORDER BY match_date, id").fetchall()
    conn.close()
    return [dict(r) for r in rows]


@app.post("/api/matches")
def add_match(data: MatchCreate):
    conn = get_conn()
    cur = conn.execute(
        """INSERT INTO matches (team_a,team_b,flag_a,flag_b,match_date,phase,group_name,venue)
           VALUES (%s,%s,%s,%s,%s,%s,%s,%s) RETURNING *""",
        (data.team_a, data.team_b, data.flag_a, data.flag_b, data.match_date, data.phase, data.group_name, data.venue),
    )
    row = cur.fetchone()
    conn.commit()
    conn.close()
    return row


@app.put("/api/matches/{match_id}")
def update_match(match_id: int, data: MatchUpdate):
    conn = get_conn()
    match = conn.execute("SELECT * FROM matches WHERE id=%s", (match_id,)).fetchone()
    if not match:
        conn.close()
        raise HTTPException(404, "Jogo nao encontrado")
    fields = {k: v for k, v in data.model_dump().items() if v is not None}
    if fields:
        set_clause = ", ".join(f"{k}=%s" for k in fields)
        conn.execute(f"UPDATE matches SET {set_clause} WHERE id=%s", (*fields.values(), match_id))
        conn.commit()
    row = dict(conn.execute("SELECT * FROM matches WHERE id=%s", (match_id,)).fetchone())
    conn.close()
    return row


@app.put("/api/matches/{match_id}/result")
def set_result(match_id: int, data: MatchResultUpdate):
    conn = get_conn()
    conn.execute(
        "UPDATE matches SET score_a=%s, score_b=%s, status='finished' WHERE id=%s",
        (data.score_a, data.score_b, match_id),
    )
    conn.commit()
    conn.close()
    return {"ok": True}


@app.put("/api/matches/{match_id}/status")
def set_status(match_id: int, data: MatchStatusUpdate):
    conn = get_conn()
    conn.execute("UPDATE matches SET status=%s WHERE id=%s", (data.status, match_id))
    conn.commit()
    conn.close()
    return {"ok": True}


# --- Predictions ---

@app.post("/api/predictions")
def save_prediction(data: PredictionCreate):
    conn = get_conn()
    match = conn.execute("SELECT status FROM matches WHERE id=%s", (data.match_id,)).fetchone()
    if not match or match["status"] != "scheduled":
        conn.close()
        raise HTTPException(400, "Jogo ja comecou ou nao existe")
    try:
        conn.execute(
            """INSERT INTO predictions (user_id, match_id, score_a, score_b)
               VALUES (%s,%s,%s,%s)
               ON CONFLICT (user_id, match_id)
               DO UPDATE SET score_a=EXCLUDED.score_a, score_b=EXCLUDED.score_b, created_at=now()""",
            (data.user_id, data.match_id, data.score_a, data.score_b),
        )
        conn.commit()
        return {"ok": True}
    finally:
        conn.close()


@app.get("/api/predictions/user/{user_id}")
def user_predictions(user_id: int):
    conn = get_conn()
    rows = conn.execute(
        """SELECT p.*, m.team_a, m.team_b, m.flag_a, m.flag_b, m.match_date,
                  m.phase, m.group_name, m.score_a as real_score_a, m.score_b as real_score_b, m.status
           FROM predictions p JOIN matches m ON p.match_id=m.id
           WHERE p.user_id=%s ORDER BY m.match_date""",
        (user_id,),
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


@app.get("/api/predictions/match/{match_id}")
def match_predictions(match_id: int):
    conn = get_conn()
    rows = conn.execute(
        """SELECT p.*, u.name as user_name
           FROM predictions p JOIN users u ON p.user_id=u.id
           WHERE p.match_id=%s ORDER BY u.name""",
        (match_id,),
    ).fetchall()
    conn.close()
    result = []
    for r in rows:
        d = dict(r)
        d["short_name"] = short_name(d["user_name"])
        result.append(d)
    return result


# --- Group Standings ---

@app.get("/api/standings")
def standings():
    conn = get_conn()
    groups = conn.execute(
        "SELECT DISTINCT group_name FROM matches WHERE phase='Fase de Grupos' ORDER BY group_name"
    ).fetchall()
    finished = conn.execute(
        "SELECT team_a, team_b, score_a, score_b, group_name FROM matches WHERE phase='Fase de Grupos' AND status='finished'"
    ).fetchall()
    all_matches = conn.execute(
        "SELECT team_a, team_b, flag_a, flag_b, group_name FROM matches WHERE phase='Fase de Grupos'"
    ).fetchall()
    conn.close()

    teams_by_group = {}
    for m in all_matches:
        g = m["group_name"]
        if g not in teams_by_group:
            teams_by_group[g] = {}
        for side in ("a", "b"):
            t = m[f"team_{side}"]
            if t not in teams_by_group[g]:
                teams_by_group[g][t] = {
                    "team": t, "flag": m[f"flag_{side}"],
                    "played": 0, "won": 0, "drawn": 0, "lost": 0,
                    "gf": 0, "ga": 0, "gd": 0, "points": 0,
                }

    for m in finished:
        g = m["group_name"]
        ta, tb = m["team_a"], m["team_b"]
        sa, sb = m["score_a"], m["score_b"]
        if ta not in teams_by_group.get(g, {}):
            continue
        for team, gfor, gagainst in [(ta, sa, sb), (tb, sb, sa)]:
            s = teams_by_group[g][team]
            s["played"] += 1
            s["gf"] += gfor
            s["ga"] += gagainst
            s["gd"] = s["gf"] - s["ga"]
            if gfor > gagainst:
                s["won"] += 1
                s["points"] += 3
            elif gfor == gagainst:
                s["drawn"] += 1
                s["points"] += 1
            else:
                s["lost"] += 1

    result = {}
    for g in sorted(teams_by_group.keys()):
        teams = list(teams_by_group[g].values())
        teams.sort(key=lambda t: (-t["points"], -t["gd"], -t["gf"], t["team"]))
        result[g] = teams
    return result


# --- Ranking ---

@app.get("/api/ranking")
def ranking():
    conn = get_conn()
    users = conn.execute("SELECT id, name FROM users ORDER BY name").fetchall()
    finished = conn.execute("SELECT id, score_a, score_b FROM matches WHERE status='finished'").fetchall()
    result = []
    for u in users:
        pts = exact = winner = games = 0
        for m in finished:
            pred = conn.execute(
                "SELECT score_a, score_b FROM predictions WHERE user_id=%s AND match_id=%s",
                (u["id"], m["id"]),
            ).fetchone()
            if pred:
                games += 1
                p = calc_points(pred["score_a"], pred["score_b"], m["score_a"], m["score_b"])
                pts += p
                if p == 3:
                    exact += 1
                elif p == 1:
                    winner += 1
        result.append({
            "user_id": u["id"],
            "name": u["name"],
            "short_name": short_name(u["name"]),
            "points": pts,
            "exact_hits": exact,
            "winner_hits": winner,
            "games_predicted": games,
        })
    result.sort(key=lambda x: (-x["points"], -x["exact_hits"], x["name"]))
    conn.close()
    return result
