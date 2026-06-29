# Justfile — task runner.
# Requires: just (https://github.com/casey/just) and yarn/npm.
# Run `just` with no arguments to list recipes.
#
# Build pipeline is now a single esbuild step (esbuild.config.ts), which emits
# the popup bundle AND copies the static MV3 extension files into ./build.
# The old CRA/webpack split and the postbuild copy step are gone.

# List available recipes
default:
    @just --list

# Install dependencies
install:
    yarn install

# esbuild watch build (rebuilds ./build on change)
watch:
    yarn watch

# Typecheck (tsc --noEmit)
typecheck:
    yarn typecheck

# Lint (flat ESLint config)
lint:
    yarn lint

# Format with Prettier
format:
    yarn format

# Run tests
test:
    yarn test

# Production build -> ./build (loadable unpacked extension)
build:
    yarn build

# Alias: full build (esbuild already copies the static extension files)
package: build
