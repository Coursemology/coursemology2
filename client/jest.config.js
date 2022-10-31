/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'jsdom',
  transformIgnorePatterns: [
    '/node_modules/(?!intl-messageformat|intl-messageformat-parser).+\\.js$',
  ],
  moduleDirectories: ['node_modules', 'app'],
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
  setupFiles: [
    '<rootDir>/app/__test__/requestAnimationFrame.js',
    'jest-localstorage-mock',
  ],
  setupFilesAfterEnv: ['<rootDir>/app/__test__/setup.js'],
  snapshotSerializers: ['<rootDir>/node_modules/enzyme-to-json/serializer'],
  moduleNameMapper: {
    '.scss$': '<rootDir>/SassStub.js',
    '^api(.*)$': '<rootDir>/app/api$1',
    '^lib(.*)$': '<rootDir>/app/lib$1',
    '^theme(.*)$': '<rootDir>/app/theme$1',
    '^testUtils(.*)$': '<rootDir>/app/__test__/utils$1',
    '^bundles(.*)$': '<rootDir>/app/bundles$1',
    '^course(.*)$': '<rootDir>/app/bundles/course$1',
  },
  coveragePathIgnorePatterns: ['/node_modules/', '/__test__/'],
};

module.exports = config;
