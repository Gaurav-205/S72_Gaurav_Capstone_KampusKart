import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    assetsInlineLimit: 0,
    copyPublicDir: true,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules/@mui/')) return 'vendor-mui';
          if (id.includes('node_modules/@react-google-maps/') || id.includes('node_modules/@googlemaps/')) return 'vendor-maps';
          if (id.includes('node_modules/three/') || id.includes('node_modules/@react-three/')) return 'vendor-three';
          if (id.includes('node_modules/@emoji-mart/data/')) return 'vendor-emoji-data';
          if (id.includes('node_modules/@emoji-mart/react/') || id.includes('node_modules/emoji-mart/')) return 'vendor-emoji-ui';
          if (id.includes('node_modules/socket.io-client/')) return 'vendor-socket';
        },
        assetFileNames: (assetInfo) => {
          // Keep images at root level, not in assets folder
          if (assetInfo.name && /\.(png|jpe?g|svg|gif|ico)$/i.test(assetInfo.name)) {
            return '[name][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
  },
  publicDir: 'public',
  server: {
    host: 'localhost',
    port: 3000,
    strictPort: true,
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 3000,
      clientPort: 3000,
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
    include: ['src/tests/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/components/**', 'src/utils/**'],
      exclude: ['src/components/ui/**'],
    },
  },
});