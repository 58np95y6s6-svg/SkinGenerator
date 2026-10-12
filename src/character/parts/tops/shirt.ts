import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { torsoShell } from '../../geometry';
import type { BuildContext, PartDef, Placement } from '../types';
import { onTorso, ring, sleeves } from './common';

/** Chemise ouverte (manches retroussées) sur un t-shirt. */
export const shirt: PartDef = {
  id: 'shirt',
  label: 'Chemise',
  icon: '👔',
  twoTone: true,
  label2: 'T-shirt dessous',
  build: (ctx) => {
    const { m } = ctx;
    const H = m.torsoH;
    const gap = 0.42;
    const out: Placement[] = [
      { anchor: 'torso', object: ctx.mesh(torsoShell(m, { from: m.legR * 0.2, to: H * 0.99, inflate: 0.016 }), 'secondary') },
      {
        anchor: 'torso',
        object: ctx.mesh(
          torsoShell(m, { from: -m.legR * 0.55, to: H * 0.985, inflate: 0.032, flare: 0.01, phiStart: gap / 2, phiLength: Math.PI * 2 - gap }),
          'primary',
        ),
      },
      { anchor: 'torso', object: ring(ctx, H * 0.975, 0.03, 0.018, 'primary') },
      ...sleeves(ctx, { len: 0.62, rTop: 1.42, rBot: 1.3, cuff: 'primary' }),
    ];
    for (const side of [1, -1]) {
      out.push({ anchor: 'torso', object: pocket(ctx, side * 0.5, H * 0.7) });
      // Pointes de col.
      const col = ctx.mesh(new RoundedBoxGeometry(m.neckR * 0.9, 0.012, m.neckR * 1.1, 2, 0.005), 'primary');
      col.position.copy(onTorso(ctx, side * 0.42, H * 0.95, 0.04));
      col.rotation.set(0.5, side * 0.5, side * -0.35);
      out.push({ anchor: 'torso', object: col });
    }
    return out;
  },
};

function pocket(ctx: BuildContext, phi: number, y: number): THREE.Object3D {
  const s = ctx.m.shoulderW;
  const g = new THREE.Group();
  const body = ctx.mesh(new RoundedBoxGeometry(s * 0.36, s * 0.36, 0.012, 2, 0.005), 'primary');
  const flap = ctx.mesh(new RoundedBoxGeometry(s * 0.38, s * 0.11, 0.016, 2, 0.006), 'primaryShade');
  flap.position.y = s * 0.17;
  flap.position.z = 0.003;
  g.add(body, flap);
  g.position.copy(onTorso(ctx, phi, y, 0.036));
  g.rotation.y = phi * 0.85;
  return g;
}
