// https://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module'
  },
  env: {
    browser: true,
  },
  extends: 'airbnb-base',
  // required to lint *.vue files
  plugins: [
    'html'
  ],
  // check if imports actually resolve
  settings: {
    'import/resolver': {
      webpack: {
        config: 'build/webpack.base.conf.js'
      }
    }
  },
  // add your custom rules here
  rules: {
    'max-len': 'off',
    'no-cond-assign': 'off',
    'no-empty': 'off',
    'no-lonely-if': 'off',
    'no-mixed-operators': 'off',
    'no-param-reassign': 'off',
    'no-plusplus': 'off',
    'no-restricted-syntax': 'off',
    'no-unused-vars': 'off',
    'no-useless-return': 'off',
    'object-shorthand': 'off',
    'one-var': 'off',
    'one-var-declaration-per-line': 'off',
    'prefer-const': 'off',
    'prefer-template': 'off',
    'quote-props': 'off',
    'semi-spacing': 'off',
    'space-infix-ops': 'off',
    'spaced-comment': 'off',
    'space-in-parens': 'off',


    'arrow-spacing': 'off',
    'quotes': 'off',
    'no-undef': 'off',
    'indent': 'off',
    'arrow-parens': 'off',
    'space-before-function-paren': 'off',
    'no-fallthrough': 'off',
    'default-case': 'off',
    'no-unneeded-ternary': 'off',


    // don't require .vue extension when importing
    'import/extensions': ['error', 'always', {
      js: 'never',
      vue: 'never'
    }],
    // disallow reassignment of function parameters
    // disallow parameter object manipulation except for specific exclusions
    // 'no-param-reassign': ['error', {
    //   props: true,
    //   ignorePropertyModificationsFor: [
    //     'state', // for vuex state
    //     'acc', // for reduce accumulators
    //     'e' // for e.returnvalue
    //   ]
    // }],
    // allow optionalDependencies
    'import/no-extraneous-dependencies': ['error', {
      optionalDependencies: ['test/unit/index.js']
    }],
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off'
  }
}
