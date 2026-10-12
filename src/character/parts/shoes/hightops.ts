import type { PartDef } from '../types';
import { pair, shoe } from './common';

export const hightops: PartDef = {
  id: 'hightops',
  label: 'Montantes',
  icon: '🥾',
  twoTone: true,
  label2: 'Semelle & bout',
  build: (ctx) =>
    pair(() => shoe(ctx, { sole: 'secondary', soleH: 0.5, upper: 'primary', shaft: 1.4, toeCap: 'secondary', laces: 'white' })),
};
