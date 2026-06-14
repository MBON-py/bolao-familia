import { useState } from 'react';
import { api } from '../api';
import toast from 'react-hot-toast';

export default function LoginPage({ onLogin }) {
  const [tab, setTab] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!form.email) return toast.error('Digite seu e-mail!');
    setLoading(true);
    try {
      const user = await api.login(form.email);
      toast.success(`Bem-vindo(a), ${user.short_name}!`);
      onLogin(user);
    } catch (err) {
      toast.error(err.message === 'E-mail nao encontrado'
        ? 'E-mail nao encontrado. Cadastre-se primeiro!'
        : err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone) return toast.error('Preencha todos os campos!');
    setLoading(true);
    try {
      const user = await api.register(form);
      toast.success(`Bem-vindo(a), ${user.short_name}!`);
      onLogin(user);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div style={{ textAlign: 'center', marginBottom: '2rem', color: 'white' }}>
        <div style={{ fontSize: '4rem' }}>⚽</div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, textShadow: '2px 2px 8px rgba(0,0,0,.3)' }}>
          Bolao da Familia
        </h1>
        <p style={{ fontSize: '1.2rem', opacity: .9 }}>Copa do Mundo 2026</p>
      </div>

      <div className="login-card">
        <div className="login-tabs">
          <button className={`login-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => setTab('login')}>
            Entrar
          </button>
          <button className={`login-tab ${tab === 'register' ? 'active' : ''}`} onClick={() => setTab('register')}>
            Cadastrar
          </button>
        </div>

        {tab === 'login' ? (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>E-mail</label>
              <input className="form-control" type="email" placeholder="seu@email.com"
                value={form.email} onChange={set('email')} />
            </div>
            <button className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label>Nome completo</label>
              <input className="form-control" placeholder="Ex: Joao da Silva"
                value={form.name} onChange={set('name')} />
            </div>
            <div className="form-group">
              <label>E-mail</label>
              <input className="form-control" type="email" placeholder="seu@email.com"
                value={form.email} onChange={set('email')} />
            </div>
            <div className="form-group">
              <label>Telefone</label>
              <input className="form-control" placeholder="(11) 99999-9999"
                value={form.phone} onChange={set('phone')} />
            </div>
            <button className="btn btn-gold btn-full" disabled={loading}>
              {loading ? 'Cadastrando...' : 'Cadastrar'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
