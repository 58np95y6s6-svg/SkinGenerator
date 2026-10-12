import { CLOTH_COLORS } from '../../character/palettes';
import { CATALOG } from '../../character/parts/registry';
import { PartPicker, Section } from '../controls';
import type { PanelProps } from './types';

const FRAME_COLORS = ['#1e1f23', '#7a5236', '#e8c15a', '#c8c9cc', '#e04343', '#3d6fb6', '#ff7eb6'];

export function AccessoriesPanel({ cfg, set, locks, toggleLock }: PanelProps) {
  const lp = { locks, toggleLock };
  return (
    <>
      <p class="hint">🔒 Le cadenas ci-dessous verrouille tous les accessoires pour l'aléatoire.</p>
      <Section title="Lunettes" lock="accessories" {...lp}>
        <PartPicker parts={CATALOG.glasses} value={cfg.glasses} palette={FRAME_COLORS} onChange={(glasses) => set({ glasses })} />
      </Section>
      <Section title="Couvre-chef">
        <PartPicker parts={CATALOG.headwear} value={cfg.headwear} palette={CLOTH_COLORS} onChange={(headwear) => set({ headwear })} />
      </Section>
      <p class="hint">Bijoux et sacs arrivent à l'étape suivante.</p>
    </>
  );
}
