import { defineConfig } from 'tsup';

export default defineConfig([
  // Main entry (web + core)
  {
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: true,
    external: ['react', 'react-dom'],
    outDir: 'dist',
  },
  // Native entry (React Native)
  {
    entry: ['src/native/index.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    splitting: false,
    sourcemap: true,
    external: ['react', 'react-native', 'react-native-webview'],
    outDir: 'dist/native',
  },
]);
