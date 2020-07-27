module.exports = {
  root: true,
  env: {
    node: true,
  },
  plugins: [
    'vuetify',
  ],
  extends: [
    'vuetify',
    '@vue/typescript/recommended',
  ],
  parserOptions: {
    ecmaVersion: 2020,
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-unused-expressions': 'off',
    '@typescript-eslint/no-unused-expressions': 'error',
    'vuetify/grid-unknown-attributes': 'error',
    'vuetify/no-legacy-grid': 'error',
    semi: ['error', 'always'],
    'vue/component-name-in-template-casing': ['error', 'kebab-case', {
      registeredComponentsOnly: false,
      ignores: [],
    }],
    '@typescript-eslint/no-non-null-assertion': 'off',
  },
  overrides: [
    {
      files: '*.vue',
      rules: {
        'class-methods-use-this': 'off',
      },
    },
  ],
};
