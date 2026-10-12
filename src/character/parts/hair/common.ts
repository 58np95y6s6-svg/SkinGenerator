// Briques communes aux coiffures.

import * as THREE from 'three';
import { drapeGeometry, lathe, mix, seeded, type P2 } from '../../geometry';
import type { BuildContext } from '../types';

export const hasHeadwear = (ctx: BuildContext) => ctx.cfg.headwear.style !== 'none';

export interface CapOpts {
  /** Épaisseur : rayon relatif à la tête. */
  r?: number;
  /** Hauteur de la ligne du front (angle, 0 = niveau des yeux). */
  line?: number;
  /** Demi-largeur du visage dégagé (angle depuis l'avant). */
  side?: number;
  /** Hauteur de la nuque à l'arrière (angle, négatif). */
  nape?: number;
  /** Hauteur des pattes sur les côtés (angle). */
  temple?: number;
  /** Arrondi de la ligne du front (plus haut au centre). */
  arch?: number;
  /** Relief des mèches (0 = lisse). */
  strands?: number;
}

export const smoothstep = (e0: number, e1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};

/**
 * Calotte de cheveux : une sphère un peu plus grande que la tête dont les sommets
 * situés sur le visage (et sous la nuque) sont rentrés dans le crâne. On obtient
 * une ligne de cheveux douce et réglable.
 */
export function hairCap(ctx: BuildContext, o: CapOpts = {}): THREE.Mesh {
  const R = ctx.m.headR;
  const r = o.r ?? 1.07;
  const line = o.line ?? 0.32;
  const side = o.side ?? 1.15;
  const nape = o.nape ?? -0.6;
  const temple = o.temple ?? -0.15;
  const arch = o.arch ?? 0.14;
  const strands = o.strands ?? 0;
  const geo = new THREE.SphereGeometry(1, 48, 32);
  const pos = geo.getAttribute('position') as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const sYaw = Math.atan2(v.x, v.z);
    const yaw = Math.abs(sYaw);
    const pitch = Math.asin(THREE.MathUtils.clamp(v.y, -1, 1));
    const ln = line + arch * Math.cos(Math.min(1, yaw / side) * Math.PI * 0.5) - arch * 0.5;
    const face = smoothstep(side + 0.12, side - 0.12, yaw) * smoothstep(ln + 0.1, ln - 0.1, pitch);
    const low = mix(temple, nape, THREE.MathUtils.clamp((yaw - side) / (Math.PI - side), 0, 1));
    const under = smoothstep(low + 0.12, low - 0.12, pitch);
    const groove = strands * Math.sin(sYaw * 18) * smoothstep(1.4, 0.4, pitch);
    const k = mix(r + groove, 0.9, Math.max(face, under));
    v.multiplyScalar(R * k);
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  geo.computeVertexNormals();
  const cap = ctx.mesh(geo, 'primary');
  cap.scale.set(...ctx.head.s);
  return cap;
}

/** Petites mèches sur le dessus / la frange. */
export function tufts(
  ctx: BuildContext,
  o: { count: number; size: number; seed: number; yaw: [number, number]; pitch: [number, number]; out?: number },
): THREE.Object3D {
  const R = ctx.m.headR;
  const rnd = seeded(o.seed);
  const g = new THREE.Group();
  const geo = new THREE.SphereGeometry(1, 12, 8);
  for (let i = 0; i < o.count; i++) {
    const yaw = mix(o.yaw[0], o.yaw[1], rnd());
    const pitch = mix(o.pitch[0], o.pitch[1], rnd());
    const s = R * o.size * mix(0.75, 1.15, rnd());
    const t = ctx.mesh(geo, 'primary');
    t.scale.set(s, s * 0.6, s * 1.1);
    const p = ctx.head.point(yaw, pitch, o.out ?? 0.06);
    p.y += R * 0.08;
    t.position.copy(p);
    ctx.head.orient(t, yaw, pitch);
    t.rotateX(-0.5);
    g.add(t);
  }
  return g;
}

export interface CurtainOpts {
  /** Longueur sous le haut des épaules (0 = aux épaules). */
  below: number;
  /** Rayon de la calotte associée (pour une jonction invisible). */
  cap: number;
  /** Ouverture devant le visage (radians, de chaque côté). */
  open?: number;
  /** Volume (rayon relatif). */
  volume?: number;
  /** Ondulation (0 = lisse). */
  wave?: number;
}

/** Rideau de cheveux longs qui prolonge la calotte et tombe sur les épaules. */
export function curtain(ctx: BuildContext, o: CurtainOpts): THREE.Mesh {
  const { m } = ctx;
  const R = m.headR;
  const sy = ctx.head.s[1];
  const vol = o.volume ?? 1.05;
  const capR = R * o.cap * 0.985;
  const yTop = R * 0.55;
  const yBot = m.shoulderRel - o.below;
  const rows = 30;
  const pts: P2[] = [];
  for (let i = 0; i <= rows; i++) {
    const t = i / rows; // 0 = bas, 1 = haut
    const y = mix(yBot, yTop, t);
    // Suit la calotte en haut, puis s'en détache en douceur.
    const onCap = capR * Math.sqrt(Math.max(0, 1 - (y / (capR * sy)) ** 2));
    const fall = R * mix(vol, 0.82, THREE.MathUtils.smoothstep(y, m.shoulderRel, 0));
    const k = 0.04 * R;
    const r = k * Math.log(Math.exp(onCap / k) + Math.exp(fall / k)); // max adouci
    pts.push([r, y]);
  }
  pts[0][0] *= 0.94;
  const open = o.open ?? 1.0;
  const geo = lathe(pts, { segments: 40, phiStart: open, phiLength: Math.PI * 2 - open * 2 });

  const pos = geo.getAttribute('position') as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const ang = Math.atan2(v.x, v.z);
    const depthT = THREE.MathUtils.clamp((0 - v.y) / (0 - yBot), 0, 1);
    // Pointes en arrondi : plus long au milieu du dos.
    const L = 0.84 + 0.16 * Math.abs(Math.sin(ang / 2));
    if (v.y < 0) v.y *= L;
    if (o.wave) {
      const k = 1 + o.wave * depthT * (0.6 * Math.sin(ang * 9) + 0.4 * Math.sin(v.y * 38 + ang * 3));
      v.x *= k;
      v.z *= k;
    }
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  drapeGeometry(geo, m);
  return ctx.mesh(geo, 'primary');
}
