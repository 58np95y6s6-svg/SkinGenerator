import type { PartDef } from '../types';
import { hairCap } from './common';

export const shaved: PartDef = {
  id: 'shaved',
  label: 'Rasé',
  icon: '🪒',
  weight: (c) => (c.sex === 'male' ? 1.2 : c.sex === 'neutral' ? 0.6 : 0.15),
  build: (ctx) => [{ anchor: 'head', object: hairCap(ctx, { r: 1.02, line: 0.45, side: 1.25, temple: 0, nape: -0.4 }) }],
};
