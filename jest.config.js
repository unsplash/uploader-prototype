module.exports = {
  preset: 'ts-jest',
  testMatch: ['**/__tests__/**/*-test.(js|ts)'],
  // Ignore the TS project `outDir`
  testPathIgnorePatterns: ['<rootDir>/target/'],
};
