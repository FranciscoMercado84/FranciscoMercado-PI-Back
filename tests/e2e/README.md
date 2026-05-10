E2E tests using Playwright

Run these tests against a running instance of the backend (default http://localhost:3001).

Commands:

```bash
# install dependencies (Playwright required)
npm install
# install playwright browsers (if running locally)
npx playwright install --with-deps

# run E2E (dot reporter + junit output to e2e-results/playwright-junit.xml)
npx playwright test

# produce JUnit explicitly
npx playwright test --reporter=junit:e2e-results/playwright-junit.xml
```

Environment variables:

- `TEST_BASE_URL` or `PLAYWRIGHT_TEST_BASE_URL` (optional) – base URL for the API under test.
