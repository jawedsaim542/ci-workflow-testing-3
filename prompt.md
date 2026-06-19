# Instructions for Setting Up a React CI/CD Test Project

Please set up a new React-based web application with a standard GitHub Actions CI configuration. Do **NOT** add any AI Build Assistant or retry workflows yet; we will add those later to simulate a real user integration.

## Requirements

1. **React Application Setup:**
   * Create a simple React application (e.g., Vite + React) in a clean directory.
   * Add a test file (e.g., using Vitest or Jest) with one passing test and one failing test so that the CI pipeline will intentionally fail when run.
   * The project must have a standard `package.json` with `build` and `test` scripts.

2. **Standard Vanilla CI Workflow File:**
   * Create a standard GitHub Actions workflow file: `.github/workflows/ci.yml`.
   * The workflow must trigger on:
     * `push` and `pull_request` targeting the `main` branch.
   * It should perform the standard steps a React project uses in CI:
     1. Checkout code.
     2. Set up Node.js.
     3. Install npm packages (`npm ci` or `npm install`).
     4. Build the application (`npm run build`).
     5. Run the test suite (`npm test`).
   * **Important:** Do NOT include any log piping (`tee`), third-party AI assistants, permissions configurations, or retry workflows. We want a completely clean, vanilla setup representing a standard project *before* our assistant is added.

## Target Directory Structure

The repository structure should look like this:
```text
react-app/
├── .github/
│   └── workflows/
│       └── ci.yml          <-- Standard/vanilla React CI workflow
├── src/
│   ├── App.jsx
│   ├── App.test.jsx        <-- Intentionally failing test file
│   ├── main.jsx
│   └── ...
├── package.json
└── vite.config.js
```

Please output the exact files, folder paths, and file contents so I can copy-paste and set this up.
