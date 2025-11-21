

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
  
  'no-console': ['warn', { allow: ['warn', 'error'] }],
  'no-': 'error',
  'no-alert': 'warn',

  
  '@typescript-eslint/no-unused-vars': 'warn',  
  '@typescript-eslint/explicit-module-boundary-types': 'off',
  '@typescript-eslint/no-explicit-any': 'off',  
  '@typescript-eslint/no-non-null-assertion': 'off',
  '@typescript-eslint/ban-ts-comment': 'off',

  
  'react/react-in-jsx-scope': 'off',
  'react/prop-types': 'off',
  'react/display-name': 'off',
  'react-hooks/rules-of-hooks': 'error',
  'react-hooks/exhaustive-deps': 'off',
  'react-hooks/refs': 'off',  
  'react-hooks/set-state-in-effect': 'off',  
  'react-hooks/immutability': 'off',  

  // ✅ React Native (TODO: desactivar temporalmente los problemáticos)
  'react-native/no-unused-styles': 'off',      
  'react-native/no-inline-styles': 'off',      
  'react-native/no-color-literals': 'off',

  
  'prefer-const': 'warn',
  'no-var': 'error',
  'eqeqeq': 'off',  
  'curly': 'off',   
  'no-unused-expressions': 'off',
  'no-useless-concat': 'off',
  'no-useless-return': 'off',

  
  'quotes': ['warn', 'single', { 'avoidEscape': true, 'allowTemplateLiterals': true }],
},
};
