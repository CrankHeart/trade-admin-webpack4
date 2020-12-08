module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es6: true
  },
  extends: [],
  parserOptions: {
    parser: '@typescript-eslint/parser',
    sourceType: 'module',
    "ecmaVersion": 6,
    "extraFileExtensions": [ ".vue" ],
    ecmaFeatures: {
      jsx: true,
      vue: true
    },
  },
  "parser": "vue-eslint-parser",
  "plugins": [
    "@typescript-eslint"
  ],
  rules: {
    "@typescript-eslint/indent": [ "error", 2 ],
    "@typescript-eslint/member-delimiter-style": [
      "off",
      {
        "multiline": {
          "delimiter": "none",
          "requireLast": true
        },
        "singleline": {
          "delimiter": "semi",
          "requireLast": false
        }
      }
    ],
    "@typescript-eslint/prefer-namespace-keyword": "off",
    "@typescript-eslint/quotes": [
      "off",
      "single"
    ],
    "@typescript-eslint/semi": [
      "off",
      null
    ],
    "@typescript-eslint/type-annotation-spacing": "off",
    "brace-style": [
      "error",
      "1tbs"
    ],
    "eqeqeq": [
      "off",
      "smart"
    ],
    "id-match": "error",
    "no-eval": "error",
    "no-redeclare": "error",
    "no-trailing-spaces": "off",
    "no-underscore-dangle": "error",
    "no-var": "error",
    "spaced-comment": [
      "error",
      "always",
      {
        "markers": [
          "/"
        ]
      }
    ],
    "no-underscore-dangle": 0
  }
}