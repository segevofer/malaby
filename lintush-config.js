const commitScopes = require("./commitlint.config").rules["scope-enum"][2];

module.exports = {
  body: {
    mandatory: false,
    question:
      "Explain the problem that this commit is solving. Focus on why you are making this change as opposed to how (the code explains that). Are there any side effects or other unintuitive consequences of this change?",
  },
  bugNumber: {
    mandatory: false,
    question: "Enter the bug id or click enter",
  },
  scope: {
    choices: commitScopes,
    mandatory: false,
    question: "What is the scope of the commit?",
  },
  screenshot: {
    mandatory: false,
    question:
      "If you have a screenshot of the fix, paste the URL here or click enter",
  },
  subject: {
    mandatory: false,
    question:
      "Commit title - Summarize your changes in 50 characters or less (use imperative mood)",
  },
  type: {
    choices: {
      chore: "other changes that don't modify src or test files",
      docs: "changes to documentation",
      feat: "new feature",
      fix: "bug fix",
      refactor: "code change that neither fixes a bug nor adds a feature",
      revert: "reverts a previous commit",
      style: "formatting, missing semi colons, etc; no code change",
      test: "adding or refactoring tests; no production code change",
    },
    mandatory: true,
    question: "What it the type of the commit?",
  },
};
