/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { useESM: true }],
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  roots: ['<rootDir>/tests'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/index.ts',
    '!src/lib/providers/melipayamak.provider.ts',
    '!src/lib/providers/ippanel.provider.ts',
    '!src/lib/providers/raygansms.provider.ts',
    '!src/lib/providers/parsgreen.provider.ts',
    '!src/lib/providers/payamresan.provider.ts',
  ],
};

module.exports = config;
