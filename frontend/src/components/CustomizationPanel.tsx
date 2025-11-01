import { useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import { FiCheck, FiPalette, FiX } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { ThemePreferences } from '../types/user';
import CustomizationGallery from './CustomizationGallery';
import { CustomizationPreset } from '../data/customizationPresets';

interface CustomizationPanelProps {
  onClose: () => void;
  theme: ThemePreferences;
}

const availableBackgrounds: { label: string; value: ThemePreferences['background'] }[] = [
  { label: 'Papel', value: 'paper' },
  { label: 'Linho', value: 'linen' },
  { label: 'Carvão', value: 'charcoal' },
  { label: 'Tela artística', value: 'canvas' },
  { label: 'Grãos analógicos', value: 'grain' },
  { label: 'Pedra polida', value: 'stone' },
  { label: 'Tinta dispersa', value: 'ink' },
  { label: 'Veludo escuro', value: 'velvet' }
];

const fontOptions = [
  'Times New Roman',
  'Sorts Mill Goudy',
  'Spectral',
  'Cormorant Garamond',
  'Playfair Display',
  'IM Fell English',
  'Libre Baskerville'
];

const widgetDefaults: ThemePreferences['widgets'] = {
  recentFocos: true,
  metasStatus: true,
  friends: true,
  timeline: false,
  goalsChart: false,
  achievements: false,
  readingClock: false,
  importQueue: false
};

const CustomizationPanel: React.FC<CustomizationPanelProps> = ({ onClose, theme }) => {
  const { user, updateProfile } = useAuth();
  const [primaryColor, setPrimaryColor] = useState(theme.primaryColor);
  const [mode, setMode] = useState<ThemePreferences['mode']>(theme.mode);
  const [background, setBackground] = useState<ThemePreferences['background']>(theme.background);
  const [fontFamily, setFontFamily] = useState(theme.fontFamily);
  const [widgets, setWidgets] = useState({ ...widgetDefaults, ...theme.widgets });
  const [name, setName] = useState(user?.name ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [avatar, setAvatar] = useState(user?.avatarUrl ?? '');
  const [saving, setSaving] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<CustomizationPreset | null>(null);

  useEffect(() => {
    setPrimaryColor(theme.primaryColor);
    setMode(theme.mode);
    setBackground(theme.background);
    setFontFamily(theme.fontFamily);
    setWidgets({ ...widgetDefaults, ...theme.widgets });
  }, [theme]);

  useEffect(() => {
    setName(user?.name ?? '');
    setBio(user?.bio ?? '');
    setAvatar(user?.avatarUrl ?? '');
  }, [user]);

  const presetApplied = useMemo(() => {
    if (!selectedPreset) return false;
    return (
    <aside
      className="fade-in brutalist-panel"
      style={{
        position: 'fixed',
        top: '5%',
        right: '3%',
        width: '440px',
        maxWidth: '92vw',
        zIndex: 30,
        display: 'grid',
        gap: '1.25rem'
      }}
    >
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
        <div style={{ display: 'grid', gap: '0.25rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Personalização brutalista</h2>
          <p style={{ margin: 0, color: 'var(--muted-text)', fontSize: '0.85rem' }}>
            Ajuste a identidade visual, fontes e widgets como um painel da Steam — rústico e funcional.
          </p>
        </div>
        <button
          onClick={onClose}
          className="brutalist-button"
          style={{ padding: '0.45rem 0.65rem', borderRadius: 'var(--button-radius)' }}
          aria-label="Fechar personalização"
        >
          <FiX size={18} />
        </button>
      </header>

      <section style={{ display: 'grid', gap: '1rem', maxHeight: '68vh', overflow: 'auto', paddingRight: '0.35rem' }}>
        <div className="brutalist-card" style={{ display: 'grid', gap: '0.75rem', padding: '1rem 1.1rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: '1.1rem',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem'
                }}
              >
                <FiPalette /> Paleta em uso
              </h3>
              <p style={{ margin: 0, color: 'var(--muted-text)', fontSize: '0.8rem' }}>
                Aplique presets brutalistas ou ajuste manualmente as cores, texturas e widgets.
              </p>
            </div>
            {selectedPreset && (
              <span className="brutalist-chip" data-tone={presetApplied ? 'accent' : undefined}>
                <FiCheck /> {presetApplied ? 'Preset aplicado' : 'Em rascunho'}
              </span>
            )}
          </div>

          {selectedPreset ? (
            <div className="customization-gallery-grid">
              <div className="brutalist-card" style={{ padding: '0.75rem', display: 'grid', gap: '0.35rem' }}>
                <strong style={{ fontSize: '0.75rem', letterSpacing: '0.08em' }}>Paleta</strong>
                <div style={{ display: 'flex', height: '36px', borderRadius: 'var(--chip-radius)', overflow: 'hidden' }}>
                  <div style={{ flex: 1, background: selectedPreset.palette.primary }} />
                  <div style={{ flex: 1, background: selectedPreset.palette.secondary }} />
                  <div style={{ flex: 1, background: selectedPreset.palette.accent }} />
                </div>
              </div>
              <div className="brutalist-card" style={{ padding: '0.75rem', display: 'grid', gap: '0.35rem' }}>
                <strong style={{ fontSize: '0.75rem', letterSpacing: '0.08em' }}>Textura</strong>
                <span style={{ fontSize: '0.85rem' }}>{selectedPreset.texture}</span>
              </div>
              <div className="brutalist-card" style={{ padding: '0.75rem', display: 'grid', gap: '0.35rem' }}>
                <strong style={{ fontSize: '0.75rem', letterSpacing: '0.08em' }}>Widgets sugeridos</strong>
                <span style={{ fontSize: '0.85rem' }}>{selectedPreset.recommendedWidgets.join(', ')}</span>
              </div>
            </div>
          ) : (
            <p style={{ margin: 0, color: 'var(--muted-text)', fontSize: '0.85rem' }}>
              Nenhum preset selecionado. Explore a galeria brutalista para aplicar uma combinação pronta.
            </p>
          )}
        </div>

        <div className="brutalist-grid">
          <label style={{ display: 'grid', gap: '0.35rem', fontSize: '0.85rem' }}>
            Cor primária
            <input
              type="color"
              value={primaryColor}
              onChange={(event) => setPrimaryColor(event.target.value)}
              style={{ width: '100%', height: '48px', border: '2px solid var(--border-color)', borderRadius: 'var(--card-radius)' }}
            />
          </label>

          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Modo de cor</span>
            <div style={{ display: 'grid', gap: '0.45rem', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
              {(['light', 'dark'] as ThemePreferences['mode'][]).map((option) => (
                <button
                  key={option}
                  onClick={() => setMode(option)}
                  className="brutalist-button"
                  data-variant={mode === option ? 'primary' : undefined}
                >
                  {option === 'light' ? 'Claro' : 'Escuro'}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Texturas</span>
            <div style={{ display: 'grid', gap: '0.45rem', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
              {availableBackgrounds.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setBackground(option.value)}
                  className="brutalist-button"
                  data-variant={background === option.value ? 'primary' : undefined}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <label style={{ display: 'grid', gap: '0.35rem' }}>
            Tipografia
            <select
              value={fontFamily}
              onChange={(event) => setFontFamily(event.target.value)}
              style={{ border: '2px solid var(--border-color)', padding: '0.75rem', borderRadius: 'var(--card-radius)', background: 'var(--surface-color)' }}
            >
              {fontOptions.map((font) => (
                <option key={font} value={font} style={{ fontFamily: font }}>
                  {font}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="brutalist-card" style={{ padding: '1rem 1.1rem', display: 'grid', gap: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong style={{ letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: '0.8rem' }}>Widgets do painel</strong>
            <span style={{ fontSize: '0.75rem', color: 'var(--muted-text)' }}>Curadoria estilo Steam</span>
          </div>
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            {Object.entries(widgets).map(([key, value]) => (
              <label
                key={key}
                className={clsx('brutalist-hover')}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  border: '1px dashed var(--border-color)',
                  padding: '0.7rem 0.8rem',
                  borderRadius: 'var(--card-radius)'
                }}
              >
                <span style={{ textTransform: 'capitalize' }}>{key.replace(/([A-Z])/g, ' $1')}</span>
                <input
                  type="checkbox"
                  checked={value}
                  onChange={() =>
                    setWidgets((prev) => ({
                      ...prev,
                      [key]: !prev[key as keyof ThemePreferences['widgets']]
                    }))
                  }
                />
              </label>
            ))}
          </div>
        </div>

        <div className="brutalist-card" style={{ padding: '1rem 1.1rem', display: 'grid', gap: '0.75rem' }}>
          <strong style={{ letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: '0.8rem' }}>Identidade do perfil</strong>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div
              style={{
                width: '70px',
                height: '70px',
                borderRadius: 'var(--card-radius)',
                overflow: 'hidden',
                background: 'var(--primary-color)',
                display: 'grid',
                placeItems: 'center',
                color: '#fff',
                fontWeight: 600
              }}
            >
              {avatar ? (
                <img src={avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                user?.name?.slice(0, 2).toUpperCase()
              )}
            </div>
            <label className="brutalist-button" style={{ cursor: 'pointer' }}>
              Trocar imagem
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) handleImage(file);
                }}
              />
            </label>
          </div>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Nome"
            style={{ border: '2px solid var(--border-color)', padding: '0.75rem', borderRadius: 'var(--card-radius)', background: 'var(--surface-color)' }}
          />
          <textarea
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            placeholder="Bio brutalista, descreva seus focos recentes"
            rows={3}
            style={{ border: '2px solid var(--border-color)', padding: '0.75rem', borderRadius: 'var(--card-radius)', background: 'var(--surface-color)', resize: 'vertical' }}
          />
        </div>

        <CustomizationGallery
          onApply={(preset) => {
            setSelectedPreset(preset);
            setPrimaryColor(preset.palette.primary);
            setBackground(preset.background);
            setFontFamily(preset.fontFamily);
            setWidgets((prev) => ({
              ...prev,
              recentFocos: preset.recommendedWidgets.includes('recentFocos') ? true : prev.recentFocos,
              metasStatus: preset.recommendedWidgets.includes('metasStatus') ? true : prev.metasStatus,
              friends: preset.recommendedWidgets.includes('friends') ? true : prev.friends,
              timeline: preset.recommendedWidgets.includes('timeline') ? true : prev.timeline,
              goalsChart: preset.recommendedWidgets.includes('goalsChart') ? true : prev.goalsChart,
              achievements: preset.recommendedWidgets.includes('achievements') ? true : prev.achievements,
              readingClock: preset.recommendedWidgets.includes('readingClock') ? true : prev.readingClock,
              importQueue: preset.recommendedWidgets.includes('importQueue') ? true : prev.importQueue
            }));
          }}
        />
      </section>

      <footer style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
        <button
          className="brutalist-button"
          onClick={() => {
            setPrimaryColor(theme.primaryColor);
            setMode(theme.mode);
            setBackground(theme.background);
            setFontFamily(theme.fontFamily);
            setWidgets({ ...widgetDefaults, ...theme.widgets });
            setSelectedPreset(null);
          }}
        >
          Resetar ajustes
        </button>

        <button className="brutalist-button" data-variant="primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Salvando…' : 'Salvar personalização'}
        </button>
      </footer>
    </aside>
  );
};

export default CustomizationPanel;
