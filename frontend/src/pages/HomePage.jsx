import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

export default function HomePage() {
  const [ranking, setRanking] = useState([]);
  const [matches, setMatches] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    api.getRanking().then(setRanking);
    api.getMatches().then(setMatches);
    api.getUsers().then(setUsers);
  }, []);

  const finished = matches.filter(m => m.status === 'finished').length;
  const scheduled = matches.filter(m => m.status === 'scheduled').length;
  const medals = ['🥇', '🥈', '🥉'];
  const prizes = ['R$ 100', 'R$ 30', 'R$ 10'];

  return (
    <>
      <div className="hero">
        <h1>⚽ Bolao da Familia</h1>
        <p>Copa do Mundo 2026 — EUA, Mexico & Canada</p>
      </div>

      <h2 className="section-title">Premiacao</h2>
      <div className="prizes">
        <div className="prize-card prize-gold">
          <div className="prize-icon">🥇</div>
          <div className="prize-place">1o Lugar</div>
          <div className="prize-value">R$ 100</div>
          <div style={{ fontSize: '.85rem', marginTop: '.3rem', color: '#555' }}>Craque da familia!</div>
        </div>
        <div className="prize-card prize-silver">
          <div className="prize-icon">🥈</div>
          <div className="prize-place">2o Lugar</div>
          <div className="prize-value">R$ 30</div>
          <div style={{ fontSize: '.85rem', marginTop: '.3rem', color: '#555' }}>Quase la!</div>
        </div>
        <div className="prize-card prize-bronze">
          <div className="prize-icon">🥉</div>
          <div className="prize-place">3o Lugar</div>
          <div className="prize-value">R$ 10</div>
          <div style={{ fontSize: '.85rem', marginTop: '.3rem', color: '#555' }}>Boa tentativa!</div>
        </div>
      </div>

      <h2 className="section-title">Resumo do Bolao</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{users.length}</div>
          <div className="stat-label">Participantes</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{matches.length}</div>
          <div className="stat-label">Total de Jogos</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{finished}</div>
          <div className="stat-label">Finalizados</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{scheduled}</div>
          <div className="stat-label">Restantes</div>
        </div>
      </div>

      <h2 className="section-title">Top 3</h2>
      {ranking.length > 0 && finished > 0 ? (
        <div>
          {ranking.slice(0, 3).map((p, i) => (
            <div className="ranking-row" key={p.user_id}
              style={{ borderLeft: `4px solid ${['#ff8f00', '#90a4ae', '#8d6e63'][i]}` }}>
              <div className="ranking-pos">{medals[i]}</div>
              <div className="ranking-name">{p.short_name}</div>
              <div className="ranking-extra">{p.exact_hits} exatos · {p.winner_hits} acertos</div>
              <div className="ranking-pts">{p.points} pts</div>
              <div style={{ marginLeft: '1rem', fontWeight: 800, color: '#ff8f00', minWidth: 70, textAlign: 'right' }}>
                {prizes[i]}
              </div>
            </div>
          ))}
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <Link to="/ranking" className="btn btn-primary">Ver ranking completo</Link>
          </div>
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Nenhum jogo finalizado ainda. O ranking sera atualizado em breve!</p>
          <Link to="/palpites" className="btn btn-gold" style={{ marginTop: '1rem' }}>Fazer meus palpites</Link>
        </div>
      )}

      <h2 className="section-title">Regras do Bolao</h2>
      <table className="rules-table">
        <thead><tr><th>Regra</th><th>Detalhe</th></tr></thead>
        <tbody>
          <tr><td><strong>Placar exato</strong></td><td><strong>3 pontos</strong> — acertou o placar certinho!</td></tr>
          <tr><td><strong>Acertou o vencedor</strong></td><td><strong>1 ponto</strong> — acertou quem ganha (ou empate)</td></tr>
          <tr><td><strong>Errou tudo</strong></td><td><strong>0 pontos</strong> — na proxima vai!</td></tr>
          <tr><td><strong>Prazo</strong></td><td>Palpites devem ser feitos <strong>antes do jogo comecar</strong></td></tr>
          <tr><td><strong>Travamento</strong></td><td>Depois que o jogo comeca, nao pode mais alterar</td></tr>
        </tbody>
      </table>
    </>
  );
}
