import { useEffect, useState } from 'react';
import { api } from '../api';
import toast from 'react-hot-toast';
import { formatTime, getLocalDateBR } from '../dateUtils';

export default function AdminPage() {
  const [matches, setMatches] = useState([]);
  const [users, setUsers] = useState([]);
  const [ranking, setRanking] = useState([]);
  const [tab, setTab] = useState('results');
  const [scores, setScores] = useState({});
  const [matchPreds, setMatchPreds] = useState({});
  const [editingMatch, setEditingMatch] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [newMatch, setNewMatch] = useState({
    team_a: '', team_b: '', flag_a: '', flag_b: '',
    match_date: '', phase: 'Fase de Grupos', group_name: '', venue: '',
  });
  const [retroUserId, setRetroUserId] = useState('');
  const [retroInputs, setRetroInputs] = useState({});

  const load = () => {
    api.getMatches().then(setMatches);
    api.getUsers().then(setUsers);
    api.getRanking().then(setRanking);
  };

  useEffect(load, []);

  const pending = matches.filter(m => m.status === 'scheduled' || m.status === 'in_progress');
  const scheduled = matches.filter(m => m.status === 'scheduled');
  const tbd = matches.filter(m => m.team_a === 'A definir');

  const getScore = (id, side) => scores[`${id}_${side}`] ?? 0;
  const setScore = (id, side, val) => setScores(s => ({ ...s, [`${id}_${side}`]: Math.max(0, Number(val) || 0) }));

  const finalize = async (m) => {
    try {
      await api.setResult(m.id, getScore(m.id, 'a'), getScore(m.id, 'b'));
      toast.success(`Resultado registrado! Ranking recalculado.`);
      load();
    } catch (err) { toast.error(err.message); }
  };

  const startMatch = async (m) => {
    try {
      await api.setStatus(m.id, 'in_progress');
      toast.success(`${m.team_a} x ${m.team_b} em andamento!`);
      load();
    } catch (err) { toast.error(err.message); }
  };

  const loadPreds = async (matchId) => {
    const preds = await api.getMatchPredictions(matchId);
    setMatchPreds(mp => ({ ...mp, [matchId]: preds }));
  };

  const addMatch = async (e) => {
    e.preventDefault();
    if (!newMatch.team_a || !newMatch.team_b || !newMatch.match_date) return toast.error('Preencha times e data!');
    try {
      await api.addMatch(newMatch);
      toast.success('Jogo adicionado!');
      setNewMatch({ team_a: '', team_b: '', flag_a: '', flag_b: '', match_date: '', phase: 'Fase de Grupos', group_name: '', venue: '' });
      load();
    } catch (err) { toast.error(err.message); }
  };

  const startEdit = (m) => {
    setEditingMatch(m.id);
    setEditForm({ team_a: m.team_a, team_b: m.team_b, flag_a: m.flag_a, flag_b: m.flag_b, venue: m.venue });
  };

  const saveEdit = async (matchId) => {
    try {
      await api.updateMatch(matchId, editForm);
      toast.success('Jogo atualizado!');
      setEditingMatch(null);
      load();
    } catch (err) { toast.error(err.message); }
  };

  const medals = ['🥇', '🥈', '🥉'];

  const finished = matches.filter(m => m.status === 'finished');

  const loadRetroUser = async (userId) => {
    setRetroUserId(userId);
    if (!userId) { setRetroInputs({}); return; }
    const preds = await api.getUserPredictions(Number(userId));
    const byMatch = {};
    preds.forEach(p => { byMatch[p.match_id] = { a: p.score_a, b: p.score_b }; });
    const inputs = {};
    finished.forEach(m => {
      inputs[m.id] = byMatch[m.id] ?? { a: '', b: '' };
    });
    setRetroInputs(inputs);
  };

  const setRetroScore = (matchId, side, val) => {
    setRetroInputs(prev => ({
      ...prev,
      [matchId]: { ...prev[matchId], [side]: Math.max(0, Number(val) || 0) },
    }));
  };

  const saveRetroPred = async (matchId) => {
    const inp = retroInputs[matchId];
    if (inp.a === '' || inp.b === '') return toast.error('Preencha o placar!');
    try {
      await api.adminSavePrediction({
        user_id: Number(retroUserId),
        match_id: matchId,
        score_a: Number(inp.a),
        score_b: Number(inp.b),
      });
      toast.success('Palpite salvo!');
    } catch (err) { toast.error(err.message); }
  };

  return (
    <>
      <h1 className="section-title" style={{ marginTop: 0 }}>Administracao do Bolao</h1>

      <div className="tabs">
        {[
          ['results', 'Resultados'],
          ['edit', 'Editar Jogos'],
          ['add', 'Novo Jogo'],
          ['manage', 'Gerenciar'],
          ['palpites', 'Palpites'],
          ['users', 'Participantes'],
          ['ranking', 'Ranking'],
        ].map(([key, label]) => (
          <button key={key} className={`tab ${tab === key ? 'active' : ''}`} onClick={() => setTab(key)}>{label}</button>
        ))}
      </div>

      {/* Results */}
      {tab === 'results' && (
        <div>
          <h2 className="section-title">Inserir Resultado Oficial</h2>
          {pending.filter(m => m.team_a !== 'A definir').length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
              <p>Nenhum jogo pendente de resultado.</p>
            </div>
          ) : pending.filter(m => m.team_a !== 'A definir').map(m => (
            <div className="match-card" key={m.id}>
              <div className="match-meta">
                <span className={`badge ${m.status === 'in_progress' ? 'badge-live' : 'badge-scheduled'}`}>
                  {m.status === 'in_progress' ? 'Em andamento' : formatTime(m.match_date)}
                </span>
                <span className="match-venue">{getLocalDateBR(m.match_date)} · {m.group_name}</span>
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
                <span style={{ fontWeight: 700 }}>{m.team_a}</span>
                <input type="number" className="form-control input-score" min="0" max="20"
                  value={getScore(m.id, 'a')} onChange={e => setScore(m.id, 'a', e.target.value)} />
                <span style={{ fontWeight: 800, color: 'var(--text-light)' }}>x</span>
                <input type="number" className="form-control input-score" min="0" max="20"
                  value={getScore(m.id, 'b')} onChange={e => setScore(m.id, 'b', e.target.value)} />
                <span style={{ fontWeight: 700 }}>{m.team_b}</span>
                <button className="btn btn-primary btn-sm" onClick={() => finalize(m)}>Finalizar</button>
              </div>
              <div style={{ textAlign: 'center', marginTop: '.5rem' }}>
                <button className="btn btn-outline btn-sm" onClick={() => loadPreds(m.id)}>
                  Ver palpites ({matchPreds[m.id]?.length ?? '...'})
                </button>
                {matchPreds[m.id] && (
                  <div style={{ marginTop: '.5rem', textAlign: 'left' }}>
                    {matchPreds[m.id].length === 0
                      ? <p style={{ color: 'var(--text-light)', textAlign: 'center', fontSize: '.85rem' }}>Nenhum palpite.</p>
                      : matchPreds[m.id].map(p => (
                        <div key={p.id} style={{ padding: '.3rem .5rem', borderBottom: '1px solid #f0f0f0', fontSize: '.9rem' }}>
                          <strong>{p.short_name}</strong>: {p.score_a} x {p.score_b}
                        </div>
                      ))
                    }
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit matches (TBD) */}
      {tab === 'edit' && (
        <div>
          <h2 className="section-title">Editar Jogos (Fases Eliminatorias)</h2>
          <p style={{ color: 'var(--text-light)', marginBottom: '1rem' }}>
            Atualize os times das fases eliminatorias conforme a classificacao for definida.
          </p>
          {tbd.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
              <p>Todos os jogos ja tem times definidos.</p>
            </div>
          ) : tbd.map(m => (
            <div className="match-card" key={m.id}>
              <div className="match-meta">
                <span className="badge badge-scheduled">{m.phase} · {m.group_name}</span>
                <span className="match-venue">{m.match_date}</span>
              </div>
              {editingMatch === m.id ? (
                <div className="admin-form" style={{ marginTop: '.75rem' }}>
                  <div className="form-group">
                    <label>Time A</label>
                    <input className="form-control" value={editForm.team_a}
                      onChange={e => setEditForm({ ...editForm, team_a: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Time B</label>
                    <input className="form-control" value={editForm.team_b}
                      onChange={e => setEditForm({ ...editForm, team_b: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Bandeira A</label>
                    <input className="form-control" value={editForm.flag_a}
                      onChange={e => setEditForm({ ...editForm, flag_a: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Bandeira B</label>
                    <input className="form-control" value={editForm.flag_b}
                      onChange={e => setEditForm({ ...editForm, flag_b: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Local</label>
                    <input className="form-control" value={editForm.venue}
                      onChange={e => setEditForm({ ...editForm, venue: e.target.value })} />
                  </div>
                  <div className="full-width" style={{ display: 'flex', gap: '.5rem' }}>
                    <button className="btn btn-primary" onClick={() => saveEdit(m.id)}>Salvar</button>
                    <button className="btn btn-outline" onClick={() => setEditingMatch(null)}>Cancelar</button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '.5rem' }}>
                  <span style={{ fontWeight: 700 }}>
                    {m.flag_a} {m.team_a} vs {m.team_b} {m.flag_b}
                  </span>
                  <button className="btn btn-outline btn-sm" onClick={() => startEdit(m)}>Editar</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add match */}
      {tab === 'add' && (
        <div>
          <h2 className="section-title">Adicionar Novo Jogo</h2>
          <form className="card" onSubmit={addMatch}>
            <div className="admin-form">
              <div className="form-group">
                <label>Time A</label>
                <input className="form-control" placeholder="Ex: Brasil" value={newMatch.team_a}
                  onChange={e => setNewMatch({ ...newMatch, team_a: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Time B</label>
                <input className="form-control" placeholder="Ex: Argentina" value={newMatch.team_b}
                  onChange={e => setNewMatch({ ...newMatch, team_b: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Data e hora</label>
                <input className="form-control" placeholder="2026-07-01 21:00" value={newMatch.match_date}
                  onChange={e => setNewMatch({ ...newMatch, match_date: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Fase</label>
                <select className="form-control" value={newMatch.phase}
                  onChange={e => setNewMatch({ ...newMatch, phase: e.target.value })}>
                  {['Fase de Grupos', 'Segunda Fase', 'Oitavas de Final', 'Quartas de Final', 'Semifinal', 'Disputa de 3o lugar', 'Final'].map(p => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Grupo / Jogo</label>
                <input className="form-control" placeholder="Grupo A / Jogo 33" value={newMatch.group_name}
                  onChange={e => setNewMatch({ ...newMatch, group_name: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Local</label>
                <input className="form-control" placeholder="SoFi Stadium" value={newMatch.venue}
                  onChange={e => setNewMatch({ ...newMatch, venue: e.target.value })} />
              </div>
              <div className="full-width">
                <button className="btn btn-gold btn-full" type="submit">Adicionar Jogo</button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Manage */}
      {tab === 'manage' && (
        <div>
          <h2 className="section-title">Iniciar Jogos</h2>
          {scheduled.filter(m => m.team_a !== 'A definir').length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
              <p>Nenhum jogo pronto para iniciar.</p>
            </div>
          ) : scheduled.filter(m => m.team_a !== 'A definir').map(m => (
            <div className="match-card" key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>{m.flag_a} {m.team_a} vs {m.team_b} {m.flag_b}</strong>
                <div style={{ fontSize: '.8rem', color: 'var(--text-light)' }}>{m.match_date} · {m.group_name}</div>
              </div>
              <button className="btn btn-danger btn-sm" onClick={() => startMatch(m)}>Iniciar</button>
            </div>
          ))}
        </div>
      )}

      {/* Palpites retroativos */}
      {tab === 'palpites' && (
        <div>
          <h2 className="section-title">Cadastrar Palpites Anteriores</h2>
          <p style={{ color: 'var(--text-light)', marginBottom: '1rem' }}>
            Registre palpites de participantes para jogos ja finalizados.
          </p>
          <div className="card" style={{ marginBottom: '1rem', padding: '1rem' }}>
            <label style={{ fontWeight: 600, display: 'block', marginBottom: '.5rem' }}>Participante</label>
            <select
              className="form-control"
              value={retroUserId}
              onChange={e => loadRetroUser(e.target.value)}
            >
              <option value="">Selecione um participante...</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>

          {retroUserId && finished.length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
              <p>Nenhum jogo finalizado ainda.</p>
            </div>
          )}

          {retroUserId && finished.map(m => {
            const inp = retroInputs[m.id] ?? { a: '', b: '' };
            const hasExisting = inp.a !== '' && inp.b !== '';
            return (
              <div className="match-card" key={m.id}>
                <div className="match-meta">
                  <span className="badge badge-finished">Finalizado</span>
                  <span className="match-venue">{getLocalDateBR(m.match_date)} · {m.group_name}</span>
                </div>
                <div className="match-teams" style={{ marginBottom: '.5rem' }}>
                  <span className="match-team">{m.flag_a && <span className="match-flag">{m.flag_a}</span>} {m.team_a}</span>
                  <span className="match-vs">{m.score_a} x {m.score_b}</span>
                  <span className="match-team">{m.team_b} {m.flag_b && <span className="match-flag">{m.flag_b}</span>}</span>
                </div>
                <div className="pred-row">
                  <span style={{ fontSize: '.85rem', color: 'var(--text-light)' }}>Palpite:</span>
                  <input type="number" className="form-control input-score" min="0" max="20"
                    placeholder="0"
                    value={inp.a}
                    onChange={e => setRetroScore(m.id, 'a', e.target.value)} />
                  <span style={{ fontWeight: 800, color: 'var(--text-light)' }}>x</span>
                  <input type="number" className="form-control input-score" min="0" max="20"
                    placeholder="0"
                    value={inp.b}
                    onChange={e => setRetroScore(m.id, 'b', e.target.value)} />
                  <button className="btn btn-primary btn-sm" onClick={() => saveRetroPred(m.id)}>
                    {hasExisting ? 'Atualizar' : 'Salvar'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Users */}
      {tab === 'users' && (
        <div>
          <h2 className="section-title">Participantes ({users.length})</h2>
          {users.map(u => (
            <div className="match-card" key={u.id} style={{ padding: '.75rem 1.25rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <strong>{u.name}</strong>
              {u.is_admin === 1 && <span className="badge badge-finished">Admin</span>}
              <span style={{ color: 'var(--text-light)', fontSize: '.9rem' }}>{u.email}</span>
              <span style={{ color: 'var(--text-light)', fontSize: '.9rem' }}>{u.phone}</span>
              <button
                className={`btn btn-sm ${u.is_admin === 1 ? 'btn-outline' : 'btn-primary'}`}
                style={{ marginLeft: 'auto' }}
                onClick={async () => {
                  try {
                    await api.toggleAdmin(u.id, u.is_admin === 1 ? 0 : 1);
                    toast.success(u.is_admin === 1 ? `${u.name} removido(a) como admin` : `${u.name} promovido(a) a admin`);
                    load();
                  } catch (err) { toast.error(err.message); }
                }}
              >
                {u.is_admin === 1 ? 'Remover Admin' : 'Tornar Admin'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Ranking */}
      {tab === 'ranking' && (
        <div>
          <h2 className="section-title">Ranking Atual</h2>
          {ranking.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
              <p>Nenhum participante cadastrado.</p>
            </div>
          ) : ranking.map((p, i) => (
            <div className="ranking-row" key={p.user_id}>
              <div className="ranking-pos">{i < 3 ? medals[i] : `${i + 1}o`}</div>
              <div className="ranking-name">{p.short_name}</div>
              <div className="ranking-extra">{p.exact_hits} exatos · {p.winner_hits} acertos</div>
              <div className="ranking-pts">{p.points} pts</div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
