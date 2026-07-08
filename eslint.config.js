module.exports = [
  {
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "commonjs",
      globals: {
        browser: true,
        node: true,
        CONFIG: "readonly",
        GeminiClient: "readonly",
        Simulation: "readonly",
        CrowdManager: "readonly",
        Navigation: "readonly",
        Assistant: "readonly",
        DecisionSupport: "readonly",
        App: "readonly",
        QUnit: "readonly",
        window: "readonly",
        document: "readonly",
        fetch: "readonly",
        navigator: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        requestAnimationFrame: "readonly",
        cancelAnimationFrame: "readonly",
        performance: "readonly",
        console: "readonly",
        Event: "readonly"
      }
    },
    rules: {
      "indent": ["error", 2, { "SwitchCase": 1 }],
      "quotes": ["error", "single", { "avoidEscape": true, "allowTemplateLiterals": true }],
      "semi": ["error", "always"],
      "no-unused-vars": ["warn", { 
        "vars": "local",
        "varsIgnorePattern": "^(CONFIG|GeminiClient|Simulation|CrowdManager|Navigation|Assistant|DecisionSupport)$"
      }],
      "no-undef": "error"
    }
  }
];
