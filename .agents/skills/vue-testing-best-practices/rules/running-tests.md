# Running Frontend Tests with Vitest

## Target Narrow Scopes

Never run the full test suite when verifying a specific component or change.

- **Run a single test file**:
  ```bash
  npx vitest run resources/js/components/SurahCard.test.js
  ```

- **Run tests matching a specific description**:
  ```bash
  npx vitest run -t "renders ayah arabic text"
  ```

- **Run with NPM script**:
  ```bash
  npm run test:frontend -- resources/js/lib/utils.test.js
  ```
