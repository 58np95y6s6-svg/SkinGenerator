// Briques communes aux hauts : manches, cols, poches.

import * as THREE from 'three';
import { lathe, sleeveProfile, torsoRadiusAt } from '../../geometry';
import type { BuildContext, MatRole, Placement } from '../types';

export interface SleeveOpts {
  /** Longueur relative au bras (1 = jusqu'au poignet). */
  len: number;
  rTop: number;
  rBot: number;
  role?: MatRole;
  /** Revers roulé ou bord-côte en bas de manche. */
  cuff?: MatRole;
}

export function sleeves(ctx: BuildContext, o: SleeveOpts): Placement[] {
  const { m } = ctx;
  const out: Placement[] = [];
  const len = m.armLen * o.len;
  for (const anchor of ['armL', 'armR'] as const) {
    const g = new THREE.Group();
    const geo = lathe(sleeveProfile(m.armR * o.rTop, m.armR * o.rBot, len), { segments: 20 });
    g.add(ctx.mesh(geo, o.role ?? 'primary'));
    if (o.cuff) {
      const cuff = ctx.mesh(new THREE.TorusGeometry(m.armR * o.rBot, m.armR * 0.2, 8, 20), o.cuff);
      cuff.rotation.x = Math.PI / 2;
      cuff.position.y = -len + m.armR * 0.1;
      g.add(cuff);
    }
    out.push({ anchor, object: g });
  }
  return out;
}

/** Anneau horizontal autour du torse (ourlet, ceinture, col). */
export function ring(ctx: BuildContext, y: number, extra: number, tube: number, role: MatRole): THREE.Mesh {
  const { m } = ctx;
  const r = torsoRadiusAt(m, y) + extra;
  const t = ctx.mesh(new THREE.TorusGeometry(r, tube, 8, 32), role);
  t.rotation.x = Math.PI / 2;
  t.scale.y = (r * m.depth + extra * (1 - m.depth)) / r;
  t.position.y = y;
  return t;
}

/** Position d'un point à la surface du vêtement (phi : 0 = devant). */
export function onTorso(ctx: BuildContext, phi: number, y: number, extra: number): THREE.Vector3 {
  const { m } = ctx;
  const r = torsoRadiusAt(m, y);
  return new THREE.Vector3(Math.sin(phi) * (r + extra), y, Math.cos(phi) * (r * m.depth + extra));
}
