import type { PartDef } from '../types';
import { legs, pelvis } from './common';

/** Jean large (wide leg). */
export const jeans: PartDef = {
  id: 'jeans',
  label: 'Jean large',
  icon: '👖',
  build: (ctx) => {
    const k = 1 + ctx.m.footH / ctx.m.legLen * 0.5;
    return [...pelvis(ctx), ...legs(ctx, [[1.42, k], [1.36, 0.5], [1.34, 0]])];
  },
};
