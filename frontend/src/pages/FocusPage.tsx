import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { FocusItem, FocusStatus } from '../types/focus';
import FocusFormModal from '../components/FocusFormModal';
import FocusCard from '../components/FocusCard';
import FocusDetailDrawer from '../components/FocusDetailDrawer';
import { useAuth } from '../context/AuthContext';

interface FocusPageProps {
  board: 'daniel' | 'lauxen';
}

const FocusPage: React.FC<FocusPageProps> = ({ board }) => {
  const { user } = useAuth();
  const [focos, setFocos] = useState<FocusItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<FocusItem | null>(null);
  const [statusFilter, setStatusFilter] = useState<FocusStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [subFilter, setSubFilter] = useState('');
  const [onlyResenhas, setOnlyResenhas] = useState(false);
  const [onlyComments, setOnlyComments] = useState(false);
  const [selected, setSelected] = useState<FocusItem | null>(null);

  const loadFocos = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/focos', { params: { board } });
      setFocos(data.focos);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Falha ao carregar focos');
    } finally {
      setLoading(false);
    }
  }, [board]);

  useEffect(() => {
    loadFocos();
  }, [loadFocos]);

  const categories = useMemo(() => Array.from(new Set(focos.map((focus) => focus.category).filter(Boolean))), [focos]);
  const subcategories = useMemo(
    () =>
      Array.from(
        new Set(
          focos
            .flatMap((focus) => focus.subcategories)
            .filter(Boolean)
        )
      ),
    [focos]
  );

  const filteredFocos = useMemo(() => {
    return focos.filter((focus) => {
      if (statusFilter !== 'all' && focus.status !== statusFilter) return false;
      if (categoryFilter && focus.category !== categoryFilter) return false;
      if (subFilter && !focus.subcategories.includes(subFilter)) return false;
      if (onlyResenhas && !focus.allowResenha) return false;
      if (onlyComments && !focus.allowComments) return false;
      return true;
    });
  }, [focos, statusFilter, categoryFilter, subFilter, onlyResenhas, onlyComments]);

  const handleCreate = async (payload: Partial<FocusItem>) => {
    try {
      const { data } = await api.post('/focos', payload);
      setFocos((prev) => [data.focus, ...prev]);
      setSelected(data.focus);
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleUpdate = async (payload: Partial<FocusItem>) => {
    if (!payload.id) return;
    try {
      const { data } = await api.put(`/focos/${payload.id}`, payload);
      setFocos((prev) => prev.map((focus) => (focus.id === payload.id ? data.focus : focus)));
      setSelected((prev) => (prev && prev.id === data.focus.id ? data.focus : prev));
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleSubmit = async (payload: Partial<FocusItem>) => {
    if (payload.id) {
      await handleUpdate(payload);
    } else {
      await handleCreate(payload);
    }
    setEditing(null);
  };

  const handleRate = async (focus: FocusItem, value: number) => {
    try {
      const { data } = await api.post(`/focos/${focus.id}/rating`, { value });
      setFocos((prev) => prev.map((item) => (item.id === focus.id ? data.focus : item)));
      setSelected((prev) => (prev && prev.id === data.focus.id ? data.focus : prev));
    } catch (err) {
      console.error(err);
    }
  };

  const handlePatch = async (id: string, payload: Partial<FocusItem>) => {
    try {
      const { data } = await api.put(`/focos/${id}`, payload);
      setFocos((prev) => prev.map((item) => (item.id === id ? data.focus : item)));
      setSelected(data.focus);
    } catch (err) {
      console.error(err);
    }
  };

  const openEditor = (focus?: FocusItem) => {
    setEditing(focus ?? null);
    setOpenForm(true);
  };

  const openDetails = (focus: FocusItem) => {
    setSelected(focus);
  };

  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      <section
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          justifyContent: 'space-between',
          alignItems: 'flex-end'
        }}
      >
        <div>
          <h2 style={{ margin: '0 0 0.5rem', fontSize: '2.2rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {board === 'daniel' ? 'Focos Daniel' : 'Focos Lauxen'}
          </h2>
          <p style={{ margin: 0, color: 'var(--muted-text)', maxWidth: '560px' }}>
            Estruture tópicos com anexos, finalize para ativar a IA de tempo de leitura e convide leitores a avaliar suas narrativas.
          </p>
        </div>
        <button className="brutalist-button" data-variant="primary" onClick={() => openEditor()}>
          Criar novo foco
        </button>
      </section>

      <section className="brutalist-card" style={{ padding: '1.25rem', display: 'grid', gap: '1rem' }}>
        <h3 style={{ margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Filtros</h3>
        <div style={{ display: 'grid', gap: '0.75rem', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
          <label style={{ display: 'grid', gap: '0.25rem', fontSize: '0.8rem' }}>
            Status
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as FocusStatus | 'all')}
              style={{ border: '1px solid var(--border-color)', padding: '0.6rem', borderRadius: 'var(--card-radius)', background: 'var(--surface-color)' }}
            >
              <option value="all">Todos</option>
              <option value="in-progress">Em andamento</option>
              <option value="completed">Concluídos</option>
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
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
            <input type="checkbox" checked={onlyResenhas} onChange={(event) => setOnlyResenhas(event.target.checked)} />
            Permite resenha
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
            <input type="checkbox" checked={onlyComments} onChange={(event) => setOnlyComments(event.target.checked)} />
            Permite comentários
          </label>
        </div>
      </section>

      {loading ? (
        <p>Carregando focos…</p>
      ) : error ? (
        <p style={{ color: 'var(--primary-color)' }}>{error}</p>
      ) : filteredFocos.length === 0 ? (
        <p style={{ color: 'var(--muted-text)' }}>Nenhum foco encontrado com os filtros atuais.</p>
      ) : (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {filteredFocos.map((focus) => (
            <FocusCard
              key={focus.id}
              focus={focus}
              onEdit={openEditor}
              onRate={handleRate}
              isOwner={focus.canEdit ?? focus.createdBy === user?.id}
              onOpen={openDetails}
            />
          ))}
        </div>
      )}

      <FocusFormModal
        open={openForm}
        onClose={() => {
          setOpenForm(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
        initial={editing}
        board={board}
      />

      <FocusDetailDrawer
        focus={selected}
        onClose={() => setSelected(null)}
        onEdit={(focus) => {
          openEditor(focus);
          setSelected(null);
        }}
        isOwner={selected ? selected.canEdit ?? selected.createdBy === user?.id : false}
        onPatch={handlePatch}
        onRate={handleRate}
      />
    </div>
  );
};

export default FocusPage;
