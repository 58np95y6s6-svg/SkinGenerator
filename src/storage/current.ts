// Mémorise le personnage en cours d'édition entre deux visites.

import { CATALOG, findPart } from '../character/parts/registry';
import { DEFAULT_CONFIG, type CharacterConfig } from '../character/schema';

const KEY = 'skingen.current';

/** Complète / corrige une configuration (anciennes versions, pièces supprimées…). */
export function normalizeConfig(raw: unknown): CharacterConfig {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Partial<CharacterConfig>;
  const c = { ...structuredClone(DEFAULT_CONFIG), ...r } as CharacterConfig;
  for (const k of ['top', 'bottom', 'shoes', 'glasses', 'headwear', 'jewelry', 'bag'] as const) {
    c[k] = { ...DEFAULT_CONFIG[k], ...(r[k] ?? {}) };
    c[k].style = findPart(CATALOG[k], c[k].style).id;
  }
  c.hair = { ...DEFAULT_CONFIG.hair, ...(r.hair ?? {}) };
  c.hair.style = findPart(CATALOG.hair, c.hair.style).id;
  c.facialHair = { style: findPart(CATALOG.facialHair, r.facialHair?.style ?? 'none').id };
  c.age = Math.min(90, Math.max(4, Math.round(Number(c.age) || 25)));
  c.height = Math.min(1.1, Math.max(0.9, Number(c.height) || 1));
  c.version = 1;
  return c;
}

export function loadCurrent(): CharacterConfig {
  try {
    const s = localStorage.getItem(KEY);
    if (s) return normalizeConfig(JSON.parse(s));
  } catch {
    /* stockage indisponible : on repart du défaut */
  }
  return structuredClone(DEFAULT_CONFIG);
}

export function saveCurrent(c: CharacterConfig) {
  try {
    localStorage.setItem(KEY, JSON.stringify(c));
  } catch {
    /* ignore */
  }
}
