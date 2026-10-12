import type { PartDef } from '../types';

export const bald: PartDef = {
  id: 'none',
  label: 'Chauve',
  icon: '🥚',
  weight: (c) => (c.sex === 'male' && c.age > 45 ? 0.8 : 0.03),
  build: () => [],
};
