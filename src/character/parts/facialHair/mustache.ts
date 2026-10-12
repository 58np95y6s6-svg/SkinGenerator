import * as THREE from 'three';
import type { BuildContext, PartDef } from '../types';

export function mustacheShape(ctx: BuildContext): THREE.Object3D {
  const R = ctx.m.headR;
  const g = new THREE.Group();
  for (const side of [1, -1]) {
    const yaw = side * 0.12;
    const pitch = -0.33;
    const piece = ctx.mesh(new THREE.CapsuleGeometry(R * 0.055, R * 0.16, 4, 8), 'primary');
    piece.position.copy(ctx.head.point(yaw, pitch, 0.02));
    ctx.head.orient(piece, yaw, pitch);
    piece.rotateZ(side * (Math.PI / 2 - 0.35));
    g.add(piece);
  }
  return g;
}

export const mustache: PartDef = {
  id: 'mustache',
  label: 'Moustache',
  icon: '👨',
  weight: (c) => (c.sex === 'male' && c.age >= 18 ? 0.4 : 0),
  build: (ctx) => [{ anchor: 'head', object: mustacheShape(ctx) }],
};
