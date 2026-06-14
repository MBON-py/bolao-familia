const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Erro desconhecido' }));
    throw new Error(err.detail || `Erro ${res.status}`);
  }
  return res.json();
}

export const api = {
  register: (data) => request('/users/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (email) => request('/users/login', { method: 'POST', body: JSON.stringify({ email }) }),
  getUsers: () => request('/users'),
  getMatches: () => request('/matches'),
  addMatch: (data) => request('/matches', { method: 'POST', body: JSON.stringify(data) }),
  updateMatch: (id, data) => request(`/matches/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  setResult: (id, score_a, score_b) =>
    request(`/matches/${id}/result`, { method: 'PUT', body: JSON.stringify({ score_a, score_b }) }),
  setStatus: (id, status) =>
    request(`/matches/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  savePrediction: (data) => request('/predictions', { method: 'POST', body: JSON.stringify(data) }),
  getUserPredictions: (userId) => request(`/predictions/user/${userId}`),
  getMatchPredictions: (matchId) => request(`/predictions/match/${matchId}`),
  getRanking: () => request('/ranking'),
  toggleAdmin: (userId, isAdmin) =>
    request(`/users/${userId}/admin`, { method: 'PUT', body: JSON.stringify({ is_admin: isAdmin }) }),
  getStandings: () => request('/standings'),
};
