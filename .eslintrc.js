module.exports = {
  env: {
    browser: false,
    es2021: true,
    node: true,
    jest: true,
  },
  extends: ["eslint:recommended"],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  rules: {
    // Variables
    "no-unused-vars": [
      "warn",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
      },
    ],
    "no-undef": "error",

    // Async/Await
    "require-await": "off", // Allow async functions without await
    "no-return-await": "warn", // Warn về redundant await

    // Best Practices
    "no-console": "off", // Allow console.log (for server logs)
    "no-debugger": "warn",
    "no-unused-expressions": "warn",

    // Code Style
    semi: ["warn", "always"], // Require semicolons
    quotes: ["warn", "double", { avoidEscape: true }],
    indent: ["warn", 2, { SwitchCase: 1 }],
    "comma-dangle": ["warn", "only-multiline"],

    // ES6
    "prefer-const": "warn",
    "no-var": "warn",
    "arrow-body-style": "off",
    "prefer-arrow-callback": "off",

    // Error Prevention
    "no-prototype-builtins": "warn",
    "no-unreachable": "error",
    "no-fallthrough": "warn",
  },
  globals: {
    // Define global variables to prevent 'no-undef' errors
    process: "readonly",
    __dirname: "readonly",
    __filename: "readonly",
    module: "readonly",
    require: "readonly",
    exports: "writable",
    console: "readonly",
    Buffer: "readonly",
    setImmediate: "readonly",
    clearImmediate: "readonly",
  },
  ignorePatterns: [
    "node_modules/",
    "dist/",
    "build/",
    "coverage/",
    "*.min.js",
    "swagger/swagger-output.json",
    ".vercel/",
    ".railway/",
  ],
};
