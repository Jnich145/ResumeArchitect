# Validation checkpoint — 2026-09-26

The local workspace was installed and exercised in an isolated Ubuntu 24.04 environment using Node 24.21.0, npm 11.19.0, and the committed lockfile. All resume fixtures were synthetic; no account, model call, provider key, database, payment service, or real resume was used.

| Check                           | Result                                                                         |
| ------------------------------- | ------------------------------------------------------------------------------ |
| Clean `npm ci --ignore-scripts` | Passed                                                                         |
| `npm run format:check`          | Passed; archived prototype excluded                                            |
| `npm test`                      | 16 document/storage tests passed                                               |
| `npm run build`                 | Strict TypeScript check and Vite production build passed                       |
| `npm run test:e2e`              | 14 Chromium browser checks passed: seven workflows at desktop and 390px widths |
| `npm audit --omit=dev`          | Zero reported advisories in the default runtime dependency graph               |
| `npm audit`                     | Zero reported advisories in the complete default dependency graph              |

A redacted Gitleaks scan reported zero findings in the staged diff and, separately, the existing Git history. No history was rewritten. `actionlint` passed for the new CI workflow. These are bounded detector results, not proof that all sensitive information is absent.

The browser suite runs the production build. It checks actual edits and rendered text; explicit saving and reload persistence; download/import/clear; canceled deletion; stale-tab overwrite confirmation; blocked and corrupt storage; invalid, oversized and HTML-bearing imports; a delayed import racing newer edits; mobile overflow; zero external requests during the ordinary workflow; and print-only output. A long synthetic resume generated a multipage PDF with a Unicode font mapping for selectable text. Print tests check document structure and generation, not every printer or PDF viewer.

The desktop and mobile screenshots in `docs/images/` show the actual fictional starter profile. To capture new images, run `CAPTURE_SCREENSHOTS=1 npm run test:e2e` after building; images are written under the ignored `test-results/` tree for inspection. No private screenshots or browser state belong in Git.

The CI workflow reproduces formatting, unit tests, type checking, build and browser checks on Ubuntu 24.04. It also checks the runtime dependency graph. This document records local execution; a hosted CI run is separate evidence after publication. Linux browser tests need the standard Chromium OS libraries; `npx playwright install --with-deps chromium` installs them where administrator access is available.

## Remaining limits

- The archived `prototype/` dependency graph separately reported **16 advisories (5 moderate, 8 high, 3 critical)** at this checkpoint. It retains unresolved authentication, billing and build problems. Those sources are not remediated by excluding them from the new build. Its deployment script is disabled and old Netlify configuration is reference-only.
- There is one saved draft per browser origin/profile. A stale tab warns and asks before overwriting a changed saved copy; it does not merge changes or provide transactional multi-user storage. There is no encrypted storage, cloud backup, undo history, or collaborative editing.
- Chromium desktop and a narrow viewport were tested. Safari, Firefox, assistive technology sessions, real mobile devices, print hardware and arbitrary imported content still need broader evaluation.
- Export is ResumeArchitect’s own versioned JSON. JSON Resume, Word, PDF import and archived prototype migration are not implemented.
- Dependency scans are dated registry evidence, not a proof of security. No production deployment, external security assessment, customer-demand validation, ATS evaluation, or hiring-outcome measurement is claimed.

The original assets and source remain attributed as inherited material. No new license was selected.
