import { useMemo, useState } from 'react';
import { CustomizationPreset, customizationPresets } from '../data/customizationPresets';

interface CustomizationGalleryProps {
  onApply: (preset: CustomizationPreset) => void;
}

interface PresetFilterState {
  query: string;
  background: string;
  texture: string;
  widget: string;
}

const uniqueValues = <K extends keyof CustomizationPreset>(key: K): string[] => {
  return Array.from(new Set(customizationPresets.map((preset) => String(preset[key] ?? '')).filter(Boolean)));
};

const backgroundOptions = uniqueValues('background');
const textureOptions = uniqueValues('texture');

const widgetOptions = Array.from(
  new Set(customizationPresets.flatMap((preset) => preset.recommendedWidgets)).values()
);

const cardStyle: React.CSSProperties = {
  border: '2px solid var(--border-color)',
  borderRadius: 'var(--card-radius)',
  padding: '1rem',
  display: 'grid',
  gap: '0.75rem',
  background: 'var(--surface-color)',
  cursor: 'pointer',
  transition: 'transform 160ms ease, box-shadow 160ms ease',
};

const swatchStyle: React.CSSProperties = {
  height: '48px',
  borderRadius: 'var(--card-radius)',
  border: '2px solid var(--border-color)',
  display: 'flex',
  overflow: 'hidden',
};

const columnStyle: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
  display: 'grid',
  gap: '0.25rem',
};

const CustomizationGallery: React.FC<CustomizationGalleryProps> = ({ onApply }) => {
  const [filters, setFilters] = useState<PresetFilterState>({ query: '', background: 'all', texture: 'all', widget: 'all' });

  const filteredPresets = useMemo(() => {
    return customizationPresets.filter((preset) => {
      const queryMatch = filters.query
        ? `${preset.name} ${preset.description} ${preset.tagline}`.toLowerCase().includes(filters.query.toLowerCase())
        : true;
      const backgroundMatch = filters.background === 'all' ? true : preset.background === filters.background;
      const textureMatch = filters.texture === 'all' ? true : preset.texture === filters.texture;
      const widgetMatch = filters.widget === 'all' ? true : preset.recommendedWidgets.includes(filters.widget);
      return queryMatch && backgroundMatch && textureMatch && widgetMatch;
    });
  }, [filters]);

  const handleHover = (event: React.MouseEvent<HTMLDivElement>) => {
    event.currentTarget.style.transform = 'translateY(-6px) scale(1.01)';
    event.currentTarget.style.boxShadow = '0 28px 50px rgba(0,0,0,0.25)';
  };

  const handleLeave = (event: React.MouseEvent<HTMLDivElement>) => {
    event.currentTarget.style.transform = 'translateY(0) scale(1)';
    event.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.12)';
  };

  return (
    <section style={{ display: 'grid', gap: '1.5rem' }}>
      <header>
        <h3 style={{ margin: 0, fontSize: '1.4rem', letterSpacing: '0.08em' }}>Biblioteca brutalista</h3>
        <p style={{ marginTop: '0.25rem', color: 'var(--muted-text)', fontSize: '0.9rem' }}>
          Explore 320 presets curados para experimentar paletas, texturas e fontes inspiradas no brutalismo. Combine com sua persona
          literária e aplique com um clique.
        </p>
      </header>

      <div style={{ display: 'grid', gap: '0.75rem', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <div style={columnStyle}>
          <label style={{ fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Busca</label>
          <input
            placeholder="Procure por sentimento, material ou cor"
            value={filters.query}
            onChange={(event) => setFilters((prev) => ({ ...prev, query: event.target.value }))}
            style={{ border: '2px solid var(--border-color)', borderRadius: 'var(--card-radius)', padding: '0.75rem', background: 'var(--surface-color)' }}
          />
        </div>

        <div style={columnStyle}>
          <label style={{ fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Textura</label>
          <select
            value={filters.texture}
            onChange={(event) => setFilters((prev) => ({ ...prev, texture: event.target.value }))}
            style={{ border: '2px solid var(--border-color)', borderRadius: 'var(--card-radius)', padding: '0.75rem', background: 'var(--surface-color)' }}
          >
            <option value="all">Todas</option>
            {textureOptions.map((texture) => (
              <option key={texture} value={texture}>
                {texture}
              </option>
            ))}
          </select>
        </div>

        <div style={columnStyle}>
          <label style={{ fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Textura base</label>
          <select
            value={filters.background}
            onChange={(event) => setFilters((prev) => ({ ...prev, background: event.target.value }))}
            style={{ border: '2px solid var(--border-color)', borderRadius: 'var(--card-radius)', padding: '0.75rem', background: 'var(--surface-color)' }}
          >
            <option value="all">Todas</option>
            {backgroundOptions.map((background) => (
              <option key={background} value={background}>
                {background}
              </option>
            ))}
          </select>
        </div>

        <div style={columnStyle}>
          <label style={{ fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Widget destaque</label>
          <select
            value={filters.widget}
            onChange={(event) => setFilters((prev) => ({ ...prev, widget: event.target.value }))}
            style={{ border: '2px solid var(--border-color)', borderRadius: 'var(--card-radius)', padding: '0.75rem', background: 'var(--surface-color)' }}
          >
            <option value="all">Todos</option>
            {widgetOptions.map((widget) => (
              <option key={widget} value={widget}>
                {widget}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', maxHeight: '48vh', overflow: 'auto', paddingRight: '0.5rem' }}>
        {filteredPresets.map((preset) => (
          <div
            key={preset.id}
            style={cardStyle}
            onClick={() => onApply(preset)}
            onMouseEnter={handleHover}
            onMouseLeave={handleLeave}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{preset.name}</h4>
                <p style={{ margin: 0, color: 'var(--muted-text)', fontSize: '0.85rem' }}>{preset.tagline}</p>
              </div>
              <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted-text)' }}>
                {preset.fontFamily}
              </span>
            </div>

            <div style={swatchStyle}>
              <div style={{ flex: 1, background: preset.palette.primary }} />
              <div style={{ flex: 1, background: preset.palette.secondary }} />
              <div style={{ flex: 1, background: preset.palette.accent }} />
            </div>

            <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: 1.4 }}>{preset.description}</p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {preset.recommendedWidgets.map((widget) => (
                <span
                  key={widget}
                  style={{
                    border: '1px solid var(--border-color)',
                    borderRadius: '999px',
                    padding: '0.35rem 0.75rem',
                    fontSize: '0.7rem',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                  }}
                >
                  {widget}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CustomizationGallery;
