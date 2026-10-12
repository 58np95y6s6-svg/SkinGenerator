// Briques communes aux chaussures. Repère : cheville en (0,0,0), sol en y = -footH, avant = +z.

import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { lathe, tubeProfile } from '../../geometry';
import type { BuildContext, MatRole, Placement } from '../types';

export interface ShoeOpts {
  sole: MatRole;
  soleH: number; // relatif à footH
  upper: MatRole;
  /** Hauteur de la tige au-dessus de la cheville (relatif à footH). 0 = basse. */
  shaft: number;
  toeCap?: MatRole;
  laces?: MatRole;
  width?: number;
}

export function shoe(ctx: BuildContext, o: ShoeOpts): THREE.Group {
  const { m } = ctx;
  const g = new THREE.Group();
  const fh = m.footH;
  const w = m.legR * 0.95 * (o.width ?? 1);
  const len = m.footLen * 1.25;
  const zc = m.footLen * 0.28;

  const soleH = fh * o.soleH;
  const sole = ctx.mesh(new RoundedBoxGeometry(w * 2.05, soleH, len, 3, soleH * 0.45), o.sole);
  sole.position.set(0, -fh + soleH / 2, zc);
  g.add(sole);

  const upper = ctx.mesh(new THREE.SphereGeometry(1, 24, 16), o.upper);
  upper.scale.set(w, fh * 0.95, len * 0.5);
  upper.position.set(0, -fh + soleH * 0.8, zc - len * 0.02);
  g.add(upper);

  // Col / tige autour de la cheville.
  const top = fh * Math.max(0.15, o.shaft);
  const collar = ctx.mesh(lathe(tubeProfile(m.legR * 0.9, m.legR * 0.95, top, -fh * 0.7, 2), { segments: 20 }), o.upper);
  g.add(collar);
  if (o.shaft > 0.3) {
    const rim = ctx.mesh(new THREE.TorusGeometry(m.legR * 0.9, fh * 0.12, 8, 20), o.upper);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = top;
    g.add(rim);
  }

  if (o.toeCap) {
    const toe = ctx.mesh(new THREE.SphereGeometry(1, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), o.toeCap);
    toe.scale.set(w * 0.92, fh * 0.75, len * 0.24);
    toe.rotation.x = Math.PI / 2;
    toe.position.set(0, -fh + soleH * 0.9, zc + len * 0.24);
    g.add(toe);
  }

  if (o.laces) {
    for (let i = 0; i < 3; i++) {
      const lace = ctx.mesh(new RoundedBoxGeometry(w * 0.9, fh * 0.1, fh * 0.12, 1, fh * 0.04), o.laces);
      const t = 0.15 + i * 0.13;
      lace.position.set(0, -fh * (0.02 + 0.28 * t * 2) + fh * 0.45, zc + len * (0.02 + t * 0.6) - len * 0.1);
      lace.rotation.x = -0.5;
      g.add(lace);
    }
  }
  return g;
}

export function pair(make: () => THREE.Object3D): Placement[] {
  return [
    { anchor: 'footL', object: make() },
    { anchor: 'footR', object: make() },
  ];
}
