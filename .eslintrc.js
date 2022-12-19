module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    'plugin:vue/essential',
    '@vue/standard'
  ],
  parserOptions: {
    parser: '@babel/eslint-parser'
  },
  rules: {
    // "vue/no-unused-vars": "off",
    // 'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'vue/multi-word-component-names': 'off',
    // TODO: fix it
    'vue/no-mutating-props': 'off',
    'import/no-duplicates': 'off',
    'vue/valid-v-slot': 'off',
    'vue/no-v-model-argument': 'off'
  }
}
