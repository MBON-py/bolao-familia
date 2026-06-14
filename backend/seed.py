from database import init_db, get_conn

FLAGS = {
    "México": "\U0001f1f2\U0001f1fd", "África do Sul": "\U0001f1ff\U0001f1e6",
    "Canadá": "\U0001f1e8\U0001f1e6", "Bósnia": "\U0001f1e7\U0001f1e6",
    "EUA": "\U0001f1fa\U0001f1f8", "Paraguai": "\U0001f1f5\U0001f1fe",
    "Coreia do Sul": "\U0001f1f0\U0001f1f7", "República Tcheca": "\U0001f1e8\U0001f1ff",
    "Brasil": "\U0001f1e7\U0001f1f7", "Marrocos": "\U0001f1f2\U0001f1e6",
    "Haiti": "\U0001f1ed\U0001f1f9", "Escócia": "\U0001f3f4\U000e0067\U000e0062\U000e0073\U000e0063\U000e0074\U000e007f",
    "Catar": "\U0001f1f6\U0001f1e6", "Suíça": "\U0001f1e8\U0001f1ed",
    "Austrália": "\U0001f1e6\U0001f1fa", "Turquia": "\U0001f1f9\U0001f1f7",
    "Alemanha": "\U0001f1e9\U0001f1ea", "Curaçao": "\U0001f1e8\U0001f1fc",
    "Costa do Marfim": "\U0001f1e8\U0001f1ee", "Equador": "\U0001f1ea\U0001f1e8",
    "Holanda": "\U0001f1f3\U0001f1f1", "Japão": "\U0001f1ef\U0001f1f5",
    "Suécia": "\U0001f1f8\U0001f1ea", "Tunísia": "\U0001f1f9\U0001f1f3",
    "Bélgica": "\U0001f1e7\U0001f1ea", "Egito": "\U0001f1ea\U0001f1ec",
    "Irã": "\U0001f1ee\U0001f1f7", "Nova Zelândia": "\U0001f1f3\U0001f1ff",
    "Espanha": "\U0001f1ea\U0001f1f8", "Cabo Verde": "\U0001f1e8\U0001f1fb",
    "Arábia Saudita": "\U0001f1f8\U0001f1e6", "Uruguai": "\U0001f1fa\U0001f1fe",
    "França": "\U0001f1eb\U0001f1f7", "Senegal": "\U0001f1f8\U0001f1f3",
    "Iraque": "\U0001f1ee\U0001f1f6", "Noruega": "\U0001f1f3\U0001f1f4",
    "Argentina": "\U0001f1e6\U0001f1f7", "Argélia": "\U0001f1e9\U0001f1ff",
    "Áustria": "\U0001f1e6\U0001f1f9", "Jordânia": "\U0001f1ef\U0001f1f4",
    "Portugal": "\U0001f1f5\U0001f1f9", "RD Congo": "\U0001f1e8\U0001f1e9",
    "Uzbequistão": "\U0001f1fa\U0001f1ff", "Colômbia": "\U0001f1e8\U0001f1f4",
    "Inglaterra": "\U0001f3f4\U000e0067\U000e0062\U000e0065\U000e006e\U000e0067\U000e007f",
    "Croácia": "\U0001f1ed\U0001f1f7", "Gana": "\U0001f1ec\U0001f1ed",
    "Panamá": "\U0001f1f5\U0001f1e6",
}

