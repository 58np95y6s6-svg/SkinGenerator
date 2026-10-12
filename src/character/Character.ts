// Assemble le personnage à partir de sa configuration.
// - Les points d'attache (anchors) sont persistants et repositionnés selon les proportions.
// - Chaque "slot" (corps, visage, cheveux, haut…) n'est reconstruit que si sa forme change.
// - Un simple changement de couleur ne fait que modifier les matériaux.

import * as THREE from 'three';
import { buildBody } from './body';
import { buildFace } from './face';
import { HeadFrame } from './geometry';
import { computeMetrics, type Metrics } from './morph';
import { CATALOG, findPart, type CatalogKey } from './parts/registry';
import type { Anchor, BuildContext, MatRole, Placement } from './parts/types';
import type { CharacterConfig } from './schema';

type SlotId = 'body' | 'face' | CatalogKey;

interface SlotDef {
  id: SlotId;
  /** Ce qui, en plus des proportions, impose une reconstruction. */
  key: (c: CharacterConfig) => string;
  build: (ctx: BuildContext) => Placement[];
  colors: (c: CharacterConfig) => { primary: string; secondary: string };
}

const styled = (k: Exclude<CatalogKey, 'hair' | 'facialHair'>): SlotDef => ({
  id: k,
  key: (c) => c[k].style,
  build: (ctx) => findPart(CATALOG[k], ctx.cfg[k].style).build(ctx),
  colors: (c) => ({ primary: c[k].color, secondary: c[k].color2 }),
});

const SLOTS: SlotDef[] = [
  { id: 'body', key: () => '', build: buildBody, colors: (c) => ({ primary: c.skin, secondary: c.skin }) },
  { id: 'face', key: () => '', build: buildFace, colors: (c) => ({ primary: c.eyes, secondary: c.hair.color }) },
  {
    id: 'hair',
    key: (c) => `${c.hair.style}|${c.headwear.style !== 'none'}`,
    build: (ctx) => findPart(CATALOG.hair, ctx.cfg.hair.style).build(ctx),
    colors: (c) => ({ primary: c.hair.color, secondary: c.hair.color }),
  },
  {
    id: 'facialHair',
    key: (c) => c.facialHair.style,
    build: (ctx) => findPart(CATALOG.facialHair, ctx.cfg.facialHair.style).build(ctx),
    colors: (c) => ({ primary: c.hair.color, secondary: c.hair.color }),
  },
  styled('top'),
  styled('bottom'),
  styled('shoes'),
  styled('glasses'),
  styled('headwear'),
  styled('jewelry'),
  styled('bag'),
];

const ROUGHNESS: Partial<Record<SlotId, number>> = { hair: 0.5, facialHair: 0.7, body: 0.62, face: 0.3, glasses: 0.3 };

function shade(hex: string, k: number): string {
  const c = new THREE.Color(hex);
  const hsl = { h: 0, s: 0, l: 0 };
  c.getHSL(hsl);
  c.setHSL(hsl.h, hsl.s, hsl.l * k);
  return '#' + c.getHexString();
}

export class Character {
  readonly root = new THREE.Group();
  readonly anchors = {} as Record<Anchor, THREE.Group>;
  metrics!: Metrics;

  private cfg!: CharacterConfig;
  private metricsKey = '';
  private slotKeys = new Map<SlotId, string>();
  private slotObjects = new Map<SlotId, THREE.Object3D[]>();
  private mats = new Map<string, THREE.MeshStandardMaterial>();
  private fixed: Record<string, THREE.Material>;
  private eyes: THREE.Object3D[] = [];
  private nextBlink = 2;

  constructor() {
    const names: Anchor[] = ['torso', 'upper', 'head', 'armL', 'armR', 'handL', 'handR', 'legL', 'legR', 'footL', 'footR'];
    for (const n of names) {
      const g = new THREE.Group();
      g.name = n;
      this.anchors[n] = g;
    }
    const a = this.anchors;
    const hips = new THREE.Group();
    hips.name = 'hips';
    this.root.add(hips);
    hips.add(a.torso, a.upper, a.legL, a.legR);
    a.upper.add(a.head, a.armL, a.armR);
    a.armL.add(a.handL);
    a.armR.add(a.handR);
    a.legL.add(a.footL);
    a.legR.add(a.footR);

    const std = (color: string, roughness = 0.7) => new THREE.MeshStandardMaterial({ color, roughness });
    this.fixed = {
      white: std('#ffffff', 0.35),
      black: std('#141414', 0.3),
      sole: std('#f4f4f0', 0.6),
      darkSole: std('#3a2a20', 0.8),
      metal: new THREE.MeshStandardMaterial({ color: '#e8c15a', metalness: 0.8, roughness: 0.3 }),
      lens: new THREE.MeshPhysicalMaterial({ color: '#dff1ff', transparent: true, opacity: 0.18, roughness: 0.05, depthWrite: false }),
      mouth: std('#7a2e2e', 0.55),
      shine: new THREE.MeshBasicMaterial({ color: '#ffffff' }),
    };
  }

  get config() {
    return this.cfg;
  }

