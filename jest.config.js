module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',

  moduleNameMapper: {
    "src/(.*)": "<rootDir>/src/$1"
  },
  testPathIgnorePatterns : [
    "<rootDir>/src/index.ts", 
  ],
  collectCoverage: true,
  collectCoverageFrom: [
    '<rootDir>/src/*',
    '<rootDir>/src/**/*',
    '!<rootDir>/src/index.{js,ts}',
    '!<rootDir>/src/**/constants.{js,ts}',
  ],
  cacheDirectory: '.jest-cache',
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 80,
      lines: 80,
      statements: 75,
    },
  },
};