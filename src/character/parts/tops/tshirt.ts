import { torsoShell } from '../../geometry';
import type { PartDef } from '../types';
import { ring, sleeves } from './common';

export const tshirt: PartDef = {
  id: 'tshirt',
  label: 'T-shirt',
  icon: '👕',
  build: (ctx) => {
    const { m } = ctx;
    const top = m.torsoH * 0.995;
    return [
      { anchor: 'torso', object: ctx.mesh(torsoShell(m, { from: m.legR * 0.05, to: top, inflate: 0.02, flare: 0.012 }), 'primary') },
      { anchor: 'torso', object: ring(ctx, top - 0.004, 0.02, 0.009, 'primaryShade') },
      ...sleeves(ctx, { len: 0.32, rTop: 1.45, rBot: 1.42 }),
    ];
  },
};
