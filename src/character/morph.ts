// Calcule les proportions du corps à partir de l'âge, du sexe et de la morphologie.
// Toutes les valeurs sont en "mètres stylisés" ; le personnage a les pieds en y = 0
// et regarde vers +z.

import type { Build, CharacterConfig, Sex } from './schema';

export interface Metrics {
  age: number;
  sex: Sex;
  build: Build;
  /** Hauteur totale (avant le facteur de taille). */
  stature: number;
  headR: number;
  /** Échelle de la tête (légèrement ovale). */
  headScale: [number, number, number];
  neckR: number;
  neckLen: number;
  torsoH: number;
  shoulderW: number;
  waistW: number;
  hipW: number;
  chestW: number;
  /** Rapport profondeur / largeur du torse. */
  depth: number;
  armR: number;
  armLen: number;
  handR: number;
  armSpread: number;
  shoulderX: number;
  /** Hauteur de l'articulation de l'épaule, relative aux hanches. */
  shoulderJY: number;
  legR: number;
  legLen: number;
  legGap: number;
  footLen: number;
  footH: number;
  hipY: number;
  /** Centre de la tête, relatif aux hanches. */
  headY: number;
  /** Haut des épaules, relatif au centre de la tête (négatif). */
  shoulderRel: number;
  stoop: number;
  /** 0 = enfant, 1 = adulte : intensité des différences liées au sexe. */
  maturity: number;
}

type Keys = [number, number][];

function byAge(age: number, keys: Keys): number {
  if (age <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [a1, v1] = keys[i];
    if (age <= a1) {
      const [a0, v0] = keys[i - 1];
      const t = (age - a0) / (a1 - a0);
      return v0 + (v1 - v0) * t;
    }
  }
  return keys[keys.length - 1][1];
}

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

const BUILD_W: Record<Build, number> = { slim: 0.86, average: 1, strong: 1.2 };
const BUILD_LIMB: Record<Build, number> = { slim: 0.85, average: 1, strong: 1.22 };

export function computeMetrics(cfg: Pick<CharacterConfig, 'age' | 'sex' | 'build'>): Metrics {
  const { age, sex, build } = cfg;
  const maturity = clamp((age - 10) / 8, 0, 1);
  const sexK = sex === 'male' ? 1 : sex === 'female' ? -1 : 0;
  const sm = sexK * maturity; // -1 (femme) .. +1 (homme)

  const stature =
    byAge(age, [[3, 0.92], [8, 1.16], [12, 1.38], [16, 1.6], [22, 1.72], [60, 1.72], [90, 1.65]]) *
    (1 + 0.03 * sm);
  const headR = byAge(age, [[3, 0.19], [12, 0.205], [18, 0.218]]);
  const headScale: [number, number, number] = [1, 1.05 + 0.02 * maturity, 0.97];
  const neckR = headR * mix(0.36, 0.4 + 0.04 * Math.max(sm, 0), maturity) * (build === 'strong' ? 1.12 : 1);
  const neckLen = stature * mix(0.018, 0.03, maturity);
  const footH = 0.035 + 0.025 * maturity;
  const legLen = stature * byAge(age, [[3, 0.3], [12, 0.38], [18, 0.41]]);
  const hipY = footH + legLen;
  const torsoH = stature - headR * 2 * headScale[1] - neckLen - hipY;

  const bw = BUILD_W[build];
  const shoulderW =
    byAge(age, [[3, 0.125], [12, 0.17], [18, 0.205]]) * (1 + 0.1 * sm) * mix(1, bw, 0.8);
  const hipW = byAge(age, [[3, 0.12], [12, 0.15], [18, 0.165]]) * (1 - 0.07 * sm) * bw;
  let waistW = hipW * (sm < 0 ? mix(0.95, 0.84, -sm) : mix(0.95, 0.93, sm));
  if (build === 'strong') waistW = hipW * 1.08;
  if (build === 'slim') waistW *= 0.97;
  const chestW = Math.max(waistW * 1.03, shoulderW * 0.86);
  const depth = build === 'strong' ? 0.72 : 0.64;

  const lk = BUILD_LIMB[build];
  const armR = shoulderW * 0.28 * lk * (1 + 0.06 * sm);
  const armLen = stature * byAge(age, [[3, 0.28], [18, 0.33]]);
  const handR = armR * 1.05;
  const legR = hipW * 0.44 * lk;
  const legGap = hipW * 0.52;
  const footLen = legR * 2.9;

  const shoulderX = shoulderW - armR * 0.55;
  const shoulderJY = torsoH - armR * 1.05;
  const armSpread = 0.2 + (build === 'strong' ? 0.07 : 0) + (sm < 0 ? 0.02 : 0);

  const headY = torsoH + neckLen + headR * headScale[1];
  const shoulderRel = -(neckLen + headR * headScale[1]);
  const stoop = age > 65 ? Math.min(0.1, (age - 65) * 0.004) : 0;

  return {
    age, sex, build, stature, headR, headScale, neckR, neckLen, torsoH,
    shoulderW, waistW, hipW, chestW, depth, armR, armLen, handR, armSpread,
    shoulderX, shoulderJY, legR, legLen, legGap, footLen, footH, hipY, headY,
    shoulderRel, stoop, maturity,
  };
}

/** Taille affichée en cm (indicative). */
export function heightCm(cfg: CharacterConfig): number {
  const m = computeMetrics(cfg);
  return Math.round(m.stature * cfg.height * 100);
}
