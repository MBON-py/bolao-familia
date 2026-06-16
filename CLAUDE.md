# Bolão da Família — Copa 2026

Plataforma de bolão para a Copa do Mundo 2026, com palpites de placar, ranking em tempo real e painel administrativo. Desenvolvida em React (frontend) + FastAPI (backend), com PostgreSQL hospedado no Render.

## Arquitetura

```
bolao-familia/
├── Frontend/          # React + Vite (SPA)
│   └── src/
│       ├── App.jsx            # Roteamento e contexto de usuário (UserContext)
│       ├── api.js             # Camada HTTP — todos os fetches passam por aqui
│       ├── dateUtils.js       # Utilitários de timezone (UTC → America/Sao_Paulo)
│       ├── pages/
│       │   ├── LoginPage.jsx       # Cadastro/login por e-mail (sem senha)
│       │   ├── HomePage.jsx        # Dashboard com resumo do bolão
│       │   ├── PredictionsPage.jsx # Palpites do usuário logado
│       │   ├── MatchesPage.jsx     # Todos os jogos com filtros
│       │   ├── RankingPage.jsx     # Ranking dos participantes
│       │   ├── StandingsPage.jsx   # Classificação dos grupos
│       │   └── AdminPage.jsx       # Painel admin (resultados, edição, palpites retroativos)
│       └── components/
│           └── Navbar.jsx
└── Backend/           # FastAPI + psycopg2
    ├── main.py        # Endpoints da API REST
    ├── database.py    # Schema PostgreSQL, get_conn(), calc_points(), short_name()
    └── seed.py        # Carga inicial dos 104 jogos
```

## Comandos de desenvolvimento

**Backend:**
```bash
cd Backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Frontend:**
```bash
cd Frontend
npm install
npm run dev          # dev server em http://localhost:5173
npm run build        # gera dist/ para deploy
```

A variável `VITE_API_URL` no frontend define a URL base da API (ex: `https://bolao-familia-backend.onrender.com`). Em desenvolvimento sem a variável, usa `/api` (proxy vite).

## Deploy (Render)

- **Backend**: web service Python, `uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Frontend**: site estático, `npm run build`, publica `dist/`
- Configuração em `render.yaml`
- `DATABASE_URL` deve ser configurada manualmente no painel do Render

## Banco de dados

PostgreSQL (Supabase ou Render Postgres). Tabelas:

| Tabela | Campos relevantes |
|--------|-------------------|
| `users` | id, name, email, phone, is_admin (0/1) |
| `matches` | id, team_a, team_b, match_date (TEXT "YYYY-MM-DD HH:MM" **em UTC**), phase, group_name, venue, score_a, score_b, status |
| `predictions` | id, user_id, match_id, score_a, score_b |

`match_date` é armazenado como **TEXT em UTC** (ex: `"2026-06-13 19:00"`). Todo display deve converter para `America/Sao_Paulo` via `dateUtils.js`.

## Regras de pontuação

- **3 pontos** — placar exato
- **1 ponto** — acertou o vencedor (empate só vale com placar exato)
- **0 pontos** — errou

## Convenções de código

### Timezone (CRÍTICO)
Todas as datas exibidas ao usuário devem usar `dateUtils.js`:

```javascript
import { formatDate, formatTime, getLocalDateBR } from '../dateUtils';

// Agrupar jogos por data local brasileira
const date = getLocalDateBR(m.match_date);     // "2026-06-13"

// Exibir cabeçalho de data (recebe YYYY-MM-DD retornado por getLocalDateBR)
formatDate(date);                               // "sábado, 13/06/2026"

// Exibir horário convertido para BRT
formatTime(m.match_date);                       // "16:00"
```

**Nunca** use `m.match_date.slice(0, 10)` para agrupar/exibir datas nem `m.match_date.slice(11, 16)` para exibir horários — ambos ignoram timezone e causam dados incorretos.

### API
Todos os fetches passam por `src/api.js`. Adicionar novos endpoints ali, não diretamente nos componentes.

### Autenticação
Login por e-mail (sem senha). Usuário armazenado em `localStorage` como `bolao_user`. O contexto `UserContext` (App.jsx) expõe `{ user, logout }`.

### Administração
`user.is_admin === 1` habilita a rota `/admin`. O painel permite: inserir resultados, iniciar jogos, editar times das fases eliminatórias, cadastrar palpites retroativos.

## Status dos jogos

| Valor | Significado |
|-------|-------------|
| `scheduled` | Agendado — palpites abertos |
| `in_progress` | Ao vivo |
| `finished` | Finalizado |
