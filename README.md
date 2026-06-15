# Bolao da Familia — Copa do Mundo 2026

Plataforma de bolao familiar para a Copa do Mundo 2026. Cadastre participantes, faca palpites e acompanhe o ranking em tempo real.

## Funcionalidades

- Cadastro por nome, e-mail e telefone
- Palpites antes do jogo (bloqueados apos inicio)
- Pontuacao: 3 pts placar exato, 1 pt acertar vencedor
- Ranking com podio e premiacao (1o R$100, 2o R$30, 3o R$10)
- Painel admin para inserir resultados e gerenciar jogos
- 104 jogos: fase de grupos (72) + segunda fase (16) + oitavas (8) + quartas (4) + semis (2) + 3o lugar + final
- Classificacao dos grupos com tabela de pontos
- Jogos eliminatorios editaveis conforme classificacao

## Stack

- **Frontend:** React 19 + Vite
- **Backend:** Python + FastAPI
- **Banco:** PostgreSQL (Supabase)

## Como rodar

### 1. Banco de dados (Supabase)

1. Crie um projeto em [supabase.com](https://supabase.com) (ou use um existente).
2. Em **Project Settings > Database > Connection string**, copie a string da aba **Transaction pooler** (porta `6543`).
3. Em `backend/`, copie `.env.example` para `.env` e cole a connection string em `DATABASE_URL`, substituindo `[YOUR-PASSWORD]` pela senha do banco.

### 2. Backend

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --port 8000 --reload
```

Na primeira execução, as tabelas são criadas e os 104 jogos + usuário admin são inseridos automaticamente (seed).

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Acesse http://localhost:5173

## Variáveis de ambiente

| Variável | Onde | Descrição |
| --- | --- | --- |
| `DATABASE_URL` | `backend/.env` | Connection string do Postgres do Supabase (não commitar) |
| `VITE_API_URL` | `frontend` (build) | URL completa da API em produção, ex: `https://bolao-familia-backend.onrender.com/api`. Se não definida, usa `/api` (proxy do Vite em dev) |

## Deploy no Render

O repositório já inclui um `render.yaml` (Blueprint) que cria dois serviços:

- **bolao-familia-backend**: Web Service Python (FastAPI), pasta `backend/`
- **bolao-familia-frontend**: Static Site (build do Vite), pasta `frontend/`

### Passos

1. Suba o repositório para o GitHub (sem o arquivo `.env`, que já está no `.gitignore`).
2. No Render, clique em **New > Blueprint** e selecione este repositório. O Render vai detectar o `render.yaml` e propor os dois serviços.
3. Antes de aplicar, configure as variáveis marcadas como "sync: false":
   - `DATABASE_URL` no serviço **bolao-familia-backend**: cole a connection string do Supabase (Transaction pooler, porta `6543`).
   - `VITE_API_URL` no serviço **bolao-familia-frontend**: deixe em branco por enquanto.
4. Faça o deploy. Quando o backend terminar, anote a URL gerada (ex: `https://bolao-familia-backend.onrender.com`).
5. Edite a variável `VITE_API_URL` do frontend para `https://<url-do-backend>.onrender.com/api` e dispare um novo deploy (manual deploy) do frontend — variáveis do Vite só têm efeito no build.
6. Acesse a URL do frontend (`https://bolao-familia-frontend.onrender.com`).

Na primeira execução do backend, as tabelas são criadas e os 104 jogos + usuário admin são inseridos automaticamente (seed).
