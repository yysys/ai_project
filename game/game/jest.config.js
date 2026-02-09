module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'utils/**/*.js',
    '!utils/**/*.test.js'
  ],
  testMatch: [
    '**/tests/**/*.test.js'
  ],
  verbose: true
};
