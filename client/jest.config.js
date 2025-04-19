/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'jsdom',
  transformIgnorePatterns: [
    '/node_modules/(?!intl-messageformat|intl-messageformat-parser).+\\.js$',
  ],
  moduleDirectories: ['node_modules', 'app'],
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
  setupFiles: ['jest-localstorage-mock'],
  setupFilesAfterEnv: ['<rootDir>/app/__test__/setup.js'],
  snapshotSerializers: ['<rootDir>/node_modules/enzyme-to-json/serializer'],
  moduleNameMapper: {
    '\\.(css|scss)$': '<rootDir>/app/__test__/mocks/fileMock.js',
    '^assets(.*)$': '<rootDir>/app/__test__/mocks/svgMock.js',
    '.svg$': '<rootDir>/app/__test__/mocks/svgMock.js',
    '^mocks(.*)$': '<rootDir>/app/__test__/mocks$1',
    '^test-utils(.*)$': '<rootDir>/app/utilities/test-utils$1',
    '^react(.*)$': '<rootDir>/node_modules/react$1',
    '^api(.*)$': '<rootDir>/app/api$1',
    '^lib(.*)$': '<rootDir>/app/lib$1',
    '^theme(.*)$': '<rootDir>/app/theme$1',
    '^testUtils(.*)$': '<rootDir>/app/__test__/utils$1',
    '^bundles(.*)$': '<rootDir>/app/bundles$1',
    '^course(.*)$': '<rootDir>/app/bundles/course$1',
    '^store(.*)$': '<rootDir>/app/store$1',
    '^lodash-es(.*)$': 'lodash$1',
  },
  coveragePathIgnorePatterns: ['/node_modules/', '/__test__/'],
};

module.exports = config;
