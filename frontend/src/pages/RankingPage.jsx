import { useEffect, useState } from 'react';
import { api } from '../api';

export default function RankingPage() {
  const [ranking, setRanking] = useState([]);
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    api.getRanking().then(setRanking);
    api.getMatches().then(setMatches);
  }, []);

  const finished = matches.filter(m => m.status === 'finished').length;
  const medals = ['🥇', '🥈', '🥉'];

  return (
    <>
      <h1 className="section-title" style={{ marginTop: 0 }}>Ranking do Bolao</h1>
      <p style={{ color: 'var(--text-light)', marginBottom: '1.5rem' }}>
        Quem sera o craque da familia? · <strong>{finished}</strong> jogos finalizados
      </p>

      {ranking.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Nenhum participante cadastrado ainda!</p>
        </div>
      ) : finished === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Nenhum jogo finalizado ainda. O ranking sera atualizado em breve!</p>
        </div>
      ) : (
        <>
          <div className="podium">
            {ranking.slice(0, 3).map((p, i) => (
              <div className={`podium-step podium-${i + 1}`} key={p.user_id}>
                <div className="podium-medal">{medals[i]}</div>
                <div className="podium-name">{p.short_name}</div>
                <div className="podium-points">{p.points} pts</div>
                <div className="podium-details">
                  {p.exact_hits} exatos · {p.winner_hits} acertos
                </div>
                <div style={{ fontWeight: 800, color: '#ff8f00', marginTop: '.3rem' }}>
                  {['R$ 100', 'R$ 30', 'R$ 10'][i]}
                </div>
              </div>
            ))}
          </div>

          <h2 className="section-title">Classificacao Completa</h2>
          {ranking.map((p, i) => (
            <div className="ranking-row" key={p.user_id}
              style={i < 3 ? { borderLeft: `4px solid ${['#ff8f00', '#90a4ae', '#8d6e63'][i]}` } : {}}>
              <div className="ranking-pos" style={{ fontSize: i < 3 ? '1.5rem' : '1rem', fontWeight: 800 }}>
                {i < 3 ? medals[i] : `${i + 1}o`}
              </div>
              <div className="ranking-name">{p.short_name}</div>
              <div className="ranking-extra">
                {p.exact_hits} exatos · {p.winner_hits} acertos · {p.games_predicted} jogos
              </div>
              <div className="ranking-pts">{p.points} pts</div>
            </div>
          ))}
        </>
      )}
    </>
  );
}
