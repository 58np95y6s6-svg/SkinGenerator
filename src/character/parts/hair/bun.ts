import * as THREE from 'three';
import type { PartDef } from '../types';
import { hairCap, hasHeadwear } from './common';

export const bun: PartDef = {
  id: 'bun',
  label: 'Chignon',
  icon: '🍩',
  weight: (c) => (c.sex === 'female' ? 2 : c.sex === 'neutral' ? 1 : 0.3),
  build: (ctx) => {
    const R = ctx.m.headR;
    const g = new THREE.Group();
    g.add(hairCap(ctx, { r: 1.05 }));
    if (!hasHeadwear(ctx)) {
      const yaw = Math.PI;
      const pitch = 0.95;
      const knot = ctx.mesh(new THREE.SphereGeometry(R * 0.42, 24, 16), 'primary');
      knot.position.copy(ctx.head.point(yaw, pitch, 0.32));
      const band = ctx.mesh(new THREE.TorusGeometry(R * 0.3, R * 0.07, 8, 20), 'primaryShade');
      band.position.copy(ctx.head.point(yaw, pitch, 0.08));
      ctx.head.orient(band, yaw, pitch);
      g.add(knot, band);
    }
    return [{ anchor: 'head', object: g }];
  },
};
