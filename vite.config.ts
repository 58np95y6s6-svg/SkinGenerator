import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

// base relatif : l'app fonctionne aussi bien sur GitHub Pages (sous-dossier) qu'en local.
export default defineConfig({
  base: './',
  plugins: [preact()],
  server: { host: true },
});
