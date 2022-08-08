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
  ],
  cacheDirectory: '.jest-cache',
};