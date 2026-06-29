import type { Config } from 'jest';

const config: Config = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.test.json' }],
  },
  collectCoverageFrom: ['src/api.ts', 'src/Browser.ts', 'src/sanitize.ts'],
  coverageThreshold: {
    global: { statements: 75, branches: 55, functions: 70, lines: 75 },
  },
};

export default config;
