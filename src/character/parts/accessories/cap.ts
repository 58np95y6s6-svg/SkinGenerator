import * as THREE from 'three';
import type { PartDef } from '../types';

export const cap: PartDef = {
  id: 'cap',
  label: 'Casquette',
  icon: '🧢',
  twoTone: true,
  label2: 'Visière',
  build: (ctx) => {
    const R = ctx.m.headR;
    const g = new THREE.Group();
    const dome = ctx.mesh(new THREE.SphereGeometry(R * 1.13, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.5), 'primary');
    dome.scale.set(...ctx.head.s);
    const button = ctx.mesh(new THREE.SphereGeometry(R * 0.07, 10, 8), 'primary');
    button.position.y = R * 1.13 * ctx.head.s[1];
    const visor = ctx.mesh(new THREE.CylinderGeometry(R * 0.82, R * 0.82, R * 0.06, 28, 1, false, -Math.PI / 2, Math.PI), 'secondary');
    visor.scale.z = 0.95;
    visor.position.set(0, R * 0.2, R * 0.72);
    visor.rotation.x = 0.32;
    g.add(dome, button, visor);
    g.position.set(0, R * 0.16, -R * 0.03);
    g.rotation.x = -0.08;
    return [{ anchor: 'head', object: g }];
  },
};
