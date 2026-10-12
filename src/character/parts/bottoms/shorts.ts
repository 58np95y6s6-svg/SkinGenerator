import type { PartDef } from '../types';
import { cuffs, legs, pelvis } from './common';

export const shorts: PartDef = {
  id: 'shorts',
  label: 'Short',
  icon: '🩳',
  build: (ctx) => [...pelvis(ctx), ...legs(ctx, [[1.4, 0.42], [1.36, 0]]), ...cuffs(ctx, 0.42, 1.36)],
};
