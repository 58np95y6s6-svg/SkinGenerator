// Catalogue central des pièces. Pour ajouter une pièce : créer son fichier dans le
// bon dossier puis l'ajouter à la liste correspondante ci-dessous.

import { NONE_PART, type PartDef } from './types';

import { bald } from './hair/bald';
import { shaved } from './hair/shaved';
import { short } from './hair/short';
import { long } from './hair/long';
import { wavy } from './hair/wavy';
import { braids } from './hair/braids';
import { bun } from './hair/bun';

import { beard } from './facialHair/beard';
import { mustache } from './facialHair/mustache';

import { tshirt } from './tops/tshirt';
import { shirt } from './tops/shirt';
import { hoodie } from './tops/hoodie';

import { jeans } from './bottoms/jeans';
import { chino } from './bottoms/chino';
import { jogger } from './bottoms/jogger';
import { shorts } from './bottoms/shorts';

import { sneakers } from './shoes/sneakers';
import { hightops } from './shoes/hightops';
import { boots } from './shoes/boots';

import { roundGlasses } from './accessories/glasses';
import { cap } from './accessories/cap';
import { beanie } from './accessories/beanie';

const noFacialHair: PartDef = { ...NONE_PART, label: 'Aucune', weight: () => 2.5 };
const none = (w: number): PartDef => ({ ...NONE_PART, weight: () => w });

export const CATALOG = {
  hair: [bald, shaved, short, long, wavy, braids, bun],
  facialHair: [noFacialHair, beard, mustache],
  top: [tshirt, shirt, hoodie],
  bottom: [jeans, chino, jogger, shorts],
  shoes: [sneakers, hightops, boots],
  glasses: [none(4), roundGlasses],
  headwear: [none(5), cap, beanie],
  jewelry: [none(1)],
  bag: [none(1)],
} satisfies Record<string, PartDef[]>;

export type CatalogKey = keyof typeof CATALOG;

export function findPart(list: PartDef[], id: string): PartDef {
  return list.find((p) => p.id === id) ?? list[0];
}
