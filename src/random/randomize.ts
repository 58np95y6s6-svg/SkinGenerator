// Génère un personnage au hasard, en conservant les attributs verrouillés.

import { CLOTH_COLORS, EYE_COLORS, HAIR_FANCY, HAIR_GREY, HAIR_NATURAL, SKIN_TONES } from '../character/palettes';
import { CATALOG } from '../character/parts/registry';
import type { PartDef } from '../character/parts/types';
import type { Build, CharacterConfig, Sex, Styled } from '../character/schema';
import { FIRST_NAMES, LAST_NAMES } from './names';

export type LockKey =
  | 'sex' | 'name' | 'age' | 'skin' | 'eyes' | 'build' | 'height'
  | 'hair' | 'facialHair' | 'top' | 'bottom' | 'shoes' | 'accessories';

const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];
const chance = (p: number) => Math.random() < p;

function weighted(parts: PartDef[], cfg: CharacterConfig): PartDef {
  const w = parts.map((p) => Math.max(0, p.weight ? p.weight(cfg) : 1));
  const total = w.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < parts.length; i++) {
    r -= w[i];
    if (r <= 0) return parts[i];
  }
  return parts[parts.length - 1];
}

function randomAge(): number {
  const r = Math.random();
  if (r < 0.15) return 5 + Math.floor(Math.random() * 8);
  if (r < 0.32) return 13 + Math.floor(Math.random() * 7);
  if (r < 0.85) return 20 + Math.floor(Math.random() * 40);
  return 60 + Math.floor(Math.random() * 25);
}

function hairColor(age: number): string {
  if (age > 62 && chance(0.75)) return pick(HAIR_GREY);
  if (age > 45 && chance(0.2)) return pick(HAIR_GREY);
  if (age > 12 && age < 40 && chance(0.06)) return pick(HAIR_FANCY);
  return pick(HAIR_NATURAL);
}

/** Deux couleurs de vêtements qui vont bien ensemble (simple et efficace). */
function clothes(): [string, string] {
  const a = pick(CLOTH_COLORS);
  let b = pick(CLOTH_COLORS);
  while (b === a) b = pick(CLOTH_COLORS);
  return [a, b];
}

function styledPart(list: PartDef[], cfg: CharacterConfig, colors?: [string, string]): Styled {
  const [color, color2] = colors ?? clothes();
  return { style: weighted(list, cfg).id, color, color2 };
}

export function randomName(sex: Sex): { firstName: string; lastName: string } {
  const pool = sex === 'neutral' ? FIRST_NAMES.neutral : chance(0.85) ? FIRST_NAMES[sex] : FIRST_NAMES.neutral;
  return { firstName: pick(pool), lastName: pick(LAST_NAMES) };
}

export function randomize(current: CharacterConfig, locks: ReadonlySet<LockKey>): CharacterConfig {
  const keep = (k: LockKey) => locks.has(k);
  const c: CharacterConfig = structuredClone(current);

  if (!keep('sex')) c.sex = pick<Sex>(['female', 'male', 'female', 'male', 'neutral']);
  if (!keep('age')) c.age = randomAge();
  if (!keep('name')) Object.assign(c, randomName(c.sex));
  if (!keep('skin')) c.skin = pick(SKIN_TONES);
  if (!keep('eyes')) c.eyes = pick(EYE_COLORS);
  if (!keep('build')) c.build = pick<Build>(['slim', 'average', 'average', 'average', 'strong']);
  if (!keep('height')) c.height = Math.round((0.93 + Math.random() * 0.14) * 100) / 100;

  if (!keep('accessories')) {
    c.glasses = styledPart(CATALOG.glasses, c, [pick(['#1e1f23', '#7a5236', '#e8c15a', '#c8c9cc', '#e04343']), '#1e1f23']);
    c.headwear = styledPart(CATALOG.headwear, c);
    c.jewelry = styledPart(CATALOG.jewelry, c);
    c.bag = styledPart(CATALOG.bag, c);
  }
  if (!keep('hair')) c.hair = { style: weighted(CATALOG.hair, c).id, color: hairColor(c.age) };
  if (!keep('facialHair')) c.facialHair = { style: weighted(CATALOG.facialHair, c).id };

  if (!keep('top')) c.top = styledPart(CATALOG.top, c);
  if (!keep('bottom')) {
    const denim = pick(['#9cc1e3', '#3d6fb6', '#22355e', '#1e1f23', '#d9c7a4', '#8d8f94']);
    c.bottom = styledPart(CATALOG.bottom, c, chance(0.6) ? [denim, denim] : undefined);
  }
  if (!keep('shoes')) {
    const sole = chance(0.75) ? '#f5f5f2' : pick(CLOTH_COLORS);
    c.shoes = styledPart(CATALOG.shoes, c, [pick(CLOTH_COLORS), sole]);
  }
  return c;
}
