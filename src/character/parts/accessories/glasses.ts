import * as THREE from 'three';
import type { PartDef } from '../types';

export const roundGlasses: PartDef = {
  id: 'round',
  label: 'Lunettes rondes',
  icon: '👓',
  build: (ctx) => {
    const { m, head: hf } = ctx;
    const R = m.headR;
    const g = new THREE.Group();
    const rr = R * (0.29 - 0.035 * m.maturity);
    const tube = R * 0.022;
    const pts: THREE.Vector3[] = [];
    for (const side of [1, -1]) {
      const yaw = side * 0.36;
      const pitch = -0.06;
      const frame = new THREE.Group();
      frame.position.copy(hf.point(yaw, pitch, 0.1));
      hf.orient(frame, yaw, pitch, 2.2);
      const rim = ctx.mesh(new THREE.TorusGeometry(rr, tube, 8, 28), 'primary');
      const lens = ctx.mesh(new THREE.CircleGeometry(rr, 24), 'lens');
      frame.add(rim, lens);
      g.add(frame);
      pts.push(frame.position.clone());

      // Branche jusqu'à l'oreille.
      const a = frame.position.clone().add(new THREE.Vector3(side * rr, 0, -rr * 0.3));
      const b = hf.point(side * Math.PI * 0.47, -0.02, 0.05);
      const temple = ctx.mesh(new THREE.CylinderGeometry(tube, tube, a.distanceTo(b), 6), 'primary');
      temple.position.copy(a).add(b).multiplyScalar(0.5);
      temple.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
      g.add(temple);
    }
    const bridge = ctx.mesh(new THREE.CylinderGeometry(tube, tube, pts[0].distanceTo(pts[1]) - rr * 2, 6), 'primary');
    bridge.position.copy(pts[0]).add(pts[1]).multiplyScalar(0.5);
    bridge.position.y += rr * 0.2;
    bridge.rotation.z = Math.PI / 2;
    g.add(bridge);
    return [{ anchor: 'head', object: g }];
  },
};
