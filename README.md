# Test Automation Framework — Playwright + TypeScript

[![Zenith HR UI Tests](https://github.com/Avishekkj/playwright-automation-framework/actions/workflows/zenith-ci.yml/badge.svg)](https://github.com/Avishekkj/playwright-automation-framework/actions/workflows/zenith-ci.yml)

A production-style **API + UI** test automation framework built with **Playwright**
and **TypeScript**, demonstrating the patterns and tooling expected of a senior QA /
SDET role: layered design, the Page Object Model, contract testing, data-driven
tests, custom fixtures, multi-environment support, cross-browser CI sharding, and
rich **Allure** reporting with history/trends.

- **Live Allure report:** https://avishekkj.github.io/playwright-automation-framework/
  *(published from CI on every push)*

---

## Highlights

| Area | What's demonstrated |
|---|---|
| **API testing** | Service-client layer, **Zod** schema/contract validation, auth (static token + dynamic JWT), positive + negative + data-driven, API mocking |
| **UI testing** | **Page Object Model** + a **Page Manager**, full E2E CRUD (create → search → promote → delete), upload/download, form widgets |
| **Architecture** | Layered (clients / schemas / fixtures / utils / config); tests never touch raw HTTP or raw selectors |
| **Custom fixtures** | Auto-provisioned + auto-cleaned test data; unauthenticated client; setup/teardown via the `use()` doorway |
| **Multi-environment** | `TEST_ENV=dev\|staging\|prod` selects the base URL; shown in the report's Environment widget |
| **Cross-browser** | Chromium, Firefox, WebKit (Safari engine) |
| **CI/CD** | GitHub Actions **matrix: browser × shard** (12 parallel jobs); results merged into one report |
| **Reporting** | Playwright HTML, JUnit, and **Allure** with **history/trends**, feature/severity grouping, and step trees — published to **GitHub Pages** + artifact |
| **Quality practices** | Secrets via env/CI (never committed), retries for flaky externals, `strict`-mode TypeScript, web-first assertions |

## Tech stack

`Playwright` · `TypeScript` · `Zod` (schema validation) · `Faker` (test data) ·
`Allure` (reporting) · `csv-parse` · `GitHub Actions` (CI + Pages)

## Project structure

```
src/                     # API framework layers
  clients/               #   service clients (UsersApi, PostsApi, BaseApiClient)
  schemas/               #   Zod schemas (contract validation) + derived types
  fixtures/              #   custom fixtures (testUser, anonUsers, authed clients)
  utils/                 #   data factory (faker), custom assertions
  config/                #   env / secrets loading
tests/
  users/ posts/ auth/    # core API suites (CRUD, negative, schema, JWT login)
  api/                   # API learning ladder (levels 1–10)
  zenith-hr/             # UI suite (POM) — the "Zenith HR" corporate app
    pages/               #   page objects + PageManager
    global-setup.ts      #   writes Allure environment.properties
  web/                   # browser/context concepts (devices, geo, SSL, offline)
  ui/                    # storageState auth-reuse demo
playwright.config.ts             # API config
playwright.zenith.config.ts      # UI local (multi-env, allure, 3 browsers)
playwright.zenith.ci.config.ts   # UI CI (blob→allure, retries, 1 worker)
.github/workflows/zenith-ci.yml  # cross-browser sharded CI + Allure→Pages
```

## Getting started

```bash
npm ci
npx playwright install            # browsers
cp .env.example .env              # add a GoRest token for the API suite
```

## Running tests

```bash
# API suite
npx playwright test

# UI suite (Zenith HR) — pick an env + a browser
TEST_ENV=staging npx playwright test --config playwright.zenith.config.ts --project=chromium

# a single browser, headed (watch it)
npx playwright test --config playwright.zenith.config.ts --project=firefox --headed

# by tag
npx playwright test --config playwright.zenith.config.ts --grep "@smoke"

# browser/context concepts
npx playwright test --config playwright.web.config.ts
```

## Reports

```bash
# Playwright HTML
npx playwright show-report

# Allure (feature/severity grouping, step trees, Environment widget)
npx allure generate allure-results --clean -o allure-report
npx allure open allure-report
```

In CI, Allure is generated with **history/trends** and published to the live link
above on every push, plus uploaded as a downloadable artifact.

## CI pipeline

On push, `zenith-ci.yml` runs the UI suite as a **browser × shard** matrix
(3 browsers × 4 shards = 12 parallel jobs), merges the Allure results, generates
the report with accumulated history, and publishes it to GitHub Pages. Manual runs
(`workflow_dispatch`) let you choose the target environment.

---

*Authored by Avishek Kumar Jha.*
