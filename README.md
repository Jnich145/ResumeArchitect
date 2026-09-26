# ResumeArchitect

A conversational resume-builder prototype by [Justin Nichols](https://github.com/Jnich145). It explores guided information collection, live template previews, and AI-assisted editing in one workspace.

**Status:** development prototype. The repository includes application code and tests, but this page does not establish a working production deployment, validated ATS outcomes, or production-ready authentication and billing.

## What is here

- React/TypeScript interface with a conversational builder, multiple resume templates, and PDF export code.
- Express API with MongoDB models for users, resumes, and subscriptions.
- OpenAI-assisted editing, ATS analysis, analytics, and Stripe integration code, with development fallbacks in some paths.
- Jest/component tests and Cypress workflow tests.

Start with [the conversational builder](src/components/ConversationalBuilder.tsx), [server entry point](src/server/index.ts), or [package scripts](package.json).

## Local development

The commands below follow the repository scripts. They have not been revalidated as a complete running application during this documentation refresh.

```bash
git clone https://github.com/Jnich145/ResumeArchitect.git
cd ResumeArchitect
npm ci
```

Create a local `.env` in the repository root. Supply your own development values; keep them out of Git:

```dotenv
NODE_ENV=development
PORT=3001
CLIENT_URL=http://localhost:5173
VITE_API_URL=http://localhost:3001/api
MONGODB_URI=mongodb://127.0.0.1:27017/resumeArchitect
JWT_SECRET=replace-with-a-local-secret
ACCESS_TOKEN_SECRET=replace-with-a-local-secret
REFRESH_TOKEN_SECRET=replace-with-another-local-secret
```

For live AI editing, add `OPENAI_API_KEY`. For Stripe test integration, the service reads `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_BASIC_PRICE_ID`, and `STRIPE_PREMIUM_PRICE_ID`. Use your own test configuration; no API credentials are included here.

```bash
npm run dev:all
```

The intended frontend URL is `http://localhost:5173`; the API defaults to `http://localhost:3001`. The frontend and backend can also be started separately with `npm run dev` and `npm run dev:server`.

## Current limitations

- Development mode bypasses authentication in [the auth middleware](src/server/middleware/auth.ts). Keep this mode confined to local development with synthetic resume data.
- Token creation and verification currently use different settings and cookie names in [the controller](src/server/controllers/authController.ts) and middleware. Authentication needs reconciliation before deployment; setting environment variables alone does not resolve that mismatch.
- Missing AI or Stripe keys can select mock behavior. A missing MongoDB URI only skips the connection in [the database module](src/server/db.ts); it is not a substitute for a working persistent database across all routes.
- ATS scores and AI suggestions are application outputs, not a guarantee of employer screening results. PDF rendering also needs checking against the chosen template and content.
- Deployment scripts exist, but a successful build, service integration, security review, and a verified deployment are separate milestones.

## Existing checks

```bash
npm test
npm run build
npm run build:server
npm run lint
# Requires the application and Cypress environment:
npm run test:e2e
```

These are available check commands, not a claim that the current revision passes them. When reporting a result, include the revision, command, and relevant environment.

No license file is included in this checkout; this documentation refresh does not assign a license.
