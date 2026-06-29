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

# Production build -> ./build (loadable unpacked extension)
build:
    npm run build

# Alias: full build (esbuild already copies the static extension files)
package: build
