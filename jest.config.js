module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  transform: {
    "^.+\\.(t|j)sx?$": [
      "ts-jest",
      {
        diagnostics: false,
        tsconfig: { allowJs: true },
      },
    ],
  },
  transformIgnorePatterns: ["node_modules/(?!(uuid)/)"],
  moduleNameMapper: {
    "src/(.*)": "<rootDir>/src/$1",
  },
  testPathIgnorePatterns: [
    "<rootDir>/src/index.ts",
    "<rootDir>/__tests__/(.*)/ruleTester.ts",
    "<rootDir>/__tests__/testcases/(.*)",
  ],
  collectCoverage: true,
  collectCoverageFrom: [
    "<rootDir>/src/*",
    "<rootDir>/src/**/*",
    "!<rootDir>/src/index.{js,ts}",
    "!<rootDir>/src/**/constants.{js,ts}",
    "!<rootDir>/src/**/flat-config.{js,ts}",
    "!<rootDir>/src/**/traditional-config.{js,ts}",
  ],
  cacheDirectory: ".jest-cache",
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 80,
      lines: 80,
      statements: 75,
    },
  },
};