// Corps nu (peau) : torse, cou, bras, mains, jambes, pieds.

import * as THREE from 'three';
import { capsuleProfile, lathe, pinchCrotch, torsoProfile } from './geometry';
import type { BuildContext, Placement } from './parts/types';

export function buildBody(ctx: BuildContext): Placement[] {
  const { m } = ctx;
  const out: Placement[] = [];

  const torso = ctx.mesh(pinchCrotch(lathe(torsoProfile(m), { depth: m.depth, segments: 32 }), m), 'skin');
  out.push({ anchor: 'torso', object: torso });

  const neckTop = m.headY - m.headR * 0.4;
  const neckBot = m.torsoH * 0.9;
  const neck = ctx.mesh(
    new THREE.CylinderGeometry(m.neckR, m.neckR * 1.12, neckTop - neckBot, 20, 1, true),
    'skin',
  );
  neck.position.y = (neckTop + neckBot) / 2;
  out.push({ anchor: 'upper', object: neck });

  for (const side of [1, -1] as const) {
    const arm = ctx.mesh(lathe(capsuleProfile(m.armR, m.armR * 0.74, m.armLen), { segments: 18 }), 'skin');
    out.push({ anchor: side > 0 ? 'armL' : 'armR', object: arm });

    // Main simplifiée : paume aplatie + pouce vers l'avant.
    const hand = new THREE.Group();
    const palm = ctx.mesh(new THREE.SphereGeometry(m.handR, 16, 12), 'skin');
    palm.scale.set(0.62, 1.15, 0.85);
    palm.position.y = -m.handR * 0.75;
    const thumb = ctx.mesh(new THREE.CapsuleGeometry(m.handR * 0.26, m.handR * 0.45, 4, 8), 'skin');
    thumb.position.set(-side * m.handR * 0.12, -m.handR * 0.55, m.handR * 0.62);
    thumb.rotation.x = 0.5;
    hand.add(palm, thumb);
    out.push({ anchor: side > 0 ? 'handL' : 'handR', object: hand });

    const leg = ctx.mesh(lathe(capsuleProfile(m.legR, m.legR * 0.66, m.legLen), { segments: 20 }), 'skin');
    out.push({ anchor: side > 0 ? 'legL' : 'legR', object: leg });

    const foot = ctx.mesh(new THREE.SphereGeometry(1, 16, 10), 'skin');
    foot.scale.set(m.legR * 0.72, m.footH * 0.6, m.footLen * 0.55);
    foot.position.set(0, -m.footH * 0.45, m.footLen * 0.3);
    out.push({ anchor: side > 0 ? 'footL' : 'footR', object: foot });
  }
  return out;
}
