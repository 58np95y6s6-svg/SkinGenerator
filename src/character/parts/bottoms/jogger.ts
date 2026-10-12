import type { PartDef } from '../types';
import { legs, pelvis } from './common';

/** Jogging ample, resserré à la cheville. */
export const jogger: PartDef = {
  id: 'jogger',
  label: 'Jogging',
  icon: '🏃',
  build: (ctx) => [
    ...pelvis(ctx),
    ...legs(ctx, [[0.86, 1.0], [0.88, 0.94], [1.3, 0.86], [1.4, 0.5], [1.36, 0]]),
  ],
};
