// Outils de géométrie partagés par le corps, les vêtements et les cheveux.

import * as THREE from 'three';
import type { Metrics } from './morph';

/** Point de profil : [rayon, hauteur]. */
export type P2 = [number, number];

export interface LatheOpts {
  segments?: number;
  /** Aplatissement en z (section elliptique). */
  depth?: number;
  /** Épaisseur ajoutée au rayon (pour les vêtements). */
  inflate?: number;
  /** Angle de départ (0 = devant, +z). */
  phiStart?: number;
  phiLength?: number;
}

/**
 * Révolution d'un profil autour de l'axe Y, avec section elliptique.
 * Les points doivent être ordonnés par hauteur croissante (normales vers l'extérieur).
 */
export function lathe(points: P2[], o: LatheOpts = {}): THREE.BufferGeometry {
  const seg = o.segments ?? 28;
  const depth = o.depth ?? 1;
  const inf = o.inflate ?? 0;
  const phiStart = o.phiStart ?? 0;
  const phiLength = o.phiLength ?? Math.PI * 2;
  const closed = phiLength >= Math.PI * 2 - 1e-6;
  const cols = closed ? seg : seg + 1;
  const pos = new Float32Array(points.length * cols * 3);
  let k = 0;
  for (const [r, y] of points) {
    const pole = r < 1e-4;
    const rx = pole ? 0 : r + inf;
    const rz = pole ? 0 : r * depth + inf;
    for (let i = 0; i < cols; i++) {
      const phi = phiStart + (i / seg) * phiLength;
      pos[k++] = rx * Math.sin(phi);
      pos[k++] = y;
      pos[k++] = rz * Math.cos(phi);
    }
  }
  const idx: number[] = [];
  for (let j = 0; j < points.length - 1; j++) {
    for (let i = 0; i < seg; i++) {
      const i2 = closed ? (i + 1) % cols : i + 1;
      const a = j * cols + i;
      const b = j * cols + i2;
      const c = (j + 1) * cols + i;
      const d = (j + 1) * cols + i2;
      idx.push(a, b, c, b, d, c);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  // Normales propres aux pôles.
  const nrm = g.getAttribute('normal') as THREE.BufferAttribute;
  points.forEach(([r], j) => {
    if (r >= 1e-4) return;
    const s = j === 0 ? -1 : 1;
    for (let i = 0; i < cols; i++) nrm.setXYZ(j * cols + i, 0, s, 0);
  });
  return g;
}

/** Lisse un profil (Catmull-Rom) et le rééchantillonne. */
export function smooth(points: P2[], n = 40): P2[] {
  const curve = new THREE.CatmullRomCurve3(
    points.map(([r, y]) => new THREE.Vector3(r, y, 0)),
    false,
    'centripetal',
  );
  return curve.getPoints(n).map((p) => [Math.max(0, p.x), p.y] as P2);
}

/** Profil de membre arrondi aux deux bouts, de y = -len (bas) à y = 0 (haut). */
export function capsuleProfile(rTop: number, rBot: number, len: number, n = 6): P2[] {
  const pts: P2[] = [];
  for (let k = 0; k <= n; k++) {
    const a = -Math.PI / 2 + (k / n) * (Math.PI / 2);
    pts.push([rBot * Math.cos(a), -len + rBot * Math.sin(a)]);
  }
  for (let k = 1; k <= n; k++) {
    const a = (k / n) * (Math.PI / 2);
    pts.push([rTop * Math.cos(a), rTop * Math.sin(a)]);
  }
  pts[0][0] = 0;
  pts[pts.length - 1][0] = 0;
  return pts;
}

/** Tube ouvert en bas et arrondi en haut (manches). */
export function sleeveProfile(rTop: number, rBot: number, len: number, n = 5): P2[] {
  const pts: P2[] = [[rBot, -len], [mix(rBot, rTop, 0.5), -len / 2]];
  for (let k = 0; k <= n; k++) {
    const a = (k / n) * (Math.PI / 2);
    pts.push([rTop * Math.cos(a), rTop * 0.8 * Math.sin(a)]);
  }
  pts[pts.length - 1][0] = 0;
  return pts;
}

/** Tube ouvert aux deux bouts (jambes de pantalon, cols…), de yBot à yTop. */
export function tubeProfile(rTop: number, rBot: number, yTop: number, yBot: number, rows = 4): P2[] {
  const pts: P2[] = [];
  for (let i = 0; i <= rows; i++) {
    const t = i / rows;
    pts.push([mix(rBot, rTop, t), mix(yBot, yTop, t)]);
  }
  return pts;
}

export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

// ---------------------------------------------------------------- Torse

const torsoCache = new WeakMap<Metrics, P2[]>();

/** Profil du torse, de l'entrejambe (y < 0) jusqu'à la base du cou. */
export function torsoProfile(m: Metrics): P2[] {
  const cached = torsoCache.get(m);
  if (cached) return cached;
  const H = m.torsoH;
  const raw: P2[] = [
    [0, -m.legR * 0.7],
    [m.hipW * 0.75, -m.legR * 0.6],
    [m.hipW * 0.97, -m.legR * 0.15],
    [m.hipW, H * 0.12],
    [m.waistW, H * 0.42],
    [m.chestW, H * 0.7],
    [m.shoulderW * 0.94, H * 0.87],
    [m.shoulderW * 0.72, H * 0.97],
    [m.neckR * 1.25, H * 1.01],
    [0, H * 1.03],
  ];
  const res = smooth(raw, 48);
  res[0][0] = 0;
  res[res.length - 1][0] = 0;
  torsoCache.set(m, res);
  return res;
}

/** Rayon (en x) du torse à une hauteur donnée. */
export function torsoRadiusAt(m: Metrics, y: number): number {
  const p = torsoProfile(m);
  for (let i = 1; i < p.length; i++) {
    if (p[i][1] >= y) {
      const [r0, y0] = p[i - 1];
      const [r1, y1] = p[i];
      return mix(r0, r1, (y - y0) / (y1 - y0 || 1));
    }
  }
  return p[p.length - 1][0];
}

/** Aplatit l'avant/arrière du bas du torse pour un entrejambe naturel. */
export function pinchCrotch(g: THREE.BufferGeometry, m: Metrics): THREE.BufferGeometry {
  const pos = g.getAttribute('position') as THREE.BufferAttribute;
  const y0 = m.torsoH * 0.12;
  const y1 = -m.legR * 0.7;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    const t = THREE.MathUtils.smoothstep(y, y1, y0);
    pos.setZ(i, pos.getZ(i) * mix(0.62, 1, t));
  }
  g.computeVertexNormals();
  return g;
}

/** Garde la partie d'un profil comprise entre deux hauteurs. */
export function clipProfile(pts: P2[], from: number, to: number): P2[] {
  const out: P2[] = [];
  for (let i = 0; i < pts.length; i++) {
    const [r, y] = pts[i];
    if (i > 0) {
      const [r0, y0] = pts[i - 1];
      for (const b of [from, to]) {
        if ((y0 - b) * (y - b) < 0) out.push([mix(r0, r, (b - y0) / (y - y0)), b]);
      }
    }
    if (y >= from && y <= to) out.push([r, y]);
  }
  return out;
}

export interface ShellOpts {
  from: number;
  to: number;
  inflate: number;
  /** Évasement ajouté vers le bas (ourlet). */
  flare?: number;
  phiStart?: number;
  phiLength?: number;
}

/** Enveloppe de vêtement épousant le torse. */
export function torsoShell(m: Metrics, o: ShellOpts): THREE.BufferGeometry {
  let pts = clipProfile(torsoProfile(m), o.from, o.to);
  if (o.flare) {
    const span = o.to - o.from;
    pts = pts.map(([r, y]) => {
      const t = 1 - (y - o.from) / span;
      return [r > 1e-4 ? r + o.flare! * t * t : r, y] as P2;
    });
  }
  const g = lathe(pts, {
    depth: m.depth,
    inflate: o.inflate,
    segments: 32,
    phiStart: o.phiStart,
    phiLength: o.phiLength,
  });
  return o.from < m.torsoH * 0.12 ? pinchCrotch(g, m) : g;
}

// ---------------------------------------------------------------- Tête

/** Repère de la tête : place des éléments à la surface de l'ellipsoïde. */
export class HeadFrame {
  constructor(public R: number, public s: [number, number, number]) {}

  /** yaw : 0 = devant, + = vers la gauche du personnage (+x). pitch : + = vers le haut. */
  point(yaw: number, pitch: number, out = 0): THREE.Vector3 {
    const k = this.R * (1 + out);
    return new THREE.Vector3(
      Math.sin(yaw) * Math.cos(pitch) * k * this.s[0],
      Math.sin(pitch) * k * this.s[1],
      Math.cos(yaw) * Math.cos(pitch) * k * this.s[2],
    );
  }

  normal(yaw: number, pitch: number): THREE.Vector3 {
    return new THREE.Vector3(
      (Math.sin(yaw) * Math.cos(pitch)) / this.s[0],
      Math.sin(pitch) / this.s[1],
      (Math.cos(yaw) * Math.cos(pitch)) / this.s[2],
    ).normalize();
  }

  /** Oriente un objet pour que son +z suive la normale (mélangée avec l'avant). */
  orient(obj: THREE.Object3D, yaw: number, pitch: number, front = 0) {
    const n = this.normal(yaw, pitch).add(new THREE.Vector3(0, 0, front)).normalize();
    obj.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), n);
  }
}

