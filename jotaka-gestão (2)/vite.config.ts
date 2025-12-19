
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // Importante para que caminhos funcionem no GitHub Pages
  build: {
    outDir: 'dist',
  }
});
