import type { PartDef } from '../types';
import { cuffs, legs, pelvis } from './common';

/** Chino droit, revers roulés à la cheville. */
export const chino: PartDef = {
  id: 'chino',
  label: 'Chino',
  icon: '👖',
  build: (ctx) => [
    ...pelvis(ctx),
    ...legs(ctx, [[1.1, 0.96], [1.18, 0.5], [1.26, 0]]),
    ...cuffs(ctx, 0.96, 1.12),
  ],
};
