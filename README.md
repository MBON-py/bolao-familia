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
