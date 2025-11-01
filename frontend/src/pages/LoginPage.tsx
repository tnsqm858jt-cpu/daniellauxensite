import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const { authenticate, loginWithGoogle } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'register') {
        await authenticate('register', { email, password, name });
      } else {
        await authenticate('login', { email, password });
      }
      const from = (location.state as { from?: Location })?.from?.pathname ?? '/focus/daniel';
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Não foi possível entrar');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle(`${crypto.randomUUID()}@storylab.dev`, name || 'Convidado');
      navigate('/focus/daniel', { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Falha ao conectar com Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ width: 'min(540px, 92vw)', display: 'grid', gap: '2rem' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #c3201f', paddingBottom: '1rem' }}>
          <h1 style={{ margin: 0, fontSize: '2.4rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: '#c3201f' }}>StoryLab</h1>
          <span style={{ fontSize: '0.85rem', color: '#8a1815', letterSpacing: '0.12em' }}>{mode === 'login' ? 'Login' : 'Criar conta'}</span>
        </header>

        <nav style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className="brutalist-button"
            data-variant={mode === 'login' ? 'primary' : undefined}
            onClick={() => setMode('login')}
            style={{ flex: 1 }}
          >
            Entrar
          </button>
          <button
            className="brutalist-button"
            data-variant={mode === 'register' ? 'primary' : undefined}
            onClick={() => setMode('register')}
            style={{ flex: 1 }}
          >
            Criar conta
          </button>
        </nav>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
          {mode === 'register' && (
            <label style={{ display: 'grid', gap: '0.35rem', fontSize: '0.85rem', letterSpacing: '0.08em' }}>
              Nome completo
              <input value={name} onChange={(event) => setName(event.target.value)} required style={{ border: '1px solid #c3201f', padding: '0.85rem', borderRadius: 'var(--card-radius)' }} />
            </label>
          )}
          <label style={{ display: 'grid', gap: '0.35rem', fontSize: '0.85rem', letterSpacing: '0.08em' }}>
            E-mail
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required style={{ border: '1px solid #c3201f', padding: '0.85rem', borderRadius: 'var(--card-radius)' }} />
          </label>
          <label style={{ display: 'grid', gap: '0.35rem', fontSize: '0.85rem', letterSpacing: '0.08em' }}>
            Senha
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required style={{ border: '1px solid #c3201f', padding: '0.85rem', borderRadius: 'var(--card-radius)' }} />
          </label>
          {error && <div style={{ color: '#c3201f', fontSize: '0.85rem' }}>{error}</div>}
          <button type="submit" className="brutalist-button" data-variant="primary" disabled={loading}>
            {loading ? 'Processando…' : mode === 'login' ? 'Entrar' : 'Criar conta'}
          </button>
        </form>

        {mode === 'register' && (
          <button className="brutalist-button" onClick={handleGoogle} disabled={loading} style={{ borderColor: '#c3201f', color: '#c3201f' }}>
            Conectar com Google fictício
          </button>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
