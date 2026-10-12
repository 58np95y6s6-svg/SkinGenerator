import * as THREE from 'three';
import { lathe, tubeProfile } from '../../geometry';
import type { PartDef } from '../types';

export const beanie: PartDef = {
  id: 'beanie',
  label: 'Bonnet',
  icon: '🧶',
  twoTone: true,
  label2: 'Pompon',
  build: (ctx) => {
    const R = ctx.m.headR;
    const g = new THREE.Group();
    const th = Math.PI * 0.53;
    const r = R * 1.12;
    const dome = ctx.mesh(new THREE.SphereGeometry(r, 32, 18, 0, Math.PI * 2, 0, th), 'primary');
    dome.scale.set(...ctx.head.s);
    const brimY = r * Math.cos(th) * ctx.head.s[1];
    const brimR = r * Math.sin(th) + R * 0.04;
    const brim = ctx.mesh(lathe(tubeProfile(brimR, brimR, brimY + R * 0.28, brimY - R * 0.02, 2), { segments: 32 }), 'primaryShade');
    brim.scale.set(ctx.head.s[0], 1, ctx.head.s[2]);
    const pompom = ctx.mesh(new THREE.SphereGeometry(R * 0.2, 14, 10), 'secondary');
    pompom.position.y = r * ctx.head.s[1] + R * 0.12;
    g.add(dome, brim, pompom);
    g.position.set(0, R * 0.2, -R * 0.04);
    return [{ anchor: 'head', object: g }];
  },
};
