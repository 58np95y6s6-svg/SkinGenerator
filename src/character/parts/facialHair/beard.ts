import * as THREE from 'three';
import { mix } from '../../geometry';
import { smoothstep } from '../hair/common';
import type { PartDef } from '../types';
import { mustacheShape } from './mustache';

/** Barbe courte qui dégage la bouche, avec moustache. */
export const beard: PartDef = {
  id: 'beard',
  label: 'Barbe',
  icon: '🧔',
  weight: (c) => (c.sex === 'male' && c.age >= 18 ? 1 : 0),
  build: (ctx) => {
    const R = ctx.m.headR;
    const g = new THREE.Group();
    // Coque autour de la mâchoire ; joues, bouche et nuque sont rentrées dans la tête.
    const geo = new THREE.SphereGeometry(1, 48, 32);
    const pos = geo.getAttribute('position') as THREE.BufferAttribute;
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const yaw = Math.abs(Math.atan2(v.x, v.z));
      const pitch = Math.asin(THREE.MathUtils.clamp(v.y, -1, 1));
      // Haut de la barbe : sous les pommettes devant, rejoint les pattes sur les côtés.
      const top = mix(-0.42, -0.05, smoothstep(0.75, 1.45, yaw));
      let hide = smoothstep(top - 0.08, top + 0.08, pitch);
      hide = Math.max(hide, smoothstep(1.55, 1.8, yaw)); // pas derrière les oreilles
      hide = Math.max(hide, smoothstep(0.45, 0.32, yaw) * smoothstep(-0.66, -0.56, pitch)); // bouche
      const chin = smoothstep(-0.6, -1.0, pitch) * smoothstep(0.9, 0.2, yaw);
      v.multiplyScalar(R * mix(1.035 + 0.03 * chin, 0.9, hide));
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    geo.computeVertexNormals();
    const shell = ctx.mesh(geo, 'primary');
    shell.scale.set(...ctx.head.s);
    g.add(shell, mustacheShape(ctx));
    return [{ anchor: 'head', object: g }];
  },
};
