import importPlugin from "eslint-plugin-import";

export default [
  {
    files: ["src/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        AbortController: "readonly",
        Buffer: "readonly",
        clearInterval: "readonly",
        clearTimeout: "readonly",
        console: "readonly",
        fetch: "readonly",
        process: "readonly",
        setInterval: "readonly",
        setTimeout: "readonly"
      }
    },
    plugins: {
      import: importPlugin
    },
    rules: {
      "import/no-unresolved": "error"
    }
  }
];
