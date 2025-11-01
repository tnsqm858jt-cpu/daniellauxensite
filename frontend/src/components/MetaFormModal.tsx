import { useEffect, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { MetaChecklistItem, MetaItem } from '../types/meta';

interface MetaFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: Partial<MetaItem>) => Promise<void>;
  initial?: MetaItem | null;
}

const MetaFormModal: React.FC<MetaFormModalProps> = ({ open, onClose, onSubmit, initial }) => {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [category, setCategory] = useState(initial?.category ?? '');
  const [subcategories, setSubcategories] = useState<string[]>(initial?.subcategories ?? []);
  const [dueDate, setDueDate] = useState(initial?.dueDate ?? '');
  const [isJoint, setIsJoint] = useState(initial?.isJoint ?? false);
  const [checklist, setChecklist] = useState<MetaChecklistItem[]>(initial?.checklist ?? [{ id: uuid(), text: '', completed: false }]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setTitle(initial?.title ?? '');
      setDescription(initial?.description ?? '');
      setCategory(initial?.category ?? '');
      setSubcategories(initial?.subcategories ?? []);
      setDueDate(initial?.dueDate ?? '');
      setIsJoint(initial?.isJoint ?? false);
      setChecklist(initial?.checklist?.length ? initial.checklist : [{ id: uuid(), text: '', completed: false }]);
    }
  }, [initial, open]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    await onSubmit({
      id: initial?.id,
      title,
      description,
      category,
      subcategories,
      dueDate,
      isJoint,
      checklist
    });
    setSaving(false);
    onClose();
  };

  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'grid',
        placeItems: 'center',
        background: 'rgba(0,0,0,0.4)',
        zIndex: 25,
        padding: '2rem'
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="fade-in"
        style={{
          width: 'min(720px, 96vw)',
          maxHeight: '90vh',
          overflow: 'auto',
          background: 'var(--surface-color)',
          border: '2px solid var(--border-color)',
          borderRadius: 'var(--card-radius)',
          padding: '2rem',
          display: 'grid',
          gap: '1.25rem'
        }}
      >
        <header>
          <h2 style={{ margin: 0 }}>{initial ? 'Editar meta' : 'Nova meta brutalista'}</h2>
          <p style={{ margin: '0.5rem 0 0', color: 'var(--muted-text)' }}>
            Configure metas solo ou conjuntas, com checklist e prazos personalizados.
          </p>
        </header>

        <label style={{ display: 'grid', gap: '0.35rem' }}>
          Título
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
            style={{ border: '2px solid var(--border-color)', padding: '0.9rem', borderRadius: 'var(--card-radius)', background: 'var(--surface-color)' }}
          />
        </label>

        <label style={{ display: 'grid', gap: '0.35rem' }}>
          Descrição
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={4}
            style={{ border: '2px solid var(--border-color)', padding: '0.9rem', borderRadius: 'var(--card-radius)', background: 'var(--surface-color)' }}
          />
        </label>

        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <label style={{ display: 'grid', gap: '0.35rem' }}>
            Categoria
            <input
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              style={{ border: '2px solid var(--border-color)', padding: '0.9rem', borderRadius: 'var(--card-radius)', background: 'var(--surface-color)' }}
            />
          </label>
          <label style={{ display: 'grid', gap: '0.35rem' }}>
            Subcategorias
            <input
              value={subcategories.join(', ')}
              onChange={(event) =>
                setSubcategories(
                  event.target.value
                    .split(',')
                    .map((item) => item.trim())
                    .filter(Boolean)
                )
              }
              style={{ border: '2px solid var(--border-color)', padding: '0.9rem', borderRadius: 'var(--card-radius)', background: 'var(--surface-color)' }}
            />
          </label>
          <label style={{ display: 'grid', gap: '0.35rem' }}>
            Prazo
            <input
              type="date"
              value={dueDate ?? ''}
              onChange={(event) => setDueDate(event.target.value)}
              style={{ border: '2px solid var(--border-color)', padding: '0.9rem', borderRadius: 'var(--card-radius)', background: 'var(--surface-color)' }}
            />
          </label>
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input type="checkbox" checked={isJoint} onChange={(event) => setIsJoint(event.target.checked)} />
          Meta em conjunto (participação liberada para todos os amigos)
        </label>

        <section style={{ display: 'grid', gap: '0.75rem' }}>
          <h3 style={{ margin: '0.5rem 0 0' }}>Checklist</h3>
          {checklist.map((item, index) => (
            <div key={item.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <input
                value={item.text}
                onChange={(event) =>
                  setChecklist((prev) => prev.map((entry) => (entry.id === item.id ? { ...entry, text: event.target.value } : entry)))
                }
                placeholder={`Item ${index + 1}`}
                style={{ flex: 1, border: '2px solid var(--border-color)', padding: '0.75rem', borderRadius: 'var(--chip-radius)' }}
              />
              <button
                type="button"
                onClick={() => setChecklist((prev) => prev.filter((entry) => entry.id !== item.id))}
                style={{ border: '2px solid var(--border-color)', background: 'transparent', padding: '0.6rem 0.9rem', borderRadius: 'var(--chip-radius)', cursor: 'pointer' }}
              >
                Remover
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setChecklist((prev) => [...prev, { id: uuid(), text: '', completed: false }])}
            style={{ border: '2px dashed var(--border-color)', padding: '0.85rem', borderRadius: 'var(--card-radius)', background: 'transparent', cursor: 'pointer' }}
          >
            Adicionar item
          </button>
        </section>

        <footer style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button
            type="button"
            onClick={onClose}
            style={{ border: '2px solid var(--border-color)', padding: '0.75rem 1.5rem', background: 'transparent', borderRadius: 'var(--card-radius)', cursor: 'pointer' }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            style={{ border: '2px solid var(--border-color)', padding: '0.9rem 1.75rem', background: 'var(--primary-color)', color: 'white', borderRadius: 'var(--card-radius)', cursor: 'pointer', opacity: saving ? 0.6 : 1 }}
          >
            {saving ? 'Salvando…' : initial ? 'Atualizar meta' : 'Criar meta'}
          </button>
        </footer>
      </form>
    </div>
  );
};

export default MetaFormModal;
