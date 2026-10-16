import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      // The install files (pwa/) go to the site's root. public/ is not copied: it holds the old audit bundles.
      {
        name: 'mythios-install-files',
        generateBundle() {
          for (const file of fs.readdirSync(path.resolve(__dirname, 'pwa'))) {
            this.emitFile({ type: 'asset', fileName: file, source: fs.readFileSync(path.resolve(__dirname, 'pwa', file)) });
          }
        },
      },
    ],
    build: {
      // public/ holds only the old audit bundles (the whole secret): never ship them with the game.
      copyPublicDir: false,
      // SINGLE_FILE=1 builds one script (for the one-file playable demo).
      ...(process.env.SINGLE_FILE === '1' ? { rolldownOptions: { output: { codeSplitting: false } } } : {}),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
