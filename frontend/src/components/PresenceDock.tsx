import { useMemo } from 'react';
import { FiCircle } from 'react-icons/fi';
import { usePresence } from '../hooks/usePresence';
import { useAuth } from '../context/AuthContext';

interface PresenceDockProps {
  token: string | null;
}

const PresenceDock: React.FC<PresenceDockProps> = ({ token }) => {
  const { user } = useAuth();
  const onlineUsers = usePresence(token);

  const friendsOnline = useMemo(
    () =>
      onlineUsers
        .filter((online) => online.id !== user?.id)
        .map((online) => ({
          id: online.id,
          name: online.name,
          avatarUrl: online.avatarUrl
        })),
    [onlineUsers, user?.id]
  );

  return (
    <aside
      className="fade-in brutalist-card"
      style={{
        position: 'fixed',
        right: '1.75rem',
        bottom: '1.75rem',
        width: '230px',
        padding: '1.1rem',
        zIndex: 20
      }}
    >
      <h3 style={{ margin: '0 0 0.85rem', fontSize: '0.85rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
        {friendsOnline.length ? 'Amigos online' : 'Você está sozinho aqui'}
      </h3>
      <div style={{ display: 'grid', gap: '0.75rem' }}>
        {friendsOnline.map((friend) => (
          <div key={friend.id} className="brutalist-hover" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.45rem 0.25rem', border: '1px dashed transparent', borderRadius: 'var(--button-radius)' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: 'var(--button-radius)', overflow: 'hidden', background: 'var(--primary-color)', display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 600 }}>
              {friend.avatarUrl ? (
                <img src={friend.avatarUrl} alt={friend.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                friend.name.charAt(0)
              )}
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{friend.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--muted-text)' }}>
                <FiCircle color="#4ade80" size={10} />
                Disponível
              </div>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default PresenceDock;
