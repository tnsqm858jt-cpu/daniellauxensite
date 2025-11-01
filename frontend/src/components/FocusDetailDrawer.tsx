import { FocusItem } from '../types/focus';

interface FocusDetailDrawerProps {
  focus: FocusItem | null;
  onClose: () => void;
  onEdit: (focus: FocusItem) => void;
  isOwner: boolean;
  onPatch: (id: string, payload: Partial<FocusItem>) => Promise<void>;
  onRate: (focus: FocusItem, value: number) => void;
}

const FocusDetailDrawer: React.FC<FocusDetailDrawerProps> = ({ focus, onClose, onEdit, isOwner, onPatch, onRate }) => {
  if (!focus) return null;

  const toggleBoolean = async (field: keyof FocusItem) => {
    await onPatch(focus.id, { [field]: !(focus as any)[field] } as Partial<FocusItem>);
  };

  const handleStatusChange = async () => {
    const nextStatus = focus.status === 'completed' ? 'in-progress' : 'completed';
    await onPatch(focus.id, { status: nextStatus });
  };

  const ratingButtons = [1, 2, 3, 4, 5];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.55)',
        display: 'grid',
        placeItems: 'center',
        zIndex: 40,
        padding: '3rem 1.5rem'
      }}
    >
      <div
        className="fade-in"
        style={{
          width: 'min(1100px, 95vw)',
          maxHeight: '92vh',
          overflow: 'auto',
          borderRadius: 'var(--card-radius)',
          border: '2px solid var(--border-color)',
          background: 'var(--surface-color)',
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)',
          gap: '2rem',
          padding: '2.5rem'
        }}
      >
        <section style={{ display: 'grid', gap: '1.5rem' }}>
          <header style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
            {focus.coverImage ? (
              <img
                src={focus.coverImage}
                alt={focus.title}
                style={{ width: '160px', height: '160px', objectFit: 'cover', borderRadius: 'var(--card-radius)', border: '2px solid var(--border-color)' }}
              />
            ) : (
              <div
                style={{
                  width: '160px',
                  height: '160px',
                  borderRadius: 'var(--card-radius)',
                  border: '2px dashed var(--border-color)',
                  display: 'grid',
                  placeItems: 'center',
                  color: 'var(--muted-text)'
                }}
              >
                Sem capa
              </div>
            )}
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '2.4rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{focus.title}</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', fontSize: '0.8rem', letterSpacing: '0.08em' }}>
                <span style={{ border: '1px solid var(--border-color)', padding: '0.3rem 0.7rem', borderRadius: 'var(--chip-radius)' }}>
                  {focus.board === 'daniel' ? 'Focos Daniel' : 'Focos Lauxen'}
                </span>
                <span style={{ border: '1px solid var(--border-color)', padding: '0.3rem 0.7rem', borderRadius: 'var(--chip-radius)' }}>
                  {focus.status === 'completed' ? 'Concluído' : 'Em andamento'}
                </span>
                {focus.category && (
                  <span style={{ border: '1px solid var(--border-color)', padding: '0.3rem 0.7rem', borderRadius: 'var(--chip-radius)' }}>
                    {focus.category}
                  </span>
                )}
                {focus.subcategories.map((sub) => (
                  <span key={sub} style={{ border: '1px solid var(--border-color)', padding: '0.3rem 0.7rem', borderRadius: 'var(--chip-radius)' }}>
                    {sub}
                  </span>
                ))}
                {focus.readingTimeMinutes && (
                  <span style={{ border: '1px solid var(--border-color)', padding: '0.3rem 0.7rem', borderRadius: 'var(--chip-radius)' }}>
                    {focus.readingTimeMinutes} min leitura
                  </span>
                )}
              </div>
              <p style={{ margin: 0, color: 'var(--muted-text)', maxWidth: '560px' }}>{focus.body.substring(0, 220)}{focus.body.length > 220 ? '…' : ''}</p>
            </div>
          </header>

          <article
            style={{
              border: '1px dashed var(--border-color)',
              borderRadius: 'var(--card-radius)',
              padding: '1.5rem',
              background: 'var(--background-color)',
              display: 'grid',
              gap: '0.75rem'
            }}
          >
            <span style={{ fontSize: '0.85rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--muted-text)' }}>
              Corpo principal
            </span>
            <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{focus.body || 'Sem texto cadastrado ainda.'}</div>
          </article>

          {focus.attachments?.length ? (
            <section style={{ display: 'grid', gap: '1rem' }}>
              <h3 style={{ margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Anexos</h3>
              {focus.attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  style={{
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--card-radius)',
                    padding: '1rem',
                    background: 'var(--surface-color)',
                    display: 'grid',
                    gap: '0.5rem'
                  }}
                >
                  <strong>{attachment.name}</strong>
                  {attachment.type === 'text' ? (
                    <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{attachment.content}</div>
                  ) : attachment.type === 'image' ? (
                    attachment.content ? (
                      <img
                        src={attachment.content}
                        alt={attachment.name}
                        style={{
                          width: '100%',
                          maxHeight: '320px',
                          objectFit: 'cover',
                          borderRadius: 'var(--card-radius)',
                          border: '1px solid var(--border-color)'
                        }}
                      />
                    ) : (
                      <span style={{ color: 'var(--muted-text)' }}>Imagem não disponível</span>
                    )
                  ) : (
                    attachment.content ? (
                      <a
                        href={attachment.content}
                        download={attachment.name || 'documento-storylab'}
                        style={{ textDecoration: 'underline', fontSize: '0.9rem' }}
                      >
                        Baixar documento
                      </a>
                    ) : (
                      <span style={{ color: 'var(--muted-text)' }}>Documento anexado sem pré-visualização</span>
                    )
                  )}
                </div>
              ))}
            </section>
          ) : null}
        </section>

        <aside style={{ display: 'grid', gap: '1.5rem', alignContent: 'flex-start' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Ações</h3>
            <button
              onClick={onClose}
              style={{ border: '2px solid var(--border-color)', background: 'transparent', padding: '0.4rem 0.8rem', cursor: 'pointer', borderRadius: 'var(--chip-radius)' }}
            >
              Fechar
            </button>
          </div>

          {isOwner ? (
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <button
                onClick={handleStatusChange}
                style={{
                  border: '2px solid var(--border-color)',
                  background: focus.status === 'completed' ? 'var(--surface-color)' : 'var(--primary-color)',
                  color: focus.status === 'completed' ? 'inherit' : 'white',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--card-radius)',
                  cursor: 'pointer'
                }}
              >
                {focus.status === 'completed' ? 'Marcar como em andamento' : 'Concluir foco'}
              </button>
              <button
                onClick={() => onEdit(focus)}
                style={{ border: '2px solid var(--border-color)', background: 'transparent', padding: '0.75rem 1rem', borderRadius: 'var(--card-radius)', cursor: 'pointer' }}
              >
                Editar no modo doc
              </button>
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.85rem' }}>
                  <input type="checkbox" checked={focus.allowComments} onChange={() => toggleBoolean('allowComments')} />
                  Comentários liberados
                </label>
                <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.85rem' }}>
                  <input type="checkbox" checked={focus.allowResenha} onChange={() => toggleBoolean('allowResenha')} />
                  Resenhas permitidas
                </label>
                <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.85rem' }}>
                  <input type="checkbox" checked={focus.allowReviews} onChange={() => toggleBoolean('allowReviews')} />
                  Comentários rápidos
                </label>
                <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.85rem' }}>
                  <input type="checkbox" checked={focus.requestRating} onChange={() => toggleBoolean('requestRating')} />
                  Solicitar avaliações
                </label>
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {focus.requestRating ? (
                <div style={{ display: 'grid', gap: '0.6rem' }}>
                  <span style={{ fontSize: '0.85rem', letterSpacing: '0.08em' }}>Deixe sua avaliação</span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {ratingButtons.map((value) => (
                      <button
                        key={value}
                        onClick={() => onRate(focus, value)}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          border: '1px solid var(--border-color)',
                          background: 'transparent',
                          cursor: 'pointer'
                        }}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <p style={{ color: 'var(--muted-text)', margin: 0 }}>O autor ainda não está coletando avaliações.</p>
              )}
            </div>
          )}

          {focus.ratingSummary && (
            <div
              style={{
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--card-radius)',
                padding: '1rem',
                background: 'var(--surface-color)',
                fontSize: '0.9rem'
              }}
            >
              <strong>Média brutalista:</strong>
              <div style={{ marginTop: '0.35rem' }}>
                {focus.ratingSummary.count > 0
                  ? `${focus.ratingSummary.average.toFixed(1)} (${focus.ratingSummary.count} avaliações)`
                  : 'Ainda sem avaliações.'}
              </div>
            </div>
          )}

          <p style={{ color: 'var(--muted-text)', fontSize: '0.75rem', lineHeight: 1.6 }}>
            Conclua o foco para recalcular automaticamente o tempo de leitura usando nossa IA baseada em palavras reais.
          </p>
        </aside>
      </div>
    </div>
  );
};

export default FocusDetailDrawer;
