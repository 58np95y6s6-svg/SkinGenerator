import { CLOTH_COLORS } from '../../character/palettes';
import { CATALOG } from '../../character/parts/registry';
import { PartPicker, Section } from '../controls';
import type { PanelProps } from './types';

export function ClothesPanel({ cfg, set, locks, toggleLock }: PanelProps) {
  const lp = { locks, toggleLock };
  return (
    <>
      <Section title="Haut" lock="top" {...lp}>
        <PartPicker parts={CATALOG.top} value={cfg.top} palette={CLOTH_COLORS} onChange={(top) => set({ top })} />
      </Section>
      <Section title="Bas" lock="bottom" {...lp}>
        <PartPicker parts={CATALOG.bottom} value={cfg.bottom} palette={CLOTH_COLORS} onChange={(bottom) => set({ bottom })} />
      </Section>
      <Section title="Chaussures" lock="shoes" {...lp}>
        <PartPicker parts={CATALOG.shoes} value={cfg.shoes} palette={CLOTH_COLORS} onChange={(shoes) => set({ shoes })} />
      </Section>
    </>
  );
}
