/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/app", "<rootDir>/lib"],
  testMatch: ["**/*.test.ts"],
  clearMocks: true,
};