# (team_a, team_b, date YYYY-MM-DD HH:MM, group, venue, phase)
ALL_MATCHES = [
    # ===== FASE DE GRUPOS (72 jogos) =====
    # Rodada 1
    ("México", "África do Sul", "2026-06-11 16:00", "A", "Estádio Azteca, Cidade do México", "Fase de Grupos"),
    ("Canadá", "Bósnia", "2026-06-12 17:00", "B", "BMO Field, Toronto", "Fase de Grupos"),
    ("EUA", "Paraguai", "2026-06-12 20:00", "D", "SoFi Stadium, Los Angeles", "Fase de Grupos"),
    ("Coreia do Sul", "República Tcheca", "2026-06-12 14:00", "A", "Estadio Akron, Guadalajara", "Fase de Grupos"),
    ("Brasil", "Marrocos", "2026-06-13 16:00", "C", "MetLife Stadium, Nova Jersey", "Fase de Grupos"),
    ("Haiti", "Escócia", "2026-06-13 19:00", "C", "NRG Stadium, Houston", "Fase de Grupos"),
    ("Catar", "Suíça", "2026-06-13 13:00", "B", "BC Place, Vancouver", "Fase de Grupos"),
    ("Austrália", "Turquia", "2026-06-13 20:00", "D", "Levi's Stadium, São Francisco", "Fase de Grupos"),
    ("Alemanha", "Curaçao", "2026-06-14 13:00", "E", "Gillette Stadium, Boston", "Fase de Grupos"),
    ("Costa do Marfim", "Equador", "2026-06-14 16:00", "E", "Lincoln Financial Field, Filadélfia", "Fase de Grupos"),
    ("Holanda", "Japão", "2026-06-14 19:00", "F", "Lumen Field, Seattle", "Fase de Grupos"),
    ("Suécia", "Tunísia", "2026-06-14 20:00", "F", "Hard Rock Stadium, Miami", "Fase de Grupos"),
    ("Bélgica", "Egito", "2026-06-15 13:00", "G", "Mercedes-Benz Stadium, Atlanta", "Fase de Grupos"),
    ("Irã", "Nova Zelândia", "2026-06-15 16:00", "G", "GEHA Field, Kansas City", "Fase de Grupos"),
    ("Espanha", "Cabo Verde", "2026-06-15 19:00", "H", "AT&T Stadium, Dallas", "Fase de Grupos"),
    ("Arábia Saudita", "Uruguai", "2026-06-15 20:00", "H", "SoFi Stadium, Los Angeles", "Fase de Grupos"),
    ("França", "Senegal", "2026-06-16 13:00", "I", "MetLife Stadium, Nova Jersey", "Fase de Grupos"),
    ("Iraque", "Noruega", "2026-06-16 16:00", "I", "NRG Stadium, Houston", "Fase de Grupos"),
    ("Argentina", "Argélia", "2026-06-16 19:00", "J", "Hard Rock Stadium, Miami", "Fase de Grupos"),
    ("Áustria", "Jordânia", "2026-06-16 20:00", "J", "Levi's Stadium, São Francisco", "Fase de Grupos"),
    ("Portugal", "RD Congo", "2026-06-17 13:00", "K", "Mercedes-Benz Stadium, Atlanta", "Fase de Grupos"),
    ("Uzbequistão", "Colômbia", "2026-06-17 16:00", "K", "GEHA Field, Kansas City", "Fase de Grupos"),
    ("Inglaterra", "Croácia", "2026-06-17 19:00", "L", "Gillette Stadium, Boston", "Fase de Grupos"),
    ("Gana", "Panamá", "2026-06-17 20:00", "L", "Lumen Field, Seattle", "Fase de Grupos"),
    # Rodada 2
    ("República Tcheca", "África do Sul", "2026-06-18 14:00", "A", "Estadio Akron, Guadalajara", "Fase de Grupos"),
    ("México", "Coreia do Sul", "2026-06-18 16:00", "A", "Estádio Azteca, Cidade do México", "Fase de Grupos"),
    ("Suíça", "Bósnia", "2026-06-18 19:00", "B", "Estadio BBVA, Monterrey", "Fase de Grupos"),
    ("Canadá", "Catar", "2026-06-18 17:00", "B", "BMO Field, Toronto", "Fase de Grupos"),
    ("Escócia", "Marrocos", "2026-06-19 13:00", "C", "Lincoln Financial Field, Filadélfia", "Fase de Grupos"),
    ("Brasil", "Haiti", "2026-06-19 16:00", "C", "MetLife Stadium, Nova Jersey", "Fase de Grupos"),
    ("Turquia", "Paraguai", "2026-06-19 19:00", "D", "SoFi Stadium, Los Angeles", "Fase de Grupos"),
    ("EUA", "Austrália", "2026-06-19 20:00", "D", "Levi's Stadium, São Francisco", "Fase de Grupos"),
    ("Alemanha", "Costa do Marfim", "2026-06-20 13:00", "E", "Gillette Stadium, Boston", "Fase de Grupos"),
    ("Curaçao", "Equador", "2026-06-20 16:00", "E", "Lincoln Financial Field, Filadélfia", "Fase de Grupos"),
    ("Tunísia", "Japão", "2026-06-20 19:00", "F", "Hard Rock Stadium, Miami", "Fase de Grupos"),
    ("Holanda", "Suécia", "2026-06-20 20:00", "F", "Lumen Field, Seattle", "Fase de Grupos"),
    ("Bélgica", "Irã", "2026-06-21 13:00", "G", "Mercedes-Benz Stadium, Atlanta", "Fase de Grupos"),
    ("Egito", "Nova Zelândia", "2026-06-21 16:00", "G", "GEHA Field, Kansas City", "Fase de Grupos"),
    ("Espanha", "Arábia Saudita", "2026-06-21 19:00", "H", "AT&T Stadium, Dallas", "Fase de Grupos"),
    ("Cabo Verde", "Uruguai", "2026-06-21 20:00", "H", "SoFi Stadium, Los Angeles", "Fase de Grupos"),
    ("Iraque", "França", "2026-06-22 13:00", "I", "MetLife Stadium, Nova Jersey", "Fase de Grupos"),
    ("Senegal", "Noruega", "2026-06-22 16:00", "I", "NRG Stadium, Houston", "Fase de Grupos"),
    ("Argentina", "Áustria", "2026-06-22 19:00", "J", "Hard Rock Stadium, Miami", "Fase de Grupos"),
    ("Argélia", "Jordânia", "2026-06-22 20:00", "J", "Levi's Stadium, São Francisco", "Fase de Grupos"),
    ("Portugal", "Uzbequistão", "2026-06-23 13:00", "K", "Mercedes-Benz Stadium, Atlanta", "Fase de Grupos"),
    ("RD Congo", "Colômbia", "2026-06-23 16:00", "K", "GEHA Field, Kansas City", "Fase de Grupos"),
    ("Inglaterra", "Gana", "2026-06-23 19:00", "L", "Gillette Stadium, Boston", "Fase de Grupos"),
    ("Croácia", "Panamá", "2026-06-23 20:00", "L", "Lumen Field, Seattle", "Fase de Grupos"),
    # Rodada 3
    ("República Tcheca", "México", "2026-06-24 17:00", "A", "Estadio BBVA, Monterrey", "Fase de Grupos"),
    ("África do Sul", "Coreia do Sul", "2026-06-24 17:00", "A", "Estadio Akron, Guadalajara", "Fase de Grupos"),
    ("Suíça", "Canadá", "2026-06-24 20:00", "B", "BMO Field, Toronto", "Fase de Grupos"),
    ("Bósnia", "Catar", "2026-06-24 20:00", "B", "BC Place, Vancouver", "Fase de Grupos"),
    ("Marrocos", "Haiti", "2026-06-25 17:00", "C", "NRG Stadium, Houston", "Fase de Grupos"),
    ("Escócia", "Brasil", "2026-06-25 17:00", "C", "MetLife Stadium, Nova Jersey", "Fase de Grupos"),
    ("Turquia", "EUA", "2026-06-25 20:00", "D", "SoFi Stadium, Los Angeles", "Fase de Grupos"),
    ("Paraguai", "Austrália", "2026-06-25 20:00", "D", "Levi's Stadium, São Francisco", "Fase de Grupos"),
    ("Equador", "Alemanha", "2026-06-26 15:00", "E", "Gillette Stadium, Boston", "Fase de Grupos"),
    ("Curaçao", "Costa do Marfim", "2026-06-26 15:00", "E", "Lincoln Financial Field, Filadélfia", "Fase de Grupos"),
    ("Tunísia", "Holanda", "2026-06-26 17:00", "F", "Hard Rock Stadium, Miami", "Fase de Grupos"),
    ("Japão", "Suécia", "2026-06-26 17:00", "F", "Lumen Field, Seattle", "Fase de Grupos"),
    ("Nova Zelândia", "Bélgica", "2026-06-26 19:00", "G", "Mercedes-Benz Stadium, Atlanta", "Fase de Grupos"),
    ("Egito", "Irã", "2026-06-26 19:00", "G", "GEHA Field, Kansas City", "Fase de Grupos"),
    ("Uruguai", "Espanha", "2026-06-26 20:30", "H", "AT&T Stadium, Dallas", "Fase de Grupos"),
    ("Cabo Verde", "Arábia Saudita", "2026-06-26 20:30", "H", "SoFi Stadium, Los Angeles", "Fase de Grupos"),
    ("Noruega", "França", "2026-06-27 15:00", "I", "MetLife Stadium, Nova Jersey", "Fase de Grupos"),
    ("Senegal", "Iraque", "2026-06-27 15:00", "I", "NRG Stadium, Houston", "Fase de Grupos"),
    ("Jordânia", "Argentina", "2026-06-27 17:00", "J", "Hard Rock Stadium, Miami", "Fase de Grupos"),
    ("Argélia", "Áustria", "2026-06-27 17:00", "J", "Levi's Stadium, São Francisco", "Fase de Grupos"),
    ("Colômbia", "Portugal", "2026-06-27 19:00", "K", "Mercedes-Benz Stadium, Atlanta", "Fase de Grupos"),
    ("RD Congo", "Uzbequistão", "2026-06-27 19:00", "K", "GEHA Field, Kansas City", "Fase de Grupos"),
    ("Panamá", "Inglaterra", "2026-06-27 20:30", "L", "Gillette Stadium, Boston", "Fase de Grupos"),
    ("Croácia", "Gana", "2026-06-27 20:30", "L", "Lumen Field, Seattle", "Fase de Grupos"),

    # ===== SEGUNDA FASE (16 jogos) - Jogos 73-88 =====
    ("2o Grupo A", "2o Grupo B", "2026-06-28 13:00", "Jogo 73", "Estádio Azteca, Cidade do México", "Segunda Fase"),
    ("1o Grupo E", "Melhor 3o", "2026-06-28 16:00", "Jogo 74", "Gillette Stadium, Boston", "Segunda Fase"),
    ("1o Grupo F", "2o Grupo C", "2026-06-28 19:00", "Jogo 75", "Hard Rock Stadium, Miami", "Segunda Fase"),
    ("1o Grupo C", "2o Grupo F", "2026-06-28 20:00", "Jogo 76", "MetLife Stadium, Nova Jersey", "Segunda Fase"),
    ("1o Grupo I", "Melhor 3o", "2026-06-29 15:00", "Jogo 77", "Mercedes-Benz Stadium, Atlanta", "Segunda Fase"),
    ("2o Grupo E", "2o Grupo I", "2026-06-29 19:00", "Jogo 78", "Levi's Stadium, São Francisco", "Segunda Fase"),
    ("1o Grupo A", "Melhor 3o", "2026-06-30 15:00", "Jogo 79", "Estadio Akron, Guadalajara", "Segunda Fase"),
    ("1o Grupo L", "Melhor 3o", "2026-06-30 19:00", "Jogo 80", "Lumen Field, Seattle", "Segunda Fase"),
    ("1o Grupo D", "Melhor 3o", "2026-07-01 15:00", "Jogo 81", "SoFi Stadium, Los Angeles", "Segunda Fase"),
    ("1o Grupo G", "Melhor 3o", "2026-07-01 19:00", "Jogo 82", "GEHA Field, Kansas City", "Segunda Fase"),
    ("2o Grupo K", "2o Grupo L", "2026-07-02 15:00", "Jogo 83", "Lincoln Financial Field, Filadélfia", "Segunda Fase"),
    ("1o Grupo H", "2o Grupo J", "2026-07-02 19:00", "Jogo 84", "AT&T Stadium, Dallas", "Segunda Fase"),
    ("1o Grupo B", "Melhor 3o", "2026-07-03 15:00", "Jogo 85", "BMO Field, Toronto", "Segunda Fase"),
    ("1o Grupo J", "2o Grupo H", "2026-07-03 17:00", "Jogo 86", "NRG Stadium, Houston", "Segunda Fase"),
    ("1o Grupo K", "Melhor 3o", "2026-07-03 19:00", "Jogo 87", "Estadio BBVA, Monterrey", "Segunda Fase"),
    ("2o Grupo D", "2o Grupo G", "2026-07-03 20:30", "Jogo 88", "BC Place, Vancouver", "Segunda Fase"),

    # ===== OITAVAS DE FINAL (8 jogos) - Jogos 89-96 =====
    ("Venc. Jogo 76", "Venc. Jogo 75", "2026-07-04 15:00", "Jogo 89", "MetLife Stadium, Nova Jersey", "Oitavas de Final"),
    ("Venc. Jogo 74", "Venc. Jogo 73", "2026-07-04 19:00", "Jogo 90", "Gillette Stadium, Boston", "Oitavas de Final"),
    ("Venc. Jogo 80", "Venc. Jogo 78", "2026-07-05 15:00", "Jogo 91", "Lumen Field, Seattle", "Oitavas de Final"),
    ("Venc. Jogo 77", "Venc. Jogo 79", "2026-07-05 19:00", "Jogo 92", "Mercedes-Benz Stadium, Atlanta", "Oitavas de Final"),
    ("Venc. Jogo 81", "Venc. Jogo 85", "2026-07-06 15:00", "Jogo 93", "SoFi Stadium, Los Angeles", "Oitavas de Final"),
    ("Venc. Jogo 84", "Venc. Jogo 82", "2026-07-06 19:00", "Jogo 94", "GEHA Field, Kansas City", "Oitavas de Final"),
    ("Venc. Jogo 87", "Venc. Jogo 88", "2026-07-07 15:00", "Jogo 95", "Estadio BBVA, Monterrey", "Oitavas de Final"),
    ("Venc. Jogo 83", "Venc. Jogo 86", "2026-07-07 19:00", "Jogo 96", "AT&T Stadium, Dallas", "Oitavas de Final"),

    # ===== QUARTAS DE FINAL (4 jogos) - Jogos 97-100 =====
    ("Venc. Jogo 89", "Venc. Jogo 90", "2026-07-09 17:00", "Jogo 97", "MetLife Stadium, Nova Jersey", "Quartas de Final"),
    ("Venc. Jogo 91", "Venc. Jogo 92", "2026-07-09 20:00", "Jogo 98", "Levi's Stadium, São Francisco", "Quartas de Final"),
    ("Venc. Jogo 93", "Venc. Jogo 94", "2026-07-10 17:00", "Jogo 99", "Lincoln Financial Field, Filadélfia", "Quartas de Final"),
    ("Venc. Jogo 95", "Venc. Jogo 96", "2026-07-11 17:00", "Jogo 100", "NRG Stadium, Houston", "Quartas de Final"),

    # ===== SEMIFINAIS (2 jogos) - Jogos 101-102 =====
    ("Venc. Jogo 97", "Venc. Jogo 98", "2026-07-14 19:00", "Jogo 101", "AT&T Stadium, Dallas", "Semifinal"),
    ("Venc. Jogo 99", "Venc. Jogo 100", "2026-07-15 19:00", "Jogo 102", "MetLife Stadium, Nova Jersey", "Semifinal"),

    # ===== DISPUTA DE 3o LUGAR - Jogo 103 =====
    ("Perd. Jogo 101", "Perd. Jogo 102", "2026-07-18 17:00", "Jogo 103", "Hard Rock Stadium, Miami", "Disputa de 3o Lugar"),

    # ===== FINAL - Jogo 104 =====
    ("Venc. Jogo 101", "Venc. Jogo 102", "2026-07-19 16:00", "Jogo 104", "MetLife Stadium, Nova Jersey", "Final"),
]

ADMIN_USERS = [
    ("Maria Benussy", "mariabenussy@googlemail.com", "(00) 00000-0000", 1),
]


def seed():
    init_db()
    conn = get_conn()
    existing = conn.execute("SELECT COUNT(*) as c FROM matches").fetchone()["c"]
    if existing > 0:
        conn.close()
        return

    for ta, tb, dt, grp, venue, phase in ALL_MATCHES:
        fa = FLAGS.get(ta, "")
        fb = FLAGS.get(tb, "")
        conn.execute(
            "INSERT INTO matches (team_a,team_b,flag_a,flag_b,match_date,phase,group_name,venue) VALUES (?,?,?,?,?,?,?,?)",
            (ta, tb, fa, fb, dt, phase, grp, venue),
        )

    for name, email, phone, is_admin in ADMIN_USERS:
        try:
            conn.execute(
                "INSERT INTO users (name, email, phone, is_admin) VALUES (?, ?, ?, ?)",
                (name, email.lower(), phone, is_admin),
            )
        except Exception:
            pass

    conn.commit()
    conn.close()


if __name__ == "__main__":
    seed()
