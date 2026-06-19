import { useEffect, useState } from 'react';
import { useUser } from '../App';
import { api } from '../api';
import toast from 'react-hot-toast';
import { formatDate, formatTime, getLocalDateBR } from '../dateUtils';

function calcPoints(pa, pb, ra, rb) {
  if (pa === ra && pb === rb) return 3;
  const p = pa > pb ? 1 : pa < pb ? -1 : 0;
  const r = ra > rb ? 1 : ra < rb ? -1 : 0;
  return p === r && r !== 0 ? 1 : 0;
}

export default function PredictionsPage() {
  const { user } = useUser();
  const [matches, setMatches] = useState([]);
  const [preds, setPreds] = useState({});
  const [scores, setScores] = useState({});
  const [tab, setTab] = useState('open');
  const [phaseFilter, setPhaseFilter] = useState('Todas');

  const load = () => {
    api.getMatches().then(setMatches);
    api.getUserPredictions(user.id).then(list => {
      const map = {};
      list.forEach(p => { map[p.match_id] = p; });
      setPreds(map);
    });
  };

  useEffect(load, [user.id]);

  const scheduled = matches.filter(m => m.status === 'scheduled' && m.team_a !== 'A definir');
  const done = matches.filter(m => m.status !== 'scheduled');
  const phases = [...new Set(scheduled.map(m => m.phase))];

  const filteredScheduled = phaseFilter === 'Todas'
    ? scheduled
    : scheduled.filter(m => m.phase === phaseFilter);

  const getScore = (matchId, side) => {
    if (scores[`${matchId}_${side}`] !== undefined) return scores[`${matchId}_${side}`];
    if (preds[matchId]) return preds[matchId][`score_${side}`];
    return 0;
  };

  const setScore = (matchId, side, val) => {
    setScores(s => ({ ...s, [`${matchId}_${side}`]: Math.max(0, Math.min(20, Number(val) || 0)) }));
  };

  const save = async (matchId) => {
    const sa = getScore(matchId, 'a');
    const sb = getScore(matchId, 'b');
    try {
      await api.savePrediction({ user_id: user.id, match_id: matchId, score_a: sa, score_b: sb });
      toast.success('Palpite salvo!');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const groupByDate = (list) => {
    const groups = {};
    list.forEach(m => {
      const date = getLocalDateBR(m.match_date);
      (groups[date] ||= []).push(m);
    });
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  };

  let totalPts = 0;
  done.forEach(m => {
    const p = preds[m.id];
    if (p && m.score_a != null) totalPts += calcPoints(p.score_a, p.score_b, m.score_a, m.score_b);
  });

  return (
    <>
      <h1 className="section-title" style={{ marginTop: 0 }}>Meus Palpites</h1>
      <p style={{ color: 'var(--text-light)', marginBottom: '1rem' }}>
        Faca seus palpites antes que o jogo comece! Boa sorte!
      </p>

      <div className="tabs">
        <button className={`tab ${tab === 'open' ? 'active' : ''}`} onClick={() => setTab('open')}>
          Abertos ({scheduled.length})
        </button>
        <button className={`tab ${tab === 'done' ? 'active' : ''}`} onClick={() => setTab('done')}>
          Finalizados ({done.length})
        </button>
      </div>

      {tab === 'open' && (
        <>
          {phases.length > 1 && (
            <div className="filters" style={{ marginBottom: '1rem' }}>
              <select value={phaseFilter} onChange={e => setPhaseFilter(e.target.value)}>
                <option>Todas</option>
                {phases.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          )}

          {filteredScheduled.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
              <p>Nenhum jogo aberto para palpites nesta fase.</p>
            </div>
          ) : (
            groupByDate(filteredScheduled).map(([date, list]) => (
              <div className="date-group" key={date}>
                <div className="date-header">{formatDate(date)}</div>
                {list.map(m => {
                  const hasPred = !!preds[m.id];
                  return (
                    <div className="match-card" key={m.id}>
                      <div className="match-meta">
                        <span className="badge badge-scheduled">{formatTime(m.match_date)} · {m.phase}</span>
                        <span className="match-venue">{m.venue}</span>
                      </div>
                      <div className="match-teams">
                        <span className="match-team">
                          {m.flag_a && <span className="match-flag">{m.flag_a}</span>} {m.team_a}
                        </span>
                        <span className="match-vs">vs</span>
                        <span className="match-team">
                          {m.team_b} {m.flag_b && <span className="match-flag">{m.flag_b}</span>}
                        </span>
                      </div>
                      <div className="pred-row">
                        <span style={{ fontWeight: 700, fontSize: '.85rem' }}>{m.team_a}</span>
                        <input type="number" className="form-control input-score" min="0" max="20"
                          value={getScore(m.id, 'a')} onChange={e => setScore(m.id, 'a', e.target.value)} />
                        <span style={{ fontWeight: 800, color: 'var(--text-light)' }}>x</span>
                        <input type="number" className="form-control input-score" min="0" max="20"
                          value={getScore(m.id, 'b')} onChange={e => setScore(m.id, 'b', e.target.value)} />
                        <span style={{ fontWeight: 700, fontSize: '.85rem' }}>{m.team_b}</span>
                        <button className="btn btn-primary btn-sm" onClick={() => save(m.id)}>
                          {hasPred ? 'Atualizar' : 'Salvar'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </>
      )}

      {tab === 'done' && (
        done.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
            <p>Nenhum jogo finalizado ainda.</p>
          </div>
        ) : (
          <>
            {done.map(m => {
              const p = preds[m.id];
              const realScore = m.score_a != null ? `${m.score_a} x ${m.score_b}` : '—';
              let ptsClass = '', ptsLabel = '';
              if (p && m.score_a != null) {
                const pts = calcPoints(p.score_a, p.score_b, m.score_a, m.score_b);
                ptsClass = pts === 3 ? 'badge-pts-3' : pts === 1 ? 'badge-pts-1' : 'badge-pts-0';
                ptsLabel = pts === 3 ? '3 pts (EXATO!)' : pts === 1 ? '1 pt (vencedor)' : '0 pts';
              }
              return (
                <div className="match-card" key={m.id}>
                  <div className="match-meta">
                    <span className={`badge ${m.status === 'finished' ? 'badge-finished' : 'badge-live'}`}>
                      {m.status === 'finished' ? 'Finalizado' : 'Ao vivo'}
                    </span>
                    <span className="match-venue">{getLocalDateBR(m.match_date)}</span>
                  </div>
                  <div className="match-teams">
                    <span className="match-team">
                      {m.flag_a && <span className="match-flag">{m.flag_a}</span>} {m.team_a}
                    </span>
                    <span className="match-score">{realScore}</span>
                    <span className="match-team">
                      {m.team_b} {m.flag_b && <span className="match-flag">{m.flag_b}</span>}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '.75rem', flexWrap: 'wrap' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '.8rem', color: 'var(--text-light)' }}>Seu palpite</div>
                      <div style={{ fontWeight: 800 }}>{p ? `${p.score_a} x ${p.score_b}` : 'Nao palpitou'}</div>
                    </div>
                    {ptsLabel && (
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '.8rem', color: 'var(--text-light)' }}>Resultado</div>
                        <span className={`badge ${ptsClass}`}>{ptsLabel}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div className="card" style={{ textAlign: 'center', marginTop: '1rem', background: '#e8f5e9' }}>
              <h3>Seus pontos ate agora: <span style={{ color: 'var(--green-dark)' }}>{totalPts} pontos</span></h3>
            </div>
          </>
        )
      )}
    </>
  );
}
