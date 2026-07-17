# Playwright API Automation Framework

Enterprise-grade API test automation in **TypeScript + Playwright**, targeting the
[GoRest](https://gorest.co.in) REST API (real auth, persistence, relationships,
validation, pagination, rate limiting) with a **DummyJSON** JWT-login demo.

## Why this is "enterprise-grade"

| Concern | How it's solved |
|---|---|
| **Layered design** | Tests never call `request` directly — they go through typed service clients (`UsersApi`, `PostsApi`). |
| **Config & secrets** | Base URL + token from env / `.env` (gitignored). CI uses GitHub secrets. |
| **Auth** | Token injected once in `playwright.config.ts`; an unauthenticated fixture tests 401s. |
| **Type safety** | Zod schemas are the single source of truth; TS types are derived via `z.infer`. |
| **Contract testing** | Responses validated against schemas, not just field values. |
| **Data-driven** | Invalid payloads live in a data file; one test generated per row. |
| **Fixtures** | `testUser` auto-creates + deletes data — no orphaned records. |
| **Full lifecycle** | Create → Read → Update → Delete → confirm 404, chaining IDs. |
| **Negative + edge** | 401, 404, 422 (incl. duplicate email), invalid enums. |
| **Tags** | `@smoke`, `@regression`, `@negative` for selective runs. |
| **Reporting** | List + HTML + JUnit (CI-ingestable). Traces retained on failure. |
| **CI** | GitHub Actions: typecheck → test → upload report. |

## Structure

```
src/
  config/env.ts          env + secret loading
  clients/               service layer (BaseApiClient, UsersApi, PostsApi)
  schemas/               Zod contracts + derived types
  data/                  data-driven test cases
  utils/                 data factory (faker), custom assertions
  fixtures/apiFixtures   custom Playwright fixtures (clients, testUser, anon)
tests/
  users/                 smoke, crud, negative
  posts/                 end-to-end journey across resources
  auth/                  dynamic JWT login (DummyJSON)
```

## Setup

```bash
npm install
cp .env.example .env        # then paste your GoRest token into .env
```

Get a free token: https://gorest.co.in/consumer/login → Access Tokens.

## Run

```bash
npm test                 # everything
npm run test:smoke       # @smoke only
npm run test:negative    # @negative only
npm run typecheck        # TS type check, no emit
npm run report           # open the HTML report
```

## Design notes

- **Unique test data** — every generated user has a timestamped email so parallel
  runs never collide on GoRest's unique-email constraint.
- **Rate limits** — GoRest caps requests per window; suites are lean and clean up
  after themselves to stay well under the cap.
- **Two auth models** — GoRest (static bearer token) and DummyJSON (dynamic
  login → JWT → protected call) are both demonstrated.
