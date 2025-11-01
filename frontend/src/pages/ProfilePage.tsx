import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FocusItem } from '../types/focus';
import { MetaItem } from '../types/meta';
import { ThemePreferences } from '../types/user';

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const [focos, setFocos] = useState<FocusItem[]>([]);
  const [metas, setMetas] = useState<MetaItem[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [daniel, lauxen, metasRes] = await Promise.all([
          api.get('/focos', { params: { board: 'daniel' } }),
          api.get('/focos', { params: { board: 'lauxen' } }),
          api.get('/metas')
        ]);
        setFocos([...daniel.data.focos, ...lauxen.data.focos]);
        setMetas(metasRes.data.metas);
      } catch (error) {
        console.error(error);
      }
    };
    load();
  }, []);

  const recentFocos = useMemo(
    () =>
      focos
        .filter((focus) => focus.createdBy === user?.id)
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 6),
    [focos, user?.id]
  );

  const metasStatus = useMemo(() => {
    const owned = metas.filter((meta) => meta.participants.includes(user?.id ?? ''));
    return {
      completed: owned.filter((meta) => meta.status === 'completed'),
      inProgress: owned.filter((meta) => meta.status === 'in-progress')
    };
  }, [metas, user?.id]);

  const timelineEvents = useMemo(() => {
    const focusEvents = focos
      .filter((focus) => focus.createdBy === user?.id)
      .map((focus) => ({
        id: `focus-${focus.id}`,
        label: focus.title,
        type: 'foco' as const,
        status: focus.status,
        date: focus.updatedAt,
        board: focus.board
      }));
    const metaEvents = metas
      .filter((meta) => meta.participants.includes(user?.id ?? ''))
      .map((meta) => ({
        id: `meta-${meta.id}`,
        label: meta.title,
        type: 'meta' as const,
        status: meta.status,
        date: meta.updatedAt,
        joint: meta.isJoint
      }));
    return [...focusEvents, ...metaEvents].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [focos, metas, user?.id]);

  const achievements = useMemo(() => {
    const badges: { id: string; title: string; description: string }[] = [];
    if (recentFocos.length >= 3) {
      badges.push({
        id: 'focus-triad',
        title: 'Triade Narrativa',
        description: 'Três focos concluídos em sequência — ritmo brutalista!'
      });
    }
    if (metasStatus.completed.length >= 5) {
      badges.push({
        id: 'meta-maratonista',
        title: 'Maratonista de Metas',
        description: 'Cinco metas concluídas mantém o estúdio em alta.'
      });
    }
    const collaborativeMetas = metas.filter((meta) => meta.isJoint && meta.participants.includes(user?.id ?? ''));
    if (collaborativeMetas.length > 0) {
      badges.push({
        id: 'joint-force',
        title: 'Força Coletiva',
        description: 'Participa de metas conjuntas e fortalece a parceria Daniel & Lauxen.'
      });
    }
    return badges;
  }, [metas, metasStatus.completed.length, recentFocos.length, user?.id]);

  const readingSummary = useMemo(() => {
    const owned = focos.filter((focus) => focus.createdBy === user?.id);
    const completed = owned.filter((focus) => focus.status === 'completed' && focus.readingTimeMinutes);
    const totalMinutes = completed.reduce((acc, focus) => acc + (focus.readingTimeMinutes ?? 0), 0);
    const average = completed.length ? Math.round(totalMinutes / completed.length) : 0;
    return {
      totalMinutes,
      completed: completed.length,
      average
    };
  }, [focos, user?.id]);

  const importQueue = useMemo(() => {
    return focos
      .filter((focus) => focus.createdBy === user?.id)
      .flatMap((focus) =>
        focus.attachments
          .filter((attachment) => attachment.type === 'document')
          .map((attachment) => ({
            focus,
            attachment
          }))
      );
  }, [focos, user?.id]);

  const toggleWidget = async (widget: keyof ThemePreferences['widgets']) => {
    if (!user) return;
    await updateProfile({
      theme: {
        ...user.theme,
        widgets: {
          ...user.theme.widgets,
          [widget]: !user.theme.widgets[widget]
        }
      }
    });
  };

  if (!user) return null;

  return (
    <div style={{ display: 'grid', gap: '1.75rem' }}>
      <section
        style={{
          border: '2px solid var(--border-color)',
          borderRadius: 'var(--card-radius)',
          padding: '2rem',
          background: 'var(--surface-color)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1.5rem',
          alignItems: 'center'
        }}
      >
        {user.avatarUrl ? (
          <img src={user.avatarUrl} alt={user.name} style={{ width: '140px', height: '140px', borderRadius: 'var(--card-radius)', objectFit: 'cover', border: '2px solid var(--border-color)' }} />
        ) : (
          <div
            style={{
              width: '140px',
              height: '140px',
              borderRadius: 'var(--card-radius)',
              border: '2px dashed var(--border-color)',
              display: 'grid',
              placeItems: 'center',
              fontSize: '2.5rem'
            }}
          >
            {user.name.slice(0, 2).toUpperCase()}
          </div>
        )}
        <div style={{ flex: 1, minWidth: '240px' }}>
          <h2 style={{ margin: 0, fontSize: '2.4rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{user.name}</h2>
          <p style={{ margin: '0.5rem 0', color: 'var(--muted-text)' }}>{user.email}</p>
          <p style={{ margin: '0.5rem 0', color: 'var(--muted-text)', maxWidth: '420px' }}>{user.bio || 'Personalize sua bio e mantenha leitores informados sobre seu universo narrativo.'}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1rem', fontSize: '0.85rem', letterSpacing: '0.06em' }}>
            <span style={{ border: '1px solid var(--border-color)', padding: '0.35rem 0.75rem', borderRadius: 'var(--chip-radius)' }}>
              Amigos automáticos: {user.friends.length}
            </span>
            <span style={{ border: '1px solid var(--border-color)', padding: '0.35rem 0.75rem', borderRadius: 'var(--chip-radius)' }}>
              Focos publicados: {focos.filter((focus) => focus.createdBy === user.id).length}
            </span>
            <span style={{ border: '1px solid var(--border-color)', padding: '0.35rem 0.75rem', borderRadius: 'var(--chip-radius)' }}>
              Metas em andamento: {metasStatus.inProgress.length}
            </span>
          </div>
        </div>
        <div style={{ display: 'grid', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Widgets ativos</span>
          {Object.entries(user.theme.widgets).map(([key, value]) => (
            <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <input type="checkbox" checked={value} onChange={() => toggleWidget(key as keyof typeof user.theme.widgets)} />
              <span style={{ textTransform: 'capitalize' }}>{key.replace(/([A-Z])/g, ' $1')}</span>
            </label>
          ))}
        </div>
      </section>

      {user.theme.widgets.recentFocos && (
        <section
          style={{
            border: '2px solid var(--border-color)',
            borderRadius: 'var(--card-radius)',
            padding: '1.5rem',
            background: 'var(--surface-color)'
          }}
        >
          <h3 style={{ margin: '0 0 1rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Focos mais recentes</h3>
          {recentFocos.length === 0 ? (
            <p style={{ color: 'var(--muted-text)' }}>Você ainda não publicou focos. Explore as abas para começar.</p>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {recentFocos.map((focus) => (
                <div key={focus.id} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <strong>{focus.title}</strong>
                    <p style={{ margin: '0.25rem 0 0', color: 'var(--muted-text)', fontSize: '0.9rem' }}>
                      {focus.board === 'daniel' ? 'Daniel' : 'Lauxen'} · {focus.status === 'completed' ? 'Concluído' : 'Em andamento'}
                    </p>
                  </div>
                  {focus.readingTimeMinutes && <span style={{ fontSize: '0.85rem' }}>{focus.readingTimeMinutes} min</span>}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {user.theme.widgets.metasStatus && (
        <section
          style={{
            border: '2px solid var(--border-color)',
            borderRadius: 'var(--card-radius)',
            padding: '1.5rem',
            background: 'var(--surface-color)',
            display: 'grid',
            gap: '1rem',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))'
          }}
        >
          <div>
            <h3 style={{ margin: '0 0 0.5rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Metas em andamento</h3>
            {metasStatus.inProgress.length === 0 ? (
              <p style={{ color: 'var(--muted-text)' }}>Tudo concluído por aqui.</p>
            ) : (
              <ul style={{ margin: 0, paddingLeft: '1rem' }}>
                {metasStatus.inProgress.map((meta) => (
                  <li key={meta.id} style={{ marginBottom: '0.35rem' }}>
                    {meta.title}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <h3 style={{ margin: '0 0 0.5rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Metas concluídas</h3>
            {metasStatus.completed.length === 0 ? (
              <p style={{ color: 'var(--muted-text)' }}>Nenhuma meta concluída ainda.</p>
            ) : (
              <ul style={{ margin: 0, paddingLeft: '1rem' }}>
                {metasStatus.completed.map((meta) => (
                  <li key={meta.id} style={{ marginBottom: '0.35rem' }}>
                    {meta.title}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}

      {user.theme.widgets.friends && (
        <section
          style={{
            border: '2px solid var(--border-color)',
            borderRadius: 'var(--card-radius)',
            padding: '1.5rem',
            background: 'var(--surface-color)'
          }}
        >
          <h3 style={{ margin: '0 0 0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Rede brutalista</h3>
          <p style={{ margin: 0, color: 'var(--muted-text)' }}>
            Todos os escritores são amigos por padrão. Confira a doca inferior para status em tempo real.
          </p>
        </section>
      )}

      {user.theme.widgets.timeline && (
        <section
          style={{
            border: '2px solid var(--border-color)',
            borderRadius: 'var(--card-radius)',
            padding: '1.5rem',
            background: 'var(--surface-color)',
            display: 'grid',
            gap: '1rem'
          }}
        >
          <div>
            <h3 style={{ margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Linha do tempo criativa</h3>
            <p style={{ margin: '0.35rem 0 0', color: 'var(--muted-text)' }}>
              Últimas movimentações entre focos e metas com carimbo brutalista.
            </p>
          </div>
          <ol style={{ margin: 0, paddingLeft: '1.2rem', display: 'grid', gap: '0.75rem' }}>
            {timelineEvents.length === 0 ? (
              <p style={{ color: 'var(--muted-text)' }}>Nenhum evento recente. Conclua um foco ou meta para iniciar.</p>
            ) : (
              timelineEvents.slice(0, 10).map((event) => (
                <li key={event.id} style={{ lineHeight: 1.4 }}>
                  <strong>{event.label}</strong> · {event.type === 'foco' ? `Foco ${event.board}` : 'Meta'} ·{' '}
                  {event.status === 'completed' ? 'Concluído' : 'Em andamento'}
                </li>
              ))
            )}
          </ol>
        </section>
      )}

      {user.theme.widgets.goalsChart && (
        <section
          style={{
            border: '2px solid var(--border-color)',
            borderRadius: 'var(--card-radius)',
            padding: '1.5rem',
            background: 'var(--surface-color)',
            display: 'grid',
            gap: '1rem'
          }}
        >
          <div>
            <h3 style={{ margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Ritmo das metas</h3>
            <p style={{ margin: '0.35rem 0 0', color: 'var(--muted-text)' }}>
              Visualize proporções concluídas e colaborativas.
            </p>
          </div>
          <div style={{ display: 'grid', gap: '0.75rem', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
            <div>
              <span style={{ fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Conclusão</span>
              <div style={{ marginTop: '0.35rem', height: '16px', borderRadius: '999px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${metasStatus.completed.length + metasStatus.inProgress.length === 0 ? 0 : (metasStatus.completed.length / (metasStatus.completed.length + metasStatus.inProgress.length)) * 100}%`,
                    height: '100%',
                    background: 'var(--primary-color)'
                  }}
                />
              </div>
              <p style={{ margin: '0.35rem 0 0', fontSize: '0.9rem' }}>
                {metasStatus.completed.length} concluídas de {metasStatus.completed.length + metasStatus.inProgress.length}
              </p>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Metas conjuntas</span>
              <p style={{ margin: '0.35rem 0 0', fontSize: '0.9rem' }}>
                {metas.filter((meta) => meta.isJoint && meta.participants.includes(user.id)).length} ativas
              </p>
            </div>
          </div>
        </section>
      )}

      {user.theme.widgets.achievements && (
        <section
          style={{
            border: '2px solid var(--border-color)',
            borderRadius: 'var(--card-radius)',
            padding: '1.5rem',
            background: 'var(--surface-color)',
            display: 'grid',
            gap: '1rem'
          }}
        >
          <div>
            <h3 style={{ margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Conquistas</h3>
            <p style={{ margin: '0.35rem 0 0', color: 'var(--muted-text)' }}>
              Desbloqueios brutalistas conforme o progresso do estúdio.
            </p>
          </div>
          {achievements.length === 0 ? (
            <p style={{ color: 'var(--muted-text)' }}>Ainda sem conquistas registradas. Continue explorando focos e metas.</p>
          ) : (
            <div style={{ display: 'grid', gap: '0.75rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
              {achievements.map((badge) => (
                <div
                  key={badge.id}
                  style={{
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--card-radius)',
                    padding: '1rem',
                    background: 'var(--surface-color)',
                    boxShadow: '0 14px 30px rgba(0,0,0,0.08)'
                  }}
                >
                  <strong style={{ display: 'block', fontSize: '1rem' }}>{badge.title}</strong>
                  <span style={{ fontSize: '0.85rem', color: 'var(--muted-text)' }}>{badge.description}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {user.theme.widgets.readingClock && (
        <section
          style={{
            border: '2px solid var(--border-color)',
            borderRadius: 'var(--card-radius)',
            padding: '1.5rem',
            background: 'var(--surface-color)',
            display: 'grid',
            gap: '0.75rem'
          }}
        >
          <div>
            <h3 style={{ margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Relógio de leitura</h3>
            <p style={{ margin: '0.35rem 0 0', color: 'var(--muted-text)' }}>
              Tempo estimado para mergulhar nos focos concluídos.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 120px' }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Total</span>
              <p style={{ margin: '0.25rem 0 0', fontSize: '1.4rem' }}>{readingSummary.totalMinutes} min</p>
            </div>
            <div style={{ flex: '1 1 120px' }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Focos concluídos</span>
              <p style={{ margin: '0.25rem 0 0', fontSize: '1.4rem' }}>{readingSummary.completed}</p>
            </div>
            <div style={{ flex: '1 1 120px' }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Média</span>
              <p style={{ margin: '0.25rem 0 0', fontSize: '1.4rem' }}>{readingSummary.average} min</p>
            </div>
          </div>
        </section>
      )}

      {user.theme.widgets.importQueue && (
        <section
          style={{
            border: '2px solid var(--border-color)',
            borderRadius: 'var(--card-radius)',
            padding: '1.5rem',
            background: 'var(--surface-color)',
            display: 'grid',
            gap: '0.75rem'
          }}
        >
          <div>
            <h3 style={{ margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Fila de importações</h3>
            <p style={{ margin: '0.35rem 0 0', color: 'var(--muted-text)' }}>
              Documentos anexados aguardando revisão ou categorização final.
            </p>
          </div>
          {importQueue.length === 0 ? (
            <p style={{ color: 'var(--muted-text)' }}>Nenhum documento aguardando. Utilize a importação de focos para carregar arquivos do Docs.</p>
          ) : (
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              {importQueue.map(({ focus, attachment }) => (
                <div
                  key={`${focus.id}-${attachment.id}`}
                  style={{
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--card-radius)',
                    padding: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <strong>{attachment.name || 'Documento anexado'}</strong>
                    <p style={{ margin: '0.25rem 0 0', color: 'var(--muted-text)', fontSize: '0.85rem' }}>
                      {focus.title} · {focus.category || 'Sem categoria'}
                    </p>
                  </div>
                  <span style={{ fontSize: '0.8rem', textTransform: 'uppercase' }}>{attachment.mimeType || 'arquivo'}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default ProfilePage;
