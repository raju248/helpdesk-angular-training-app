# Helpdesk Ticket Manager

A helpdesk ticket management application built with standalone Angular components and Tailwind CSS.


## Prerequisites

- Node.js **22.22.3 or newer within Node 22**, **24.15.0 or newer within Node 24**, or **26.x**.
- npm, included with Node.js.
- A modern browser.

The Angular CLI is a local development dependency; a global installation is unnecessary.

## Install

From the repository root:

```bash
npm ci
```

## Run the application

Start the fake API in one terminal:

```bash
npm run api
```

The fake API runs at [http://127.0.0.1:3000](http://127.0.0.1:3000).

In a separate terminal, start the Angular application:

```bash
npm start
```

Open [http://localhost:4200](http://localhost:4200). The development server watches source files and reloads the page when they change. Stop it with `Ctrl+C`.

## Testing

Install the Playwright browser once, then run the tests:

```bash
npx playwright install chromium
npm run test:e2e
```

To watch the browser, run `npm run test:e2e:headed`.

Run a single test file in terminal:

```bash
npm run test:e2e:headed -- e2e/create-ticket.spec.ts
```

Add `--project=chromium-en` for English only. Other test files are `e2e/comment.spec.ts` and `e2e/agent-status.spec.ts`.

For an optional delay between browser actions in termainal (milliseconds):

```bash
$env:PW_SLOW_MO = "1000"
npm run test:e2e:headed
```

Set `PW_SLOW_MO` to `0` to remove the delay. Tests start Angular automatically and use mocked API data.
