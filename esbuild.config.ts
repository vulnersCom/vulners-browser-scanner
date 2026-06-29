import * as esbuild from 'esbuild';
import { sassPlugin } from 'esbuild-sass-plugin';
import { cpSync, mkdirSync, rmSync } from 'node:fs';

/**
 * Single esbuild pipeline replacing CRA (`react-scripts`) + the standalone
 * webpack watch. Bundles the React popup (with SCSS + SVG) and copies the
 * static Manifest v3 artifacts so `build/` loads as an unpacked extension.
 *
 * Run: `node esbuild.config.ts [--watch]` (Node 22.6+ strips the types).
 */
const OUTDIR = 'build';
const watch = process.argv.includes('--watch');

/** Static extension files copied verbatim. The worker and content script are
 *  now bundled from TypeScript (see entryPoints below). */
const STATIC_FILES = ['index.html', 'manifest.json'];

function copyStatic(): void {
  mkdirSync(OUTDIR, { recursive: true });
  for (const file of STATIC_FILES) {
    cpSync(`public/${file}`, `${OUTDIR}/${file}`);
  }
  cpSync('public/img', `${OUTDIR}/img`, { recursive: true });
}

const buildOptions: esbuild.BuildOptions = {
  entryPoints: {
    // key = output path under OUTDIR (without extension)
    'static/js/main': 'src/index.tsx',
    background: 'src/background.ts',
    content: 'src/content.ts',
  },
  bundle: true,
  outdir: OUTDIR,
  format: 'iife',
  target: ['chrome120'],
  jsx: 'automatic',
  loader: {
    // Source uses JSX inside .js files (CRA convention).
    '.js': 'jsx',
    '.svg': 'dataurl',
    '.png': 'dataurl',
    '.jpg': 'dataurl',
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(watch ? 'development' : 'production'),
  },
  sourcemap: watch ? 'inline' : false,
  minify: !watch,
  plugins: [sassPlugin({ type: 'css' })],
  logLevel: 'info',
};

rmSync(OUTDIR, { recursive: true, force: true });
copyStatic();

if (watch) {
  const ctx = await esbuild.context(buildOptions);
  await ctx.watch();
  console.log('[esbuild] watching for changes…');
} else {
  await esbuild.build(buildOptions);
  console.log(`[esbuild] build complete -> ${OUTDIR}/`);
}
