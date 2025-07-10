module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  moduleNameMapper: {
    '\\.(css|less|scss)$': 'identity-obj-proxy',
    '^@site/(.*)$': '<rootDir>/$1',
    '^@theme/(.*)$':
      '<rootDir>/node_modules/@docusaurus/theme-classic/src/theme/$1',
    '^@docusaurus/(.*)$':
      '<rootDir>/node_modules/@docusaurus/core/lib/client/exports/$1',
  },
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
}
