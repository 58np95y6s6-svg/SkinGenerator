import { HAIR_COLORS } from '../../character/palettes';
import { CATALOG } from '../../character/parts/registry';
import { OptionGrid, Section, Swatches } from '../controls';
import type { PanelProps } from './types';

export function HairPanel({ cfg, set, locks, toggleLock }: PanelProps) {
  const lp = { locks, toggleLock };
  return (
    <>
      <Section title="Coiffure" lock="hair" {...lp}>
        <OptionGrid value={cfg.hair.style} parts={CATALOG.hair} onChange={(style) => set({ hair: { ...cfg.hair, style } })} />
        <p class="sub">Couleur</p>
        <Swatches value={cfg.hair.color} colors={HAIR_COLORS} onChange={(color) => set({ hair: { ...cfg.hair, color } })} />
      </Section>
      <Section title="Barbe & moustache" lock="facialHair" {...lp}>
        <OptionGrid value={cfg.facialHair.style} parts={CATALOG.facialHair} onChange={(style) => set({ facialHair: { style } })} />
      </Section>
    </>
  );
}
