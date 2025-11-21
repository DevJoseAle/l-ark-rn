module.exports = {
  root: true,
  extends: [
    'expo',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['@typescript-eslint', 'react', 'react-hooks', 'react-native'],
  rules: {
    // ========================================
    // CONSOLES Y DEBUGGING
    // ========================================
    'no-console': 'off', // ← Desactivado completamente
    'no-debugger': 'warn',
    'no-alert': 'warn',

    // ========================================
    // TYPESCRIPT
    // ========================================
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/no-require-imports': 'off',
    '@typescript-eslint/no-empty-object-type': 'off',

    // ========================================
    // REACT
    // ========================================
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react/display-name': 'off',
    'react/no-unescaped-entities': 'off',
    'react-hooks/purity': 'off',

    // ========================================
    // REACT HOOKS (desactivar los problemáticos)
    // ========================================
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'off',
    'react-hooks/refs': 'off',
    'react-hooks/set-state-in-effect': 'off',
    'react-hooks/immutability': 'off',

    // ========================================
    // REACT NATIVE
    // ========================================
    'react-native/no-unused-styles': 'off',
    'react-native/no-inline-styles': 'off',
    'react-native/no-color-literals': 'off',

    // ========================================
    // MEJORES PRÁCTICAS
    // ========================================
    'prefer-const': 'warn',
    'no-var': 'error',
    eqeqeq: 'off',
    curly: 'off',
    'no-unused-expressions': 'off',
    'no-useless-concat': 'off',
    'no-useless-return': 'off',

    // ========================================
    // ESTILO (quotes)
    // ========================================
    quotes: [
      'warn',
      'single',
      {
        avoidEscape: true,
        allowTemplateLiterals: true,
      },
    ],
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  env: {
    'react-native/react-native': true,
    es2021: true,
    node: true,
  },
};
