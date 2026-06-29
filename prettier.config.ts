import type { Config } from 'prettier';

/** Minimal Prettier config — defaults are good; match the existing code style. */
const config: Config = {
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  printWidth: 100,
  trailingComma: 'es5',
};

export default config;
