import { useEffect, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { FocusAttachment, FocusItem, FocusStatus } from '../types/focus';

interface FocusFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: Partial<FocusItem>) => Promise<void>;
  initial?: FocusItem | null;
  board: 'daniel' | 'lauxen';
}

const createAttachment = (type: FocusAttachment['type'] = 'text'): FocusAttachment => ({
  id: uuid(),
  name:
    type === 'image'
      ? 'Imagem brutalista'
      : type === 'document'
        ? 'Documento narrativo'
        : 'Bloco de texto',
  type,
  content: '',
  mimeType: type === 'text' ? 'text/plain' : undefined
});

const FocusFormModal: React.FC<FocusFormModalProps> = ({ open, onClose, onSubmit, initial, board }) => {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [category, setCategory] = useState(initial?.category ?? '');
  const [subcategories, setSubcategories] = useState<string[]>(initial?.subcategories ?? []);
  const [status, setStatus] = useState<FocusStatus>(initial?.status ?? 'in-progress');
  const [allowComments, setAllowComments] = useState(initial?.allowComments ?? false);
  const [allowReviews, setAllowReviews] = useState(initial?.allowReviews ?? false);
  const [allowResenha, setAllowResenha] = useState(initial?.allowResenha ?? false);
  const [requestRating, setRequestRating] = useState(initial?.requestRating ?? false);
  const [body, setBody] = useState(initial?.body ?? '');
  const [attachments, setAttachments] = useState<FocusAttachment[]>(initial?.attachments ?? [createAttachment()]);
  const [coverImage, setCoverImage] = useState(initial?.coverImage ?? '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setTitle(initial?.title ?? '');
      setCategory(initial?.category ?? '');
      setSubcategories(initial?.subcategories ?? []);
      setStatus(initial?.status ?? 'in-progress');
      setAllowComments(initial?.allowComments ?? false);
      setAllowReviews(initial?.allowReviews ?? false);
      setAllowResenha(initial?.allowResenha ?? false);
      setRequestRating(initial?.requestRating ?? false);
      setBody(initial?.body ?? '');
      setAttachments(
        initial?.attachments && initial.attachments.length
          ? initial.attachments.map((attachment) => ({
              ...attachment,
              mimeType: attachment.mimeType ?? (attachment.type === 'text' ? 'text/plain' : attachment.mimeType)
            }))
          : [createAttachment()]
      );
      setCoverImage(initial?.coverImage ?? '');
    }
  }, [initial, open]);

  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? '');
      setBody(text);
    };
    reader.readAsText(file);
  };

  const updateAttachment = (id: string, payload: Partial<FocusAttachment>) => {
    setAttachments((prev) => prev.map((item) => (item.id === id ? { ...item, ...payload } : item)));
  };

  const handleAttachmentTypeChange = (id: string, nextType: FocusAttachment['type']) => {
    setAttachments((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              type: nextType,
              content: '',
              mimeType: nextType === 'text' ? 'text/plain' : undefined,
              name:
                item.name && !item.name.startsWith('Novo')
                  ? item.name
                  : nextType === 'image'
                    ? 'Imagem brutalista'
                    : nextType === 'document'
                      ? 'Documento narrativo'
                      : 'Bloco de texto'
            }
          : item
      )
    );
  };

  const handleAttachmentFile = (attachment: FocusAttachment, file: File) => {
    if (!file) return;
    const currentType = attachment.type;
    const reader = new FileReader();

    if (currentType === 'text') {
      reader.onload = () => {
        updateAttachment(attachment.id, {
          content: String(reader.result ?? ''),
          mimeType: file.type || 'text/plain',
          name: attachment.name || file.name
        });
      };
      reader.readAsText(file);
      return;
    }

    reader.onload = () => {
      updateAttachment(attachment.id, {
        content: String(reader.result ?? ''),
        mimeType: file.type || (currentType === 'image' ? 'image/png' : 'application/octet-stream'),
        name: file.name
      });
    };
    reader.readAsDataURL(file);
  };

  const handleImage = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCoverImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    await onSubmit({
      id: initial?.id,
      title,
      board,
      category,
      subcategories,
      status,
      allowComments,
      allowReviews,
      allowResenha,
      requestRating,
      body,
      attachments,
      coverImage
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
        background: 'rgba(0,0,0,0.4)',
        display: 'grid',
        placeItems: 'center',
        zIndex: 25,
        padding: '2rem'
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="fade-in"
        style={{
          width: 'min(960px, 96vw)',
          maxHeight: '90vh',
          overflow: 'auto',
          background: 'var(--surface-color)',
          border: '2px solid var(--border-color)',
          borderRadius: 'var(--card-radius)',
          padding: '2rem',
          display: 'grid',
          gap: '1.5rem'
        }}
      >
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.8rem' }}>{initial ? 'Editar foco narrativo' : 'Novo foco narrativo'}</h2>
            <p style={{ margin: 0, color: 'var(--muted-text)' }}>
              Estruture capítulos, anexos e finalize para gerar o tempo de leitura automaticamente.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ border: '2px solid var(--border-color)', background: 'transparent', padding: '0.5rem 1rem', cursor: 'pointer' }}
          >
            Fechar
          </button>
        </header>

        <section style={{ display: 'grid', gap: '1rem' }}>
          <label style={{ display: 'grid', gap: '0.35rem' }}>
            Título
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
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
              Subcategorias (separe por vírgula)
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
              Status
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value as FocusStatus)}
                style={{ border: '2px solid var(--border-color)', padding: '0.9rem', borderRadius: 'var(--card-radius)', background: 'var(--surface-color)' }}
              >
                <option value="in-progress">Em andamento</option>
                <option value="completed">Concluído</option>
              </select>
            </label>
          </div>

          <div style={{ display: 'grid', gap: '0.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" checked={allowComments} onChange={(event) => setAllowComments(event.target.checked)} />
              Permitir comentários
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" checked={allowResenha} onChange={(event) => setAllowResenha(event.target.checked)} />
              Permitir resenhas
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" checked={allowReviews} onChange={(event) => setAllowReviews(event.target.checked)} />
              Permitir comentários rápidos
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" checked={requestRating} onChange={(event) => setRequestRating(event.target.checked)} />
              Solicitar avaliações
            </label>
          </div>
        </section>

        <section style={{ display: 'grid', gap: '0.75rem' }}>
          <label style={{ display: 'grid', gap: '0.35rem' }}>
            Corpo do foco (modo doc)
            <textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder="Descreva a estrutura ou cole o texto importado do Google Docs"
              rows={8}
              style={{ border: '2px solid var(--border-color)', padding: '1rem', borderRadius: 'var(--card-radius)', background: 'var(--surface-color)', fontFamily: 'inherit' }}
            />
          </label>
          <div>
            <label style={{ fontSize: '0.85rem', marginBottom: '0.25rem', display: 'block' }}>Importar de .txt ou .md</label>
            <input
              type="file"
              accept=".txt,.md,.markdown"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) handleImport(file);
              }}
            />
          </div>
        </section>

        <section style={{ display: 'grid', gap: '0.75rem' }}>
          <div>
            <label style={{ fontSize: '0.85rem', marginBottom: '0.25rem', display: 'block' }}>Imagem de capa (400×400)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) handleImage(file);
              }}
            />
            {coverImage && (
              <img
                src={coverImage}
                alt="Capa"
                style={{ width: '160px', height: '160px', objectFit: 'cover', borderRadius: 'var(--card-radius)', marginTop: '0.75rem', border: '2px solid var(--border-color)' }}
              />
            )}
          </div>
        </section>

        <section style={{ display: 'grid', gap: '0.75rem' }}>
          <h3 style={{ margin: '0 0 0.35rem' }}>Anexos adicionais</h3>
          {attachments.map((attachment, index) => (
            <div
              key={attachment.id}
              style={{
                border: '1px dashed var(--border-color)',
                padding: '1rem',
                borderRadius: 'var(--card-radius)',
                display: 'grid',
                gap: '0.5rem'
              }}
            >
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <input
                  value={attachment.name}
                  onChange={(event) =>
                    setAttachments((prev) =>
                      prev.map((item) => (item.id === attachment.id ? { ...item, name: event.target.value } : item))
                    )
                  }
                  style={{ border: '2px solid var(--border-color)', padding: '0.6rem', borderRadius: 'var(--card-radius)', flex: 1 }}
                />
                <select
                  value={attachment.type}
                  onChange={(event) => handleAttachmentTypeChange(attachment.id, event.target.value as FocusAttachment['type'])}
                  style={{ border: '2px solid var(--border-color)', padding: '0.6rem', borderRadius: 'var(--card-radius)' }}
                >
                  <option value="text">Texto</option>
                  <option value="image">Imagem</option>
                  <option value="document">Documento</option>
                </select>
                <button
                  type="button"
                  onClick={() =>
                    setAttachments((prev) => (prev.length === 1 ? prev : prev.filter((item) => item.id !== attachment.id)))
                  }
                  style={{ border: '2px solid var(--border-color)', background: 'transparent', padding: '0.5rem 0.75rem', cursor: 'pointer' }}
                >
                  Remover
                </button>
              </div>
              {attachment.type === 'text' ? (
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                  <textarea
                    value={attachment.content}
                    onChange={(event) => updateAttachment(attachment.id, { content: event.target.value })}
                    rows={4}
                    style={{
                      border: '2px solid var(--border-color)',
                      padding: '0.75rem',
                      borderRadius: 'var(--card-radius)',
                      background: 'var(--surface-color)'
                    }}
                  />
                  <label style={{ fontSize: '0.75rem' }}>
                    Importar bloco (.txt/.md)
                    <input
                      type="file"
                      accept=".txt,.md,.markdown"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) handleAttachmentFile(attachment, file);
                      }}
                      style={{ marginTop: '0.35rem' }}
                    />
                  </label>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.75rem' }}>
                    {attachment.type === 'image'
                      ? 'Enviar imagem (JPG, PNG)'
                      : 'Enviar documento (PDF, DOCX, Markdown exportado)'}
                    <input
                      type="file"
                      accept={attachment.type === 'image' ? 'image/*' : '.pdf,.doc,.docx,.txt,.md,.markdown'}
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) handleAttachmentFile(attachment, file);
                      }}
                      style={{ marginTop: '0.35rem' }}
                    />
                  </label>
                  {attachment.content && attachment.type === 'image' && (
                    <img
                      src={attachment.content}
                      alt={attachment.name}
                      style={{
                        width: '100%',
                        maxHeight: '220px',
                        objectFit: 'cover',
                        borderRadius: 'var(--chip-radius)',
                        border: '1px solid var(--border-color)'
                      }}
                    />
                  )}
                  {attachment.content && attachment.type === 'document' && (
                    <a
                      href={attachment.content}
                      download={attachment.name || `documento-${index + 1}`}
                      style={{ fontSize: '0.8rem', textDecoration: 'underline', alignSelf: 'flex-start' }}
                    >
                      Baixar documento anexado
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={() => setAttachments((prev) => [...prev, { ...createAttachment(), name: 'Anexo extra' }])}
            style={{ border: '2px dashed var(--border-color)', padding: '0.85rem', borderRadius: 'var(--card-radius)', background: 'transparent', cursor: 'pointer' }}
          >
            Adicionar anexo
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
            style={{ border: '2px solid var(--border-color)', padding: '0.85rem 1.75rem', background: 'var(--primary-color)', color: 'white', borderRadius: 'var(--card-radius)', cursor: 'pointer', opacity: saving ? 0.6 : 1 }}
          >
            {saving ? 'Salvando…' : initial ? 'Salvar alterações' : 'Criar foco'}
          </button>
        </footer>
      </form>
    </div>
  );
};

export default FocusFormModal;
