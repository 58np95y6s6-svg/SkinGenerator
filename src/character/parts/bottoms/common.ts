// Briques communes aux bas : bassin et jambes de pantalon.

import * as THREE from 'three';
import { lathe, torsoShell, type P2 } from '../../geometry';
import type { BuildContext, MatRole, Placement } from '../types';
import { ring } from '../tops/common';

/** Bassin du pantalon, de l'entrejambe jusqu'à la taille (+ ceinture). */
export function pelvis(ctx: BuildContext, waist = 0.34): Placement[] {
  const { m } = ctx;
  const top = m.torsoH * waist;
  return [
    { anchor: 'torso', object: ctx.mesh(torsoShell(m, { from: -1, to: top, inflate: 0.013 }), 'primary') },
    { anchor: 'torso', object: ring(ctx, top - 0.006, 0.014, 0.011, 'primaryShade') },
  ];
}

/**
 * Jambes de pantalon à partir d'un profil [rayon relatif à legR, longueur relative à la jambe],
 * ordonné du bas vers le haut. Ex. : [[1.3, 1], [1.35, 0]] = droit et large jusqu'à la cheville.
 */
export function legs(ctx: BuildContext, profile: [number, number][], role: MatRole = 'primary'): Placement[] {
  const { m } = ctx;
  const pts: P2[] = profile.map(([r, l]) => [m.legR * r, -m.legLen * l]);
  pts.push([pts[pts.length - 1][0], m.legR * 0.4]);
  return (['legL', 'legR'] as const).map((anchor) => ({
    anchor,
    object: ctx.mesh(lathe(pts, { segments: 22 }), role),
  }));
}

/** Revers roulé en bas de jambe. */
export function cuffs(ctx: BuildContext, rel: number, r: number, role: MatRole = 'primary'): Placement[] {
  const { m } = ctx;
  return (['legL', 'legR'] as const).map((anchor) => {
    const t = ctx.mesh(new THREE.TorusGeometry(m.legR * r, m.legR * 0.22, 8, 20), role);
    t.rotation.x = Math.PI / 2;
    t.position.y = -m.legLen * rel + m.legR * 0.1;
    return { anchor, object: t };
  });
}
