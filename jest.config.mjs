/** @type {import('ts-jest').JestConfigWithTsJest} */
const preset = "ts-jest";
const testEnvironment = "node";
const verbose = true;
const testMatch = ["**/__tests__/**/*.spec.ts"];

export default { preset, testEnvironment, verbose, testMatch };
