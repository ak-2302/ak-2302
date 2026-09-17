import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    rollupOptions: {
      input: {
        home: resolve('index.html'),
        tools: resolve('tool/index.html'),
        notes: resolve('note/index.html'),
        bottomToTop: resolve('idea/design_bottom_to_top/index.html'),
        fuwafuwa: resolve('idea/design_fuwafuwa/index.html'),
        neko: resolve('idea/design_neko/index.html'),
        terminal: resolve('idea/design_terminal/index.html'),
        videoCompressor: resolve('tool/video_compressor/index.html'),
      },
    },
  },
});