  /** Applique une configuration (reconstruit seulement ce qui a changé). */
  update(cfg: CharacterConfig) {
    this.cfg = cfg;
    const mk = `${cfg.sex}|${cfg.age}|${cfg.build}`;
    const metricsChanged = mk !== this.metricsKey;
    if (metricsChanged) {
      this.metricsKey = mk;
      this.metrics = computeMetrics(cfg);
      this.layout();
    }
    this.root.scale.setScalar(cfg.height);

    const head = new HeadFrame(this.metrics.headR, this.metrics.headScale);
    let rebuilt = false;
    for (const slot of SLOTS) {
      const colors = slot.colors(cfg);
      this.material(slot.id, 'primary').color.set(colors.primary);
      this.material(slot.id, 'secondary').color.set(colors.secondary);
      this.material(slot.id, 'primaryShade').color.set(shade(colors.primary, 0.82));
      this.material(slot.id, 'secondaryShade').color.set(shade(colors.secondary, 0.82));

      const key = slot.key(cfg);
      if (!metricsChanged && this.slotKeys.get(slot.id) === key) continue;
      this.slotKeys.set(slot.id, key);
      this.clearSlot(slot.id);
      const ctx = this.context(slot.id, head);
      const placed = slot.build(ctx);
      for (const p of placed) this.anchors[p.anchor].add(p.object);
      this.slotObjects.set(slot.id, placed.map((p) => p.object));
      rebuilt = true;
    }
    this.material('body', 'skin').color.set(cfg.skin);
    if (rebuilt) {
      this.eyes = [];
      this.anchors.head.traverse((o) => o.userData.blink && this.eyes.push(o));
    }
  }

  /** Hauteur réelle (avec le facteur de taille). */
  get height() {
    return this.metrics ? this.metrics.stature * this.cfg.height : 0;
  }

  /** Animation d'attente : respiration, léger balancement, clignements. */
  tick(t: number) {
    const m = this.metrics;
    if (!m) return;
    const a = this.anchors;
    const b = Math.sin((t * Math.PI * 2) / 3.8);
    a.torso.scale.set(1 + 0.012 * b, 1 + 0.005 * b, 1 + 0.018 * b);
    a.upper.position.y = 0.0035 * b;
    a.armL.rotation.z = m.armSpread + 0.012 * b;
    a.armR.rotation.z = -m.armSpread - 0.012 * b;
    a.head.rotation.y = 0.05 * Math.sin(t * 0.45);
    a.head.rotation.z = 0.018 * Math.sin(t * 0.7);
    a.head.rotation.x = -m.stoop * 0.6 + 0.012 * Math.sin(t * 0.55);

    if (t > this.nextBlink + 0.16) this.nextBlink = t + 1.8 + Math.random() * 3.2;
    const p = (t - this.nextBlink) / 0.16;
    const s = p > 0 && p < 1 ? 1 - 0.92 * Math.sin(p * Math.PI) : 1;
    for (const e of this.eyes) e.scale.y = s;
  }

  private layout() {
    const m = this.metrics;
    const a = this.anchors;
    const hips = a.torso.parent!;
    hips.position.y = m.hipY;
    a.upper.rotation.x = m.stoop;
    a.head.position.set(0, m.headY, 0);
    a.armL.position.set(m.shoulderX, m.shoulderJY, 0);
    a.armR.position.set(-m.shoulderX, m.shoulderJY, 0);
    a.armL.rotation.z = m.armSpread;
    a.armR.rotation.z = -m.armSpread;
    a.handL.position.y = -m.armLen;
    a.handR.position.y = -m.armLen;
    a.legL.position.set(m.legGap, 0, 0);
    a.legR.position.set(-m.legGap, 0, 0);
    a.footL.position.y = -m.legLen;
    a.footR.position.y = -m.legLen;
    a.footL.rotation.y = 0.08;
    a.footR.rotation.y = -0.08;
  }

  private context(slot: SlotId, head: HeadFrame): BuildContext {
    const mat = (role: MatRole): THREE.Material => {
      if (role === 'skin') return this.material('body', 'skin');
      if (role === 'hair') return this.material('hair', 'primary');
      if (role in this.fixed) return this.fixed[role];
      return this.material(slot, role);
    };
    return {
      m: this.metrics,
      cfg: this.cfg,
      head,
      mat,
      mesh: (geo, role) => {
        const mesh = new THREE.Mesh(geo, mat(role));
        mesh.castShadow = true;
        return mesh;
      },
    };
  }

  private material(slot: SlotId, role: string): THREE.MeshStandardMaterial {
    const k = `${slot}.${role}`;
    let m = this.mats.get(k);
    if (!m) {
      m = new THREE.MeshStandardMaterial({
        roughness: role === 'skin' ? 0.6 : (ROUGHNESS[slot] ?? 0.82),
        side: slot === 'body' || slot === 'face' ? THREE.FrontSide : THREE.DoubleSide,
      });
      this.mats.set(k, m);
    }
    return m;
  }

  private clearSlot(id: SlotId) {
    for (const o of this.slotObjects.get(id) ?? []) {
      o.removeFromParent();
      o.traverse((c) => {
        if (c instanceof THREE.Mesh) c.geometry.dispose();
      });
    }
    this.slotObjects.delete(id);
  }
}
