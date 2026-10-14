# Helpdesk Ticket Manager

A helpdesk ticket management application built with standalone Angular components and Tailwind CSS.

The application includes navigation for tickets, login, and administration.

## Prerequisites

- Node.js **22.22.3 or newer within Node 22**, **24.15.0 or newer within Node 24**, or **26.x**. These are the supported Node versions for this Angular 22 workspace; see [Angular's compatibility guide](https://angular.dev/reference/versions).
- npm, included with Node.js.
- A modern browser.

The Angular CLI is a local development dependency; a global installation is unnecessary.

## Install

From the repository root:

```bash
npm ci
```

Keep `package-lock.json` in Git so fresh installs use the same dependency versions.

## Run the application

```bash
npm start
```

Open [http://localhost:4200](http://localhost:4200). The development server watches source files and reloads the page when they change. Stop it with `Ctrl+C`.

The equivalent Angular CLI command is:

```bash
npx ng serve
```

## Routes

| URL | Page |
| --- | --- |
| `/` | Redirects to `/tickets` |
| `/tickets` | Ticket list |
| `/tickets/:id` | Ticket details |
| `/login` | Login |
| `/admin` | Administration |

These routes display placeholder pages. Select **Open ticket** on the Tickets page to open `/tickets/1`. The administration area loads when `/admin` is opened.

## Build

```bash
npm run build
```

This runs `ng build`, whose default configuration is production. Browser build files are written to `dist/helpdesk-ticket-manager/browser/`.

## Styling

Tailwind CSS 4 is configured using the [official Angular/PostCSS setup](https://angular.dev/guide/tailwind):

- `.postcssrc.json` registers `@tailwindcss/postcss`.
- `src/styles.css` imports `tailwindcss`.
- Application templates use Tailwind utility classes; the root component has no custom stylesheet.

No separate Tailwind build command is needed: `ng serve` and `ng build` compile the utilities.
