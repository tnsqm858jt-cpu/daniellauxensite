import { FocusItem } from '../types/focus';

interface FocusCardProps {
  focus: FocusItem;
  onEdit: (focus: FocusItem) => void;
  onRate: (focus: FocusItem, value: number) => void;
  isOwner: boolean;
  onOpen: (focus: FocusItem) => void;
}

const FocusCard: React.FC<FocusCardProps> = ({ focus, onEdit, onRate, isOwner, onOpen }) => {
  const filters = [
    focus.category && `Categoria: ${focus.category}`,
    focus.subcategories.length && `Sub: ${focus.subcategories.join(', ')}`,
    `Status: ${focus.status === 'completed' ? 'Concluído' : 'Em andamento'}`,
    focus.allowResenha ? 'Aceita resenhas' : null,
    focus.allowComments ? 'Aceita comentários' : null,
    focus.requestRating ? 'Coletando avaliações' : null,
    focus.attachments?.length ? `${focus.attachments.length} anexo${focus.attachments.length > 1 ? 's' : ''}` : null
  ].filter(Boolean) as string[];

  return (
    <article className="fade-in brutalist-card brutalist-hover" style={{ padding: '1.5rem', display: 'grid', gap: '1.2rem', position: 'relative' }}>
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
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
        <div style={{ flex: 1, display: 'grid', gap: '0.75rem' }}>
          <header>
            <h3 style={{ margin: 0, fontSize: '1.6rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{focus.title}</h3>
            <p style={{ margin: '0.35rem 0 0', color: 'var(--muted-text)', fontSize: '0.95rem' }}>
              {focus.body.substring(0, 220)}{focus.body.length > 220 ? '…' : ''}
            </p>
          </header>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.75rem', letterSpacing: '0.06em' }}>
            {filters.map((filter) => (
              <span key={filter as string} className="brutalist-chip">
                {filter}
              </span>
            ))}
          </div>
          {focus.readingTimeMinutes && focus.status === 'completed' && (
            <div style={{ fontSize: '0.9rem', color: 'var(--muted-text)' }}>
              Tempo de leitura estimado: <strong>{focus.readingTimeMinutes} min</strong>
            </div>
          )}
          <footer style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <button className="brutalist-button" onClick={() => onOpen(focus)}>
              Abrir detalhes
            </button>
            {isOwner ? (
              <button className="brutalist-button" onClick={() => onEdit(focus)}>
                Editar foco
              </button>
            ) : (
              focus.requestRating && (
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem' }}>Avalie:</span>
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      onClick={() => onRate(focus, value)}
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: 'var(--chip-radius)',
                        border: '1px solid var(--border-color)',
                        background: 'transparent',
                        cursor: 'pointer'
                      }}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              )
            )}
            {focus.ratingSummary && focus.ratingSummary.count > 0 && (
              <span style={{ fontSize: '0.85rem', color: 'var(--muted-text)' }}>
                Média {focus.ratingSummary.average.toFixed(1)} ({focus.ratingSummary.count})
              </span>
            )}
          </footer>
        </div>
      </div>
    </article>
  );
};

export default FocusCard;
