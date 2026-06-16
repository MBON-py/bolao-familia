import { useEffect, useState } from 'react';
import { api } from '../api';
import { formatDate, formatTime, getLocalDateBR } from '../dateUtils';

function calcPoints(pa, pb, ra, rb) {
  if (pa === ra && pb === rb) return 3;
  const p = pa > pb ? 1 : pa < pb ? -1 : 0;
  const r = ra > rb ? 1 : ra < rb ? -1 : 0;
  return p === r ? 1 : 0;
}

export default function MatchesPage() {
  const [matches, setMatches] = useState([]);
  const [phase, setPhase] = useState('Todas');
  const [group, setGroup] = useState('Todos');
  const [status, setStatus] = useState('Todos');
  const [expandedMatch, setExpandedMatch] = useState(null);
  const [matchPreds, setMatchPreds] = useState({});

  useEffect(() => { api.getMatches().then(setMatches); }, []);

  const togglePreds = async (matchId) => {
    if (expandedMatch === matchId) { setExpandedMatch(null); return; }
    if (!matchPreds[matchId]) {
      const preds = await api.getMatchPredictions(matchId);
      setMatchPreds(mp => ({ ...mp, [matchId]: preds }));
    }
    setExpandedMatch(matchId);
  };

  const phases = [...new Set(matches.map(m => m.phase))];
  const groups = [...new Set(matches.map(m => m.group_name).filter(Boolean))].sort();

  let filtered = matches;
  if (phase !== 'Todas') filtered = filtered.filter(m => m.phase === phase);
  if (group !== 'Todos') filtered = filtered.filter(m => m.group_name === group);
  if (status !== 'Todos') {
    const statusMap = { 'Agendados': 'scheduled', 'Finalizados': 'finished', 'Ao vivo': 'in_progress' };
    filtered = filtered.filter(m => m.status === statusMap[status]);
  }

  const byDate = {};
  filtered.forEach(m => { (byDate[getLocalDateBR(m.match_date)] ||= []).push(m); });

  return (
    <>
      <h1 className="section-title" style={{ marginTop: 0 }}>Jogos da Copa 2026</h1>
      <p style={{ color: 'var(--text-light)', marginBottom: '1rem' }}>
        Acompanhe todos os jogos e veja os palpites da familia!
      </p>

      <div className="filters">
        <div>
          <label style={{ fontSize: '.8rem', fontWeight: 700 }}>Fase</label><br />
          <select value={phase} onChange={e => setPhase(e.target.value)}>
            <option>Todas</option>
            {phases.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: '.8rem', fontWeight: 700 }}>Grupo</label><br />
          <select value={group} onChange={e => setGroup(e.target.value)}>
            <option>Todos</option>
            {groups.map(g => <option key={g}>{g}</option>)}
          </select>
        </div>
        <div className="tabs" style={{ marginBottom: 0 }}>
          {['Todos', 'Agendados', 'Finalizados', 'Ao vivo'].map(s => (
            <button key={s} className={`tab ${status === s ? 'active' : ''}`} onClick={() => setStatus(s)}>{s}</button>
          ))}
        </div>
      </div>

      <p style={{ color: 'var(--text-light)', fontSize: '.9rem', marginBottom: '1rem' }}>
        <strong>{filtered.length}</strong> jogos encontrados
      </p>

      {Object.entries(byDate).sort(([a], [b]) => a.localeCompare(b)).map(([date, list]) => (
        <div className="date-group" key={date}>
          <div className="date-header">{formatDate(date)}</div>
          {list.map(m => {
            const isFinished = m.status === 'finished';
            const isLive = m.status === 'in_progress';
            const preds = matchPreds[m.id] || [];
            const isExpanded = expandedMatch === m.id;

            return (
              <div className="match-card" key={m.id}>
                <div className="match-meta">
                  <span className={`badge ${isFinished ? 'badge-finished' : isLive ? 'badge-live' : 'badge-scheduled'}`}>
                    {isFinished ? `${m.score_a} x ${m.score_b} — Finalizado` : isLive ? 'AO VIVO' : formatTime(m.match_date)}
                  </span>
                  <span className="match-venue">{m.phase} · {m.group_name}</span>
                </div>
                <div className="match-teams">
                  <span className="match-team">
                    {m.flag_a && <span className="match-flag">{m.flag_a}</span>} {m.team_a}
                  </span>
                  {isFinished ? (
                    <span className="match-score">{m.score_a} x {m.score_b}</span>
                  ) : (
                    <span className="match-vs">vs</span>
                  )}
                  <span className="match-team">
                    {m.team_b} {m.flag_b && <span className="match-flag">{m.flag_b}</span>}
                  </span>
                </div>
                <div style={{ textAlign: 'center', fontSize: '.8rem', color: 'var(--text-light)', marginTop: '.3rem' }}>
                  {m.venue}
                </div>

                {(isFinished || isLive) && (
                  <div style={{ textAlign: 'center', marginTop: '.75rem' }}>
                    <button className="btn btn-outline btn-sm" onClick={() => togglePreds(m.id)}>
                      {isExpanded ? 'Fechar' : 'Ver palpites da familia'}
                    </button>
                    {isExpanded && (
                      <div style={{ marginTop: '.75rem', textAlign: 'left' }}>
                        {preds.length === 0 ? (
                          <p style={{ color: 'var(--text-light)', textAlign: 'center' }}>Nenhum palpite para esse jogo.</p>
                        ) : preds.map(p => {
                          let label = '';
                          if (isFinished && m.score_a != null) {
                            const pts = calcPoints(p.score_a, p.score_b, m.score_a, m.score_b);
                            label = ` (${pts} pts)`;
                          }
                          return (
                            <div key={p.id} style={{ padding: '.4rem .75rem', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between' }}>
                              <strong>{p.short_name}</strong>
                              <span>{p.score_a} x {p.score_b}<strong>{label}</strong></span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </>
  );
}
