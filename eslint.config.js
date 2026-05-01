// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  {
    rules: {
      // React Hooks - ensure dependencies are correct
      'react-hooks/exhaustive-deps': 'warn',

      // No duplicate imports
      'no-duplicate-imports': 'error',

      // No var
      'no-var': 'error',

      // Max depth - warn for deeply nested code
      'max-depth': ['warn', 5],

      // Max lines per function - increased limit for existing code
      'max-lines-per-function': ['warn', {
        max: 150,
        skipBlankLines: true,
        skipComments: true,
      }],
    },
  },
]);
