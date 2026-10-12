import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { torsoShell } from '../../geometry';
import type { PartDef, Placement } from '../types';
import { onTorso, ring, sleeves } from './common';

/** Sweat à capuche bicolore (corps / manches + capuche). */
export const hoodie: PartDef = {
  id: 'hoodie',
  label: 'Sweat capuche',
  icon: '🧥',
  twoTone: true,
  label2: 'Manches & capuche',
  build: (ctx) => {
    const { m } = ctx;
    const H = m.torsoH;
    const R = m.headR;
    const hem = -m.legR * 0.35;
    const out: Placement[] = [
      { anchor: 'torso', object: ctx.mesh(torsoShell(m, { from: hem, to: H * 0.99, inflate: 0.034, flare: 0.006 }), 'primary') },
      { anchor: 'torso', object: ring(ctx, hem + 0.012, 0.034, 0.016, 'primaryShade') },
      ...sleeves(ctx, { len: 0.97, rTop: 1.45, rBot: 1.2, role: 'secondary', cuff: 'secondaryShade' }),
    ];

    // Capuche rabattue : bourrelet autour du cou + volume dans le dos.
    const collar = ctx.mesh(new THREE.TorusGeometry(m.neckR * 1.75, m.neckR * 0.62, 10, 28), 'secondary');
    collar.rotation.x = Math.PI / 2 + 0.25;
    collar.position.set(0, H * 1.0, -m.neckR * 0.35);
    collar.scale.y = 0.85;
    const hood = ctx.mesh(new THREE.SphereGeometry(R * 0.62, 20, 14), 'secondary');
    hood.scale.set(1.15, 0.85, 0.55);
    hood.position.set(0, H * 0.96, -(m.shoulderW * m.depth + R * 0.12));
    out.push({ anchor: 'torso', object: collar }, { anchor: 'torso', object: hood });

    // Poche kangourou et cordons.
    const pocket = ctx.mesh(new RoundedBoxGeometry(m.hipW * 1.15, H * 0.2, 0.02, 2, 0.008), 'primaryShade');
    pocket.position.copy(onTorso(ctx, 0, H * 0.24, 0.036));
    out.push({ anchor: 'torso', object: pocket });
    for (const side of [1, -1]) {
      const cord = ctx.mesh(new THREE.CylinderGeometry(0.005, 0.005, H * 0.22, 6), 'white');
      const p = onTorso(ctx, side * 0.18, H * 0.82, 0.045);
      cord.position.copy(p);
      out.push({ anchor: 'torso', object: cord });
    }
    return out;
  },
};
