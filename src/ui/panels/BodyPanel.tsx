import { heightCm } from '../../character/morph';
import { EYE_COLORS, SKIN_TONES } from '../../character/palettes';
import type { Build } from '../../character/schema';
import { Section, Segmented, Slider, Swatches } from '../controls';
import type { PanelProps } from './types';

export function BodyPanel({ cfg, set, locks, toggleLock }: PanelProps) {
  const lp = { locks, toggleLock };
  return (
    <>
      <Section title="Couleur de peau" lock="skin" {...lp}>
        <Swatches value={cfg.skin} colors={SKIN_TONES} onChange={(skin) => set({ skin })} />
      </Section>
      <Section title="Yeux" lock="eyes" {...lp}>
        <Swatches value={cfg.eyes} colors={EYE_COLORS} onChange={(eyes) => set({ eyes })} />
      </Section>
      <Section title="Morphologie" lock="build" {...lp}>
        <Segmented<Build>
          value={cfg.build}
          onChange={(build) => set({ build })}
          options={[
            { value: 'slim', label: 'Fine' },
            { value: 'average', label: 'Moyenne' },
            { value: 'strong', label: 'Forte' },
          ]}
        />
      </Section>
      <Section title="Taille" lock="height" {...lp}>
        <Slider value={cfg.height} min={0.9} max={1.1} step={0.01} onChange={(height) => set({ height })} label={`≈ ${heightCm(cfg)} cm`} />
      </Section>
    </>
  );
}
