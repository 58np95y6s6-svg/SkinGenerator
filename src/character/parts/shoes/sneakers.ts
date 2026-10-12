import type { PartDef } from '../types';
import { pair, shoe } from './common';

export const sneakers: PartDef = {
  id: 'sneakers',
  label: 'Baskets',
  icon: '👟',
  twoTone: true,
  label2: 'Semelle',
  build: (ctx) => pair(() => shoe(ctx, { sole: 'secondary', soleH: 0.42, upper: 'primary', shaft: 0, laces: 'white' })),
};
