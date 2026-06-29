# Justfile — task runner.
# Requires: just (https://github.com/casey/just) and npm.
# Run `just` with no arguments to list recipes.
#
# Build pipeline is a single esbuild step (esbuild.config.ts), which emits
# the popup bundle AND copies the static MV3 extension files into ./build.

# List available recipes
default:
    @just --list

# Install dependencies
install:
    npm install

# esbuild watch build (rebuilds ./build on change)
watch:
    npm run watch

# Typecheck (tsc --noEmit)
typecheck:
    npm run typecheck

# Lint (flat ESLint config)
lint:
    npm run lint

# Format with Prettier
format:
    npm run format

# Run tests
test:
    npm test

# Production (minified) build -> ./build (loadable unpacked extension)
build:
    npm run build

# Debug build: unminified + inline sourcemaps -> ./build
debug:
    npm run build:debug

# Alias for the debug build
dev: debug

# Production build, then zip ./build into a Chrome Web Store-ready archive
# in dist/ named <package>-v<manifest version>.zip (manifest.json at the root).
release: build
    #!/usr/bin/env bash
    set -euo pipefail
    name="$(node -p "require('./package.json').name")"
    version="$(node -p "require('./build/manifest.json').version")"
    mkdir -p dist
    archive="dist/${name}-v${version}.zip"
    rm -f "${archive}"
    (cd build && zip -qr "../${archive}" ./*)
    echo "✅ Chrome Web Store package -> ${archive}"

# Alias: full build (esbuild already copies the static extension files)
package: build
