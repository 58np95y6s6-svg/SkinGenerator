# Skin Generator

Générateur de personnages 3D stylisés (style figurine), pensé pour le téléphone et utilisable sur ordinateur.

- **Vite + TypeScript + Three.js** pour la 3D, **Preact** pour l'interface.
- Personnage modulaire : corps, visage, cheveux, barbe, haut, bas, chaussures et accessoires sont des pièces séparées et recolorables.
- Rotation au doigt, zoom par pincement (molette sur ordinateur), rotation automatique au repos, respiration et clignement des yeux.
- Bouton **Aléatoire** avec verrouillage par catégorie (🔒).

## Lancer en local

```bash
npm install
npm run dev        # http://localhost:5173 (+ adresse réseau pour le téléphone)
npm run build      # version de production dans dist/
```

## Ajouter une pièce

1. Créer un fichier dans `src/character/parts/<catégorie>/` qui exporte un `PartDef` (voir `types.ts`).
2. L'ajouter à la liste correspondante dans `src/character/parts/registry.ts`.

L'interface et le générateur aléatoire la prennent en compte automatiquement.

## Structure

```
src/
  character/   schéma, palettes, proportions (morph), corps, visage, pièces (parts/)
  scene/       rendu Three.js, lumières, contrôles tactiles
  random/      génération aléatoire et prénoms
  storage/     sauvegarde locale
  ui/          interface (onglets, panneaux, contrôles)
```
