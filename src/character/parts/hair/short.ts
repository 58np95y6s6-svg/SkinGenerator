import * as THREE from 'three';
import type { PartDef } from '../types';
import { hairCap, hasHeadwear, tufts } from './common';

export const short: PartDef = {
  id: 'short',
  label: 'Court',
  icon: '💇',
  weight: (c) => (c.sex === 'male' ? 4 : c.sex === 'neutral' ? 1.5 : 0.6),
  build: (ctx) => {
    const g = new THREE.Group();
    g.add(hairCap(ctx, { r: 1.06, line: 0.42, side: 1.2, temple: -0.05, nape: -0.45 }));
    if (!hasHeadwear(ctx)) {
      // Mèches en épi sur le dessus, frange relevée.
      g.add(tufts(ctx, { count: 9, size: 0.3, seed: 7, yaw: [-0.7, 0.7], pitch: [0.7, 1.15], out: 0.0 }));
      g.add(tufts(ctx, { count: 5, size: 0.26, seed: 3, yaw: [-0.45, 0.45], pitch: [0.5, 0.62], out: 0.02 }));
    }
    return [{ anchor: 'head', object: g }];
  },
};
