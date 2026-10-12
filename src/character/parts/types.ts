// Contrat commun à toutes les pièces interchangeables (coiffures, vêtements, accessoires…).

import type * as THREE from 'three';
import type { HeadFrame } from '../geometry';
import type { Metrics } from '../morph';
import type { CharacterConfig } from '../schema';

/** Points d'attache du squelette simplifié. */
export type Anchor =
  | 'torso' // torse (respire) — y = 0 au niveau des hanches
  | 'upper' // haut du corps (cou, bras, tête) — même origine que torso
  | 'head' // centre de la tête
  | 'armL' | 'armR' // épaule, bras dirigé vers -y
  | 'handL' | 'handR' // poignet
  | 'legL' | 'legR' // hanche, jambe dirigée vers -y
  | 'footL' | 'footR'; // cheville (le sol est en y = -footH)

export interface Placement {
  anchor: Anchor;
  object: THREE.Object3D;
}

/** Rôles de matériaux disponibles pour une pièce. */
export type MatRole =
  | 'primary' // couleur principale de la pièce
  | 'secondary' // seconde couleur (si twoTone)
  | 'primaryShade' // principale assombrie (coutures, bords côtes)
  | 'secondaryShade'
  | 'skin'
  | 'hair'
  | 'white'
  | 'black'
  | 'sole'
  | 'darkSole'
  | 'metal'
  | 'lens'
  | 'mouth'
  | 'shine'; // reflets des yeux (non éclairés)

export interface BuildContext {
  m: Metrics;
  cfg: CharacterConfig;
  head: HeadFrame;
  mat(role: MatRole): THREE.Material;
  /** Crée un mesh (ombres et options communes réglées). */
  mesh(geo: THREE.BufferGeometry, role: MatRole): THREE.Mesh;
}

export interface PartDef {
  id: string;
  label: string;
  icon?: string;
  /** La pièce utilise-t-elle une seconde couleur ? */
  twoTone?: boolean;
  label2?: string;
  /** Poids pour le tirage aléatoire (0 = jamais). */
  weight?: (cfg: CharacterConfig) => number;
  build(ctx: BuildContext): Placement[];
}

export const NONE_PART: PartDef = {
  id: 'none',
  label: 'Aucun',
  icon: '∅',
  build: () => [],
};
