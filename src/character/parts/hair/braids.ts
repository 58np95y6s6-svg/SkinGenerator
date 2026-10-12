import * as THREE from 'three';
import { drapePoint, mix, seeded } from '../../geometry';
import type { PartDef } from '../types';
import { hairCap } from './common';

/** Tresses fines : chaînes de perles (un seul InstancedMesh, très léger). */
export const braids: PartDef = {
  id: 'braids',
  label: 'Tresses',
  icon: '🪢',
  weight: (c) => (c.sex === 'female' ? 2 : 0.8),
  build: (ctx) => {
    const { m } = ctx;
    const R = m.headR;
    const g = new THREE.Group();
    g.add(hairCap(ctx, { r: 1.05, line: 0.36 }));

    const strands = 22;
    const beadR = R * 0.068;
    const yEnd = m.shoulderRel - m.torsoH * 0.5;
    const rnd = seeded(5);
    const pts: THREE.Vector3[] = [];
    for (let s = 0; s < strands; s++) {
      const yaw = mix(0.95, Math.PI * 2 - 0.95, s / (strands - 1));
      const pitch = mix(0.05, 0.3, rnd());
      const start = ctx.head.point(yaw, pitch, 0.06);
      start.y -= R * 0.1;
      const len = start.y - (yEnd + R * 0.15 * rnd());
      const n = Math.ceil(len / (beadR * 1.35));
      for (let i = 0; i < n; i++) {
        const t = i / n;
        const p = start.clone();
        p.y -= len * t;
        // La tresse s'écarte légèrement de la tête en descendant.
        const spread = 1 + 0.25 * Math.min(1, t * 3);
        p.x *= spread;
        p.z *= spread;
        // Zig-zag du tressage.
        const z = (i % 2 ? 1 : -1) * beadR * 0.28;
        p.x += Math.cos(yaw) * z;
        p.z -= Math.sin(yaw) * z;
        drapePoint(p, m, 0.04);
        pts.push(p);
      }
    }
    const inst = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 8, 6), ctx.mat('primary'), pts.length);
    const mtx = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const sc = new THREE.Vector3(beadR, beadR * 1.25, beadR);
    pts.forEach((p, i) => inst.setMatrixAt(i, mtx.compose(p, q, sc)));
    inst.castShadow = true;
    g.add(inst);
    return [{ anchor: 'head', object: g }];
  },
};
