import { useState, createContext, useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import PredictionsPage from './pages/PredictionsPage';
import RankingPage from './pages/RankingPage';
import MatchesPage from './pages/MatchesPage';
import AdminPage from './pages/AdminPage';
import StandingsPage from './pages/StandingsPage';

const UserContext = createContext(null);
export const useUser = () => useContext(UserContext);

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('bolao_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (u) => {
    setUser(u);
    localStorage.setItem('bolao_user', JSON.stringify(u));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('bolao_user');
  };

  if (!user) return <LoginPage onLogin={login} />;

  return (
    <UserContext.Provider value={{ user, logout }}>
      <div className="app">
        <Navbar />
        <div className="main">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/palpites" element={<PredictionsPage />} />
            <Route path="/ranking" element={<RankingPage />} />
            <Route path="/jogos" element={<MatchesPage />} />
            <Route path="/classificacao" element={<StandingsPage />} />
            {user.is_admin === 1 && <Route path="/admin" element={<AdminPage />} />}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
        <footer className="footer">
          Bolao da Familia — Copa do Mundo 2026
        </footer>
      </div>
    </UserContext.Provider>
  );
}
