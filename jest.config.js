/* eslint-disable @typescript-eslint/no-require-imports */

const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/lib/(.*)$': '<rootDir>/lib/$1',
    '^@/src/lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@/adapters/(.*)$': '<rootDir>/src/adapters/$1',
    '^@/ports/(.*)$': '<rootDir>/src/ports/$1',
    '^@/usecases/(.*)$': '<rootDir>/src/usecases/$1',
    '^@/domain/(.*)$': '<rootDir>/src/domain/$1',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testEnvironment: 'jsdom',
  testMatch: [
    '**/__tests__/**/*.(ts|tsx|js)',
    '**/*.(test|spec).(ts|tsx|js)',
  ],
  collectCoverageFrom: [
    'components/**/*.{ts,tsx}',
    'lib/**/*.{ts,tsx}',
    'app/**/*.{ts,tsx}',
    '!**/*.d.ts',
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(langchain|@langchain|p-retry|is-network-error)/)',
  ],
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)