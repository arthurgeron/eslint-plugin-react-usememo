module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    "src/(.*)": "<rootDir>/src/$1"
  },
  cacheDirectory: '.jest-cache',
};