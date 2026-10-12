import * as THREE from 'three';
import type { PartDef } from '../types';
import { curtain, hairCap } from './common';

export const wavy: PartDef = {
  id: 'wavy',
  label: 'Ondulé',
  icon: '🌊',
  weight: (c) => (c.sex === 'female' ? 3 : c.sex === 'neutral' ? 1.2 : 0.3),
  build: (ctx) => {
    const g = new THREE.Group();
    g.add(hairCap(ctx, { r: 1.09, line: 0.36, side: 1.05, temple: -0.5, nape: -0.9, arch: 0.3, strands: 0.012 }));
    g.add(curtain(ctx, { below: ctx.m.torsoH * 0.45, volume: 1.12, wave: 0.06, cap: 1.09 }));
    return [{ anchor: 'head', object: g }];
  },
};
