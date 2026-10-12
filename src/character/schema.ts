// Description complète d'un personnage. C'est ce qui est enregistré, exporté et importé.

export type Sex = 'female' | 'male' | 'neutral';
export type Build = 'slim' | 'average' | 'strong';

/** Un élément interchangeable : un style (id de pièce) + ses couleurs. */
export interface Styled {
  style: string;
  color: string;
  color2: string;
}

export interface CharacterConfig {
  version: 1;
  firstName: string;
  lastName: string;
  sex: Sex;
  age: number;
  skin: string;
  eyes: string;
  build: Build;
  /** Facteur de taille, de 0.9 (petit) à 1.1 (grand). */
  height: number;
  hair: { style: string; color: string };
  /** La barbe/moustache prend la couleur des cheveux. */
  facialHair: { style: string };
  top: Styled;
  bottom: Styled;
  shoes: Styled;
  glasses: Styled;
  headwear: Styled;
  jewelry: Styled;
  bag: Styled;
}

export const DEFAULT_CONFIG: CharacterConfig = {
  version: 1,
  firstName: 'Lina',
  lastName: 'Martin',
  sex: 'female',
  age: 25,
  skin: '#c98a63',
  eyes: '#3b2412',
  build: 'average',
  height: 1,
  hair: { style: 'wavy', color: '#3b2417' },
  facialHair: { style: 'none' },
  top: { style: 'tshirt', color: '#f5f5f2', color2: '#f5f5f2' },
  bottom: { style: 'jeans', color: '#9cc1e3', color2: '#9cc1e3' },
  shoes: { style: 'sneakers', color: '#f5f5f2', color2: '#f5f5f2' },
  glasses: { style: 'none', color: '#1e1f23', color2: '#1e1f23' },
  headwear: { style: 'none', color: '#e04343', color2: '#f5f5f2' },
  jewelry: { style: 'none', color: '#e8c15a', color2: '#e8c15a' },
  bag: { style: 'none', color: '#7a5236', color2: '#7a5236' },
};

export type AgeGroup = 'child' | 'teen' | 'adult' | 'senior';

export function ageGroup(age: number): AgeGroup {
  if (age < 13) return 'child';
  if (age < 20) return 'teen';
  if (age < 60) return 'adult';
  return 'senior';
}

export const AGE_GROUP_LABEL: Record<AgeGroup, string> = {
  child: 'Enfant',
  teen: 'Ado',
  adult: 'Adulte',
  senior: 'Senior',
};
