import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: '../dist-frontend',
    emptyOutDir: true,
  },
  plugins: [react(), tailwindcss()],
  server: { port: 3000 },
});
