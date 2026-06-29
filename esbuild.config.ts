import * as esbuild from 'esbuild';
import { sassPlugin } from 'esbuild-sass-plugin';
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';

/**
 * Single esbuild pipeline replacing CRA (`react-scripts`) + the standalone
 * webpack watch. Bundles the React popup (with SCSS + SVG) and copies the
 * static Manifest v3 artifacts so `build/` loads as an unpacked extension.
 *
 * Run: `node esbuild.config.ts [--watch] [--dev]` (Node 22.6+ strips the types).
 *   (default)  production: minified, no sourcemap
 *   --dev      debug: unminified + inline sourcemap (one-shot)
 *   --watch    debug + rebuild on change
 */
const OUTDIR = 'build';
const watch = process.argv.includes('--watch');
const dev = watch || process.argv.includes('--dev');

/** package.json is the single source of truth for the version. */
const pkg = JSON.parse(readFileSync('package.json', 'utf8')) as { version: string };

function readDevApiKey(): string {
  if (!dev) return '';

  try {
    const env = readFileSync('.env', 'utf8');
    const match = env.match(
      /^(?:VULNERS_API_KEY|VITE_VULNERS_API_KEY|REACT_APP_VULNERS_API_KEY|API_KEY)=(.*)$/m
    );
    return match?.[1]?.trim().replace(/^['"]|['"]$/g, '') ?? '';
  } catch {
    return '';
  }
}

function copyStatic(): void {
  mkdirSync(OUTDIR, { recursive: true });
  cpSync('public/index.html', `${OUTDIR}/index.html`);
  cpSync('public/img', `${OUTDIR}/img`, { recursive: true });

  // Stamp the package.json version into the shipped manifest so there is one
  // version to bump (`npm version ...`); public/manifest.json's version is a
  // placeholder that the build overwrites.
  const manifest = JSON.parse(readFileSync('public/manifest.json', 'utf8')) as Record<
    string,
    unknown
  >;
  manifest.version = pkg.version;
  writeFileSync(`${OUTDIR}/manifest.json`, JSON.stringify(manifest, null, 2) + '\n');
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
    'process.env.NODE_ENV': JSON.stringify(dev ? 'development' : 'production'),
    __DEV_API_KEY__: JSON.stringify(readDevApiKey()),
  },
  sourcemap: dev ? 'inline' : false,
  minify: !dev,
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
  console.log(`[esbuild] ${dev ? 'debug' : 'release'} build complete -> ${OUTDIR}/`);
}
