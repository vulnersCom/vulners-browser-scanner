import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import prettier from 'eslint-config-prettier/flat';
import globals from 'globals';

/**
 * Flat ESLint config (ESLint 9 + typescript-eslint v8).
 *
 * The whole codebase is TypeScript: typescript-eslint recommended rules apply
 * to all sources, with react-hooks rules for the popup. `no-undef` is off
 * because the TypeScript compiler already reports undefined identifiers.
 * `eslint-config-prettier/flat` is LAST so Prettier owns all formatting.
 */
export default tseslint.config(
  { ignores: ['build/', 'dist/', 'node_modules/', 'coverage/'] },

  js.configs.recommended,

  {
    files: ['**/*.{ts,tsx}'],
    extends: [...tseslint.configs.recommended],
    plugins: { 'react-hooks': reactHooks },
    languageOptions: {
      globals: { ...globals.browser, ...globals.webextensions, ...globals.node, ...globals.jest },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'no-undef': 'off',
    },
  },

  prettier
);
