import type { PartDef } from '../types';
import { pair, shoe } from './common';

export const boots: PartDef = {
  id: 'boots',
  label: 'Bottes',
  icon: '👢',
  build: (ctx) => pair(() => shoe(ctx, { sole: 'darkSole', soleH: 0.5, upper: 'primary', shaft: 3.2, width: 1.05 })),
};
