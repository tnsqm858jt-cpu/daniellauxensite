import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import MetaFormModal from '../components/MetaFormModal';
import { MetaItem } from '../types/meta';

const MetasPage = () => {
  const [metas, setMetas] = useState<MetaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<MetaItem | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'in-progress' | 'completed'>('all');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [subFilter, setSubFilter] = useState('');
  const [jointFilter, setJointFilter] = useState<'all' | 'joint' | 'solo'>('all');

  const loadMetas = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/metas');
      setMetas(data.metas);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Falha ao carregar metas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMetas();
  }, [loadMetas]);

  const categories = useMemo(() => Array.from(new Set(metas.map((meta) => meta.category).filter(Boolean))), [metas]);
  const subcategories = useMemo(
    () => Array.from(new Set(metas.flatMap((meta) => meta.subcategories).filter(Boolean))),
    [metas]
  );

  const filtered = useMemo(
    () =>
      metas.filter((meta) => {
        if (statusFilter !== 'all' && meta.status !== statusFilter) return false;
        if (categoryFilter && meta.category !== categoryFilter) return false;
        if (subFilter && !meta.subcategories.includes(subFilter)) return false;
        if (jointFilter === 'joint' && !meta.isJoint) return false;
        if (jointFilter === 'solo' && meta.isJoint) return false;
        return true;
      }),
    [metas, statusFilter, categoryFilter, subFilter, jointFilter]
  );

  const handleSubmit = async (payload: Partial<MetaItem>) => {
    if (payload.id) {
      const { data } = await api.put(`/metas/${payload.id}`, payload);
      setMetas((prev) => prev.map((meta) => (meta.id === payload.id ? data.meta : meta)));
    } else {
      const { data } = await api.post('/metas', payload);
      setMetas((prev) => [data.meta, ...prev]);
    }
    setEditing(null);
  };

  const toggleChecklist = async (meta: MetaItem, itemId: string) => {
    const checklist = meta.checklist.map((item) =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    const { data } = await api.put(`/metas/${meta.id}`, { checklist });
    setMetas((prev) => prev.map((entry) => (entry.id === meta.id ? data.meta : entry)));
  };

  const openModal = (meta?: MetaItem) => {
    setEditing(meta ?? null);
    setOpen(true);
  };

  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      <section
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '1rem',
          flexWrap: 'wrap',
          alignItems: 'flex-end'
        }}
      >
        <div>
          <h2 style={{ margin: '0 0 0.5rem', fontSize: '2.2rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Metas colaborativas
          </h2>
          <p style={{ margin: 0, color: 'var(--muted-text)', maxWidth: '540px' }}>
            Acompanhe objetivos individuais ou conjuntos. Checklist com prazo rústico, filtros como na Utrecht.jp.
          </p>
        </div>
        <button className="brutalist-button" data-variant="primary" onClick={() => openModal()}>
          Criar meta
        </button>
      </section>

      <section className="brutalist-card" style={{ padding: '1.25rem', display: 'grid', gap: '1rem' }}>
        <h3 style={{ margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Filtros</h3>
        <div style={{ display: 'grid', gap: '0.75rem', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
          <label style={{ display: 'grid', gap: '0.25rem', fontSize: '0.8rem' }}>
            Status
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
              style={{ border: '1px solid var(--border-color)', padding: '0.6rem', borderRadius: 'var(--card-radius)', background: 'var(--surface-color)' }}
            >
              <option value="all">Todos</option>
              <option value="in-progress">Em andamento</option>
              <option value="completed">Concluídas</option>
            </select>
          </label>
          <label style={{ display: 'grid', gap: '0.25rem', fontSize: '0.8rem' }}>
            Categoria
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              style={{ border: '1px solid var(--border-color)', padding: '0.6rem', borderRadius: 'var(--card-radius)', background: 'var(--surface-color)' }}
            >
              <option value="">Todas</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
          <label style={{ display: 'grid', gap: '0.25rem', fontSize: '0.8rem' }}>
            Subcategoria
            <select
              value={subFilter}
              onChange={(event) => setSubFilter(event.target.value)}
              style={{ border: '1px solid var(--border-color)', padding: '0.6rem', borderRadius: 'var(--card-radius)', background: 'var(--surface-color)' }}
            >
              <option value="">Todas</option>
              {subcategories.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </label>
          <label style={{ display: 'grid', gap: '0.25rem', fontSize: '0.8rem' }}>
            Tipo
            <select
              value={jointFilter}
              onChange={(event) => setJointFilter(event.target.value as typeof jointFilter)}
              style={{ border: '1px solid var(--border-color)', padding: '0.6rem', borderRadius: 'var(--card-radius)', background: 'var(--surface-color)' }}
            >
              <option value="all">Todos</option>
              <option value="solo">Individuais</option>
              <option value="joint">Conjuntas</option>
            </select>
          </label>
        </div>
      </section>

      {loading ? (
        <p>Carregando metas…</p>
      ) : error ? (
        <p style={{ color: 'var(--primary-color)' }}>{error}</p>
      ) : filtered.length === 0 ? (
        <p style={{ color: 'var(--muted-text)' }}>Nenhuma meta no filtro atual.</p>
      ) : (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {filtered.map((meta) => (
            <article
              key={meta.id}
              className="fade-in"
              style={{
                border: '2px solid var(--border-color)',
                padding: '1.5rem',
                borderRadius: 'var(--card-radius)',
                background: 'var(--surface-color)',
                display: 'grid',
                gap: '1rem'
              }}
            >
              <header style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.6rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{meta.title}</h3>
                  <p style={{ margin: '0.3rem 0 0', color: 'var(--muted-text)' }}>{meta.description}</p>
                </div>
                {meta.canEdit && (
                  <button
                    onClick={() => openModal(meta)}
                    style={{ border: '2px solid var(--border-color)', padding: '0.6rem 1rem', borderRadius: 'var(--chip-radius)', background: 'transparent', cursor: 'pointer' }}
                  >
                    Editar
                  </button>
                )}
              </header>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.75rem', letterSpacing: '0.06em' }}>
                {meta.category && (
                  <span style={{ border: '1px solid var(--border-color)', padding: '0.3rem 0.6rem', borderRadius: 'var(--card-radius)' }}>
                    Categoria: {meta.category}
                  </span>
                )}
                {meta.subcategories.map((sub) => (
                  <span key={sub} style={{ border: '1px solid var(--border-color)', padding: '0.3rem 0.6rem', borderRadius: 'var(--card-radius)' }}>
                    {sub}
                  </span>
                ))}
                <span style={{ border: '1px solid var(--border-color)', padding: '0.3rem 0.6rem', borderRadius: 'var(--card-radius)' }}>
                  {meta.isJoint ? 'Meta conjunta' : 'Meta individual'}
                </span>
                {meta.dueDate && (
                  <span style={{ border: '1px solid var(--border-color)', padding: '0.3rem 0.6rem', borderRadius: 'var(--card-radius)' }}>
                    Prazo: {new Date(meta.dueDate).toLocaleDateString('pt-BR')}
                  </span>
                )}
              </div>
              <section style={{ display: 'grid', gap: '0.5rem' }}>
                {meta.checklist.map((item) => (
                  <label key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <input
                      type="checkbox"
                      checked={item.completed}
                      disabled={!meta.canEdit}
                      onChange={() => toggleChecklist(meta, item.id)}
                    />
                    <span style={{ textDecoration: item.completed ? 'line-through' : 'none' }}>{item.text}</span>
                  </label>
                ))}
              </section>
            </article>
          ))}
        </div>
      )}

      <MetaFormModal
        open={open}
        initial={editing}
        onSubmit={handleSubmit}
        onClose={() => {
          setOpen(false);
          setEditing(null);
        }}
      />
    </div>
  );
};

export default MetasPage;
