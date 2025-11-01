import { useEffect, useMemo, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FiLogOut, FiSettings, FiUser } from 'react-icons/fi';
import clsx from 'clsx';
import { useAuth } from '../context/AuthContext';
import CustomizationPanel from './CustomizationPanel';
import PresenceDock from './PresenceDock';

const tabs = [
  { to: '/focus/daniel', label: 'Focos Daniel' },
  { to: '/focus/lauxen', label: 'Focos Lauxen' },
  { to: '/metas', label: 'Metas' },
  { to: '/profile', label: 'Perfil' }
];

const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();
  const [showCustomization, setShowCustomization] = useState(false);

  const theme = useMemo(() => user?.theme, [user]);

  useEffect(() => {
    if (!theme) return;
    document.body.style.setProperty('--primary-color', theme.primaryColor);
    document.body.dataset.theme = theme.mode;
    document.body.style.setProperty('--font-family', theme.fontFamily);
  }, [theme]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const backgroundTexture = useMemo(() => {
    switch (theme?.background) {
      case 'linen':
        return 'repeating-linear-gradient(0deg, rgba(0,0,0,0.04) 0, rgba(0,0,0,0.04) 1px, transparent 1px, transparent 8px)';
      case 'charcoal':
        return 'linear-gradient(135deg, #111 0%, #1b1b1b 50%, #111 100%)';
      case 'canvas':
        return 'repeating-radial-gradient(circle at 20% 20%, rgba(0,0,0,0.06), rgba(0,0,0,0.06) 1px, transparent 1px, transparent 60px)';
      case 'grain':
        return 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'140\' height=\'140\'%3E%3Cfilter id=\'n%27%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'2.4\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.08\'/%3E%3C/svg%3E")';
      case 'stone':
        return 'repeating-linear-gradient(45deg, rgba(18,18,18,0.07) 0 10px, transparent 10px 20px), repeating-linear-gradient(-45deg, rgba(18,18,18,0.05) 0 12px, transparent 12px 24px)';
      case 'ink':
        return 'radial-gradient(circle at 20% 20%, rgba(0,0,0,0.14), rgba(0,0,0,0) 45%), radial-gradient(circle at 80% 30%, rgba(0,0,0,0.14), rgba(0,0,0,0) 45%), #f4f1ea';
      case 'velvet':
        return 'linear-gradient(160deg, rgba(30,10,20,0.85), rgba(15,5,10,0.95))';
      default:
        return 'radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(245,245,245,0.9) 40%, rgba(250,250,250,0.96) 100%)';
    }
  }, [theme?.background]);

  return (
    <div className={clsx('app-shell', theme?.background)} style={{ minHeight: '100vh', backgroundImage: backgroundTexture }}>
      <header
        style={{
          borderBottom: '2px solid var(--border-color)',
          padding: '1.25rem 3vw',
          background: 'transparent'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '2rem'
          }}
        >
          <button
            onClick={() => navigate('/focus/daniel')}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              textAlign: 'left',
              display: 'grid',
              gap: '0.35rem'
            }}
          >
            <h1
              style={{
                margin: 0,
                fontSize: '2.2rem',
                letterSpacing: '0.12em',
                color: 'var(--primary-color)',
                textTransform: 'uppercase'
              }}
            >
              StoryLab
            </h1>
            <span style={{ fontSize: '0.85rem', color: 'var(--muted-text)' }}>
              Brutalismo narrativo para Daniel &amp; Lauxen — inspirado em Utrecht.jp
            </span>
          </button>

          <nav style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', fontSize: '0.95rem' }}>
            {tabs.map((tab) => (
              <NavLink
                key={tab.to}
                to={tab.to}
                className={({ isActive }) =>
                  clsx('nav-link', {
                    active: isActive
                  })
                }
                style={({ isActive }) => ({
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  position: 'relative',
                  color: isActive ? 'var(--primary-color)' : 'var(--text-color)'
                })}
              >
                <span className="nav-label" style={{ display: 'inline-block', paddingBottom: '0.4rem' }}>
                  {tab.label}
                </span>
              </NavLink>
            ))}
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className={clsx('brutalist-card', 'brutalist-hover')} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.9rem' }}>
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} style={{ width: '40px', height: '40px', borderRadius: 'var(--button-radius)', objectFit: 'cover' }} />
              ) : (
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--button-radius)',
                    background: 'var(--primary-color)',
                    display: 'grid',
                    placeItems: 'center',
                    color: 'white',
                    fontWeight: 600
                  }}
                >
                  <FiUser />
                </div>
              )}
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user?.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted-text)' }}>online agora</div>
              </div>
            </div>

            <button className="brutalist-button" onClick={() => setShowCustomization((prev) => !prev)} aria-label="Abrir personalização">
              <FiSettings size={18} />
            </button>

            <button className="brutalist-button" onClick={() => logout()} aria-label="Sair">
              <FiLogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <main style={{ padding: '2rem 3vw 4rem', maxWidth: '1440px', margin: '0 auto' }}>{children}</main>

      {showCustomization && theme && <CustomizationPanel onClose={() => setShowCustomization(false)} theme={theme} />}

      <PresenceDock token={token} />
    </div>
  );
};

export default AppShell;
