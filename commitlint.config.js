/**
 *  Edit this code to fit your lint demands:
 */
const scopeEnum = [
  "child-process",
  "cli",
  "config",
  "logger",
  "malaby",
  "node",
  "npm",
  "test-runner",
  "typescript",
  "utils",
];

module.exports = {
  rules: {
    "body-max-line-length": [2, "always", 72],
    "body-leading-blank": [2, "always"],
    "footer-leading-blank": [2, "always"],
    "scope-enum": [2, "always", scopeEnum],
    "type-enum": [
      2,
      "always",
      ["chore", "docs", "feat", "fix", "refactor", "revert", "style", "test"],
    ],
  },
};
