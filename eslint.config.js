const globals = require("globals");

module.exports = [
  // Global ignores (applies to all configs)
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "build/**",
      "coverage/**",
      "*.min.js",
      "swagger/swagger-output.json",
      "swagger/swagger-output.local.json",
      "swagger/swagger-output-vercel.json",
      ".vercel/**",
      ".railway/**",
      ".git/**",
      "logs/**",
      "src/logs/**",
      "__tests__/__mocks__/**",
      "tmp/**",
      "temp/**",
      "*.tmp",
    ],
  },

  // Main configuration for all JS files
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node,
        ...globals.es2021,
        ...globals.jest,
      },
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
  },
];
