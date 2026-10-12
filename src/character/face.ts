// Tête et visage : grands yeux brillants, sourcils, nez, sourire, oreilles.

import * as THREE from 'three';
import type { BuildContext, Placement } from './parts/types';

export function buildFace(ctx: BuildContext): Placement[] {
  const { m, head: hf } = ctx;
  const R = m.headR;
  const g = new THREE.Group();

  const skull = ctx.mesh(new THREE.SphereGeometry(R, 40, 28), 'skin');
  skull.scale.set(...hf.s);
  g.add(skull);

  for (const side of [1, -1]) {
    const ear = ctx.mesh(new THREE.SphereGeometry(R * 0.19, 14, 10), 'skin');
    ear.scale.set(0.45, 1, 0.72);
    ear.position.copy(hf.point(side * Math.PI * 0.49, -0.1, -0.03));
    g.add(ear);
  }

  const nose = ctx.mesh(new THREE.SphereGeometry(R * 0.085, 16, 12), 'skin');
  nose.scale.set(1.15, 0.85, 0.9);
  nose.position.copy(hf.point(0, -0.2, 0.0));
  g.add(nose);

  // Yeux : blanc + iris + pupille + reflets. Chaque œil est un groupe "blink".
  const eyeR = R * (0.235 - 0.03 * m.maturity);
  for (const side of [1, -1]) {
    const yaw = side * 0.36;
    const pitch = -0.06;
    const eye = new THREE.Group();
    eye.userData.blink = true;
    eye.position.copy(hf.point(yaw, pitch, -0.1));
    hf.orient(eye, yaw, pitch, 1.4);

    const sclera = ctx.mesh(new THREE.SphereGeometry(eyeR, 24, 16), 'white');
    sclera.scale.set(1, 1.12, 0.55);
    const iris = ctx.mesh(new THREE.SphereGeometry(eyeR * 0.74, 24, 16), 'primary');
    iris.scale.set(1, 1.04, 0.3);
    iris.position.z = eyeR * 0.42;
    const pupil = ctx.mesh(new THREE.SphereGeometry(eyeR * 0.38, 16, 12), 'black');
    pupil.scale.set(1, 1.04, 0.25);
    pupil.position.z = eyeR * 0.56;
    const hl1 = ctx.mesh(new THREE.SphereGeometry(eyeR * 0.16, 10, 8), 'shine');
    hl1.position.set(-eyeR * 0.24, eyeR * 0.28, eyeR * 0.62);
    const hl2 = ctx.mesh(new THREE.SphereGeometry(eyeR * 0.08, 8, 6), 'shine');
    hl2.position.set(eyeR * 0.22, -eyeR * 0.2, eyeR * 0.63);
    eye.add(sclera, iris, pupil, hl1, hl2);

    if (m.sex === 'female') {
      for (const k of [0, 1]) {
        const lash = ctx.mesh(new THREE.CapsuleGeometry(eyeR * 0.07, eyeR * 0.28, 3, 6), 'black');
        lash.position.set(side * eyeR * (0.7 + 0.18 * k), eyeR * (0.88 - 0.25 * k), eyeR * 0.3);
        lash.rotation.z = side * (-0.7 - 0.4 * k);
        eye.add(lash);
      }
    }
    g.add(eye);

    // Sourcil (arc de tore).
    const brow = new THREE.Group();
    const by = 0.24;
    brow.position.copy(hf.point(side * 0.36, by, 0.0));
    hf.orient(brow, side * 0.36, by, 0.8);
    const arc = 1.2;
    const thick = m.sex === 'male' ? 0.03 : 0.022;
    const torus = ctx.mesh(new THREE.TorusGeometry(R * 0.17, R * thick, 6, 14, arc), 'secondary');
    torus.rotation.z = Math.PI / 2 - arc / 2 + side * 0.08;
    torus.position.y = -R * 0.17;
    torus.scale.z = 0.6;
    brow.add(torus);
    g.add(brow);
  }

  // Sourire.
  const mouth = new THREE.Group();
  const mp = -0.42;
  mouth.position.copy(hf.point(0, mp, -0.01));
  hf.orient(mouth, 0, mp, 0.5);
  const arc = 1.5;
  const smile = ctx.mesh(new THREE.TorusGeometry(R * 0.12, R * 0.022, 6, 16, arc), 'mouth');
  smile.rotation.z = -Math.PI / 2 - arc / 2;
  smile.position.y = R * 0.12;
  mouth.add(smile);
  g.add(mouth);

  return [{ anchor: 'head', object: g }];
}