/**
 * Fait retomber des cheveux sur les épaules : sous la ligne d'épaules, les points
 * sont ramenés vers le dos et repoussés hors du torse. Coordonnées : repère de la tête.
 */
export function drapePoint(p: THREE.Vector3, m: Metrics, margin = 0.035) {
  const yS = m.shoulderRel + 0.05;
  if (p.y > yS) return;
  const t = clamp((yS - p.y) / 0.14, 0, 1);
  let ang = Math.atan2(p.x, p.z);
  let rad = Math.hypot(p.x, p.z);
  const back = ang >= 0 ? Math.PI : -Math.PI;
  ang = back + (ang - back) * (1 - 0.32 * t);
  const a = m.shoulderW + margin;
  const b = m.shoulderW * m.depth + margin + 0.01;
  const sx = Math.sin(ang);
  const cz = Math.cos(ang);
  const er = 1 / Math.sqrt((sx * sx) / (a * a) + (cz * cz) / (b * b));
  if (rad < er) rad = mix(rad, er, t);
  p.x = Math.sin(ang) * rad;
  p.z = Math.cos(ang) * rad;
}

export function drapeGeometry(g: THREE.BufferGeometry, m: Metrics, offset?: THREE.Vector3) {
  const pos = g.getAttribute('position') as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    if (offset) v.add(offset);
    drapePoint(v, m);
    if (offset) v.sub(offset);
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  pos.needsUpdate = true;
  g.computeVertexNormals();
}

/** Petit générateur pseudo-aléatoire déterministe (formes stables d'une reconstruction à l'autre). */
export function seeded(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
