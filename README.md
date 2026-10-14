# Helpdesk Ticket Manager

A helpdesk ticket management application built with standalone Angular components and Tailwind CSS.

The application includes navigation for tickets, login, and administration, plus demo authentication for a customer and an agent.

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

The login page is functional. Tickets, ticket details, and administration still display placeholder pages. Select **Open ticket** on the Tickets page to open `/tickets/1`. The administration area loads when `/admin` is opened.

## Demo authentication (Phase 2)

| Role | Email | Password |
| --- | --- | --- |
| Customer | `customer@helpdesk.test` | `customer123` |
| Agent | `agent@helpdesk.test` | `agent123` |

Open `/login`, enter these credentials, and select **Sign in**. The **Use customer account** and **Use agent account** buttons fill the form for you. Successful login opens `/tickets`; the header shows the current user's name and role.

The fake session is saved in browser `localStorage` under `helpdesk.session`, containing a demo token and user ID. Refreshing restores the user from the two demo accounts. Passwords are not saved in the session. **Logout** removes the stored session, clears the current user, and opens `/login`.

This is client-side demo authentication with public credentials and fake tokens. Route protection belongs to Phase 3; all existing routes remain accessible in this phase. Role-based ticket permissions, the fake API, translations, and automated test setup follow in later phases.

### Curriculum techniques

Phase 2 satisfies the assignment's login requirement using techniques checked against `Angular-Training-Curriculum-v3-4days.docx` before implementation:

- **Day 1:** standalone components, interpolation and bindings, `*ngIf` / `*ngFor`, root-provided services with `@Injectable` and `inject()`, Angular Router navigation, `ngOnInit` / `ngOnDestroy`, and the `core/` / `features/` structure.
- **Day 2:** typed `BehaviorSubject` / `Observable` shared state and subscription cleanup with `Subscription.unsubscribe()`.
- **Day 3:** template-driven forms (`FormsModule`, `NgForm`, `ngModel`, `ngSubmit`), built-in required/email validation, touched/submitted form state, fake login, token storage, and user roles.

### Manual verification

1. Open `/login` and submit an empty form; validation messages should appear. Enter a demo email with an incorrect password; a credential error should appear without signing in.
2. Sign in as the customer. Confirm `/tickets` opens and the header displays the customer role. Refresh and confirm the same user remains signed in.
3. Select **Logout**. Confirm `/login` opens, the user disappears from the header, and `helpdesk.session` is removed from browser storage. Refresh and confirm the user remains signed out.
4. Repeat login, refresh, and logout with the agent account.

No fake API process is needed for Phase 2. Unit and Playwright test commands will be documented when their setup is added in the planned testing phases.

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
