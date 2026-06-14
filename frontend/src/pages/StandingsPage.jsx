import { useEffect, useState } from 'react';
import { api } from '../api';

export default function StandingsPage() {
  const [standings, setStandings] = useState({});
  const [selectedGroup, setSelectedGroup] = useState('Todos');

  useEffect(() => { api.getStandings().then(setStandings); }, []);

  const groups = Object.keys(standings).sort();
  const displayed = selectedGroup === 'Todos' ? groups : groups.filter(g => g === selectedGroup);

  return (
    <>
      <h1 className="section-title" style={{ marginTop: 0 }}>Classificacao dos Grupos</h1>
      <p style={{ color: 'var(--text-light)', marginBottom: '1rem' }}>
        Os 2 primeiros de cada grupo avancam para a Segunda Fase.
      </p>

      <div className="filters" style={{ marginBottom: '1.5rem' }}>
        <div>
          <label style={{ fontSize: '.8rem', fontWeight: 700 }}>Grupo</label><br />
          <select value={selectedGroup} onChange={e => setSelectedGroup(e.target.value)}>
            <option>Todos</option>
            {groups.map(g => <option key={g}>{g}</option>)}
          </select>
        </div>
      </div>

      {groups.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Carregando classificacao...</p>
        </div>
      )}

      {displayed.map(g => (
        <div key={g} style={{ marginBottom: '2rem' }}>
          <h2 className="section-title" style={{ fontSize: '1.1rem' }}>Grupo {g}</h2>
          <div className="card" style={{ padding: 0, overflow: 'auto' }}>
            <table className="standings-table">
              <thead>
                <tr>
                  <th style={{ width: '2rem', textAlign: 'center' }}>#</th>
                  <th>Selecao</th>
                  <th>J</th>
                  <th>V</th>
                  <th>E</th>
                  <th>D</th>
                  <th>GP</th>
                  <th>GC</th>
                  <th>SG</th>
                  <th>Pts</th>
                </tr>
              </thead>
              <tbody>
                {(standings[g] || []).map((t, i) => (
                  <tr key={t.team} className={i < 2 ? 'qualified' : ''}>
                    <td style={{ textAlign: 'center', fontWeight: 700 }}>{i + 1}</td>
                    <td style={{ fontWeight: 600 }}>
                      {t.flag && <span style={{ marginRight: '.4rem' }}>{t.flag}</span>}
                      {t.team}
                    </td>
                    <td>{t.played}</td>
                    <td>{t.won}</td>
                    <td>{t.drawn}</td>
                    <td>{t.lost}</td>
                    <td>{t.gf}</td>
                    <td>{t.ga}</td>
                    <td>{t.gd}</td>
                    <td style={{ fontWeight: 800 }}>{t.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </>
  );
}
