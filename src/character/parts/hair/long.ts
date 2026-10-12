import * as THREE from 'three';
import type { PartDef } from '../types';
import { curtain, hairCap } from './common';

export const long: PartDef = {
  id: 'long',
  label: 'Long lisse',
  icon: '👩',
  weight: (c) => (c.sex === 'female' ? 3 : c.sex === 'neutral' ? 1.2 : 0.3),
  build: (ctx) => {
    const g = new THREE.Group();
    g.add(hairCap(ctx, { r: 1.07, line: 0.36, side: 1.08, temple: -0.5, nape: -0.9, arch: 0.3, strands: 0.008 }));
    g.add(curtain(ctx, { below: ctx.m.torsoH * 0.38, volume: 1.04, cap: 1.07 }));
    return [{ anchor: 'head', object: g }];
  },
};
