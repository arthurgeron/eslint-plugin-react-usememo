const path = require('node:path');

module.exports = {
  "env": {
    "browser": true,
    "es2021": true,
    "node": true
  },
  "extends": [
    "eslint:recommended",
    // "plugin:react/recommended"
  ],
  "parserOptions": {
    "ecmaFeatures": {
      "jsx": true
    },
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "plugins": [
    // "react",
    // "react-hooks",
    "@arthurgeron/react-usememo"
  ],
  "rules": {
    // "react/react-in-jsx-scope": "off",
    // "react-hooks/rules-of-hooks": "error",
    // "react-hooks/exhaustive-deps": "warn",
    
    // require-usememo rule with custom options
    "@arthurgeron/react-usememo/require-usememo": ["error", {
      strict: true,
      checkHookReturnObject: true,
      fix: { addImports: true },
      checkHookCalls: true,
      ignoredHookCallsNames: { "useStateManagement": true },
      ignoredPropNames: ["style", "className"]
    }],
    
    // require-memo rule with custom options
    "@arthurgeron/react-usememo/require-memo": ["error", {
      ignoredComponents: {
        "Header": true,
        "Footer": true,
        "SimpleText": true
      }
    }],
    
    // require-usememo-children rule with custom options
    "@arthurgeron/react-usememo/require-usememo-children": ["error", {
      strict: true
    }]
  },
  "settings": {
    "react": {
      "version": "detect"
    }
  }
} 