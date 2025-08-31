import esbuild from 'esbuild';
import { nodeExternalsPlugin } from 'esbuild-node-externals';

esbuild.build({
  entryPoints: ['src/index.ts'],
  outfile: 'dist-src/index.js', 
  bundle: true,
  platform: 'node',
  target: 'node22',
  format: 'esm',
  sourcemap: true,
  minify: false,
  plugins: [nodeExternalsPlugin()],
}).catch(() => process.exit(1));
