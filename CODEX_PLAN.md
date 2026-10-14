# Helpdesk Ticket Manager — Codex Development Plan


# Source of Truth — Original Assignment Requirements

This plan is an incremental implementation plan for the original **Angular Training Curriculum — Helpdesk Ticket Manager** assignment.

The requirements below are the **source of truth**. The phase plan must not accidentally remove, weaken, or replace them. If there is ever a conflict between a later Codex interpretation and these requirements, preserve these original requirements unless the user explicitly changes them.

## Original app description

Build a small helpdesk where customers raise support tickets and agents work on them.

A ticket has:

- title
- description
- priority: low, medium, high
- status: open, in progress, resolved, closed
- category
- assignee
- links
- comments

## Original requirements

1. **Login page with two demo users**
   - one customer
   - one agent
   - a token is stored after login

2. **Ticket list**
   - filters for status and priority
   - filters kept in the URL as query parameters
   - debounced search

3. **Ticket detail page**
   - shows the ticket and its comments
   - ticket and comments are loaded together

4. **Create and edit ticket**
   - reactive form
   - required title
   - one custom validator
   - list of links using `FormArray`

5. **Add a comment**
   - use a template-driven form

6. **Authorization**
   - only agents can change ticket status
   - only agents can change assignee
   - customers see only their own tickets

7. **Admin area**
   - lazy-loaded
   - protected by a guard
   - used to manage categories

8. **HTTP interceptors**
   - auth interceptor
   - global error interceptor
   - user-friendly error messages

9. **Page states**
   - loading state on every page where relevant
   - empty state on every page where relevant
   - error state on every page where relevant

10. **Internationalization**
    - whole UI in two languages
    - include a language switcher

11. **Shared Angular features**
    - at least one shared presentational component
    - one custom pipe
    - one custom directive

12. **Modern Angular**
    - rewrite one page with signals
    - use the new control flow

13. **Prevent duplicate submission**
    - no double submit on the ticket form

14. **Optional state library**
    - ticket state may be moved to NgRx or a signal-based store
    - if used, explain the choice
    - this project plan intentionally skips this optional requirement unless explicitly requested

15. **Testing**
    - three Playwright tests
    - two unit tests

## Original project rules

- Use standalone components only.
- Use `json-server` or a similar fake API. No real backend is required.
- Type every API call.
- Clean up every subscription.
- Hard-code no user-facing text in the finished application.
- Commit in small steps with clear messages so the mentor can follow how the app grew.
- It is acceptable to leave something unfinished if it is documented with what is missing and why.

## Original deliverables

- Source code in a Git repository, or a zip containing the `.git` folder.
- `README.md` explaining:
  - installation
  - how to run the Angular app
  - how to run the fake API
  - how to run tests
  - demo logins
- `NOTES.md` explaining:
  - decisions made
  - what would be done differently
  - unfinished work
- A mentor demo.

## Mentor review expectations

The finished project should make it easy to answer:

- Does it run from the README without extra help?
- Is the folder structure clear (`core`, `shared`, `features`)?
- Are components small, with a clear smart/presentational split?
- Are API calls typed?
- Are errors handled?
- Are subscriptions cleaned up?
- Are forms validated with errors shown at the correct time?
- Are roles enforced in routes and UI where appropriate?
- Do tests cover the main workflow?
- Can the developer explain why each pattern was chosen?

## How this plan relates to the original requirements

The numbered phases below are only the **implementation order**.

They do not replace the original assignment scope.

Whenever Codex starts a phase, it must:
1. read this Source of Truth section,
2. identify which original requirement(s) the phase contributes to,
3. avoid implementing later requirements prematurely,
4. ensure completed work remains compatible with the final original assignment.


## Purpose

This project is the Helpdesk Ticket Manager assignment from the Angular training curriculum.

The goal is **not** to build the whole application at once.

The repository must grow in small, understandable steps so the Git history clearly shows how the application evolved across the training topics.

Codex must implement **one phase at a time**, verify it, report what changed, suggest a commit message, and then stop.

## Core Rules for Codex

1. Before every phase, re-read the **Source of Truth — Original Assignment Requirements** section above. The phase plan is an implementation sequence, not a replacement for the original assignment.
2. Do not build the full application in one pass.
3. Inspect the current repository before changing code.
4. Implement only the current phase.
5. Do not implement future requirements early unless required for the current phase to compile or run.
6. Preserve working behavior unless the current phase explicitly requires a refactor.
7. Use standalone Angular components only.
8. Use **Tailwind CSS** for application styling. Do not use plain component CSS for normal UI styling unless a small exception is genuinely necessary.
9. Use a feature-based structure with `core/`, `shared/`, and `features/`.
10. Do not create empty folders far ahead of need.
11. Type all models, API requests, and API responses.
12. Clean up every manual RxJS subscription.
13. Keep components reasonably small.
14. Prefer smart/container components for data loading and presentational components for UI-only responsibilities.
15. Do not introduce NgRx unless explicitly requested later.
16. Do not add SSR, SSG, hydration, or unrelated extension topics.
17. Keep `README.md` up to date throughout development. If a phase changes setup steps, scripts, routes, demo credentials, test commands, runtime requirements, or other information a new developer would need, update `README.md` in that same phase.
18. Do not automatically commit or push unless explicitly asked.
19. At the end of every phase:
    - run relevant build/tests,
    - list changed files,
    - explain manual verification,
    - mention whether `README.md` needed an update and what changed if it did,
    - identify which original requirement(s) this phase satisfies or advances,
    - suggest exactly one Git commit message,
    - stop.
20. Never continue into the next phase until explicitly told to do so.

## Project Domain

The application is a small helpdesk system where customers create support tickets and agents work on them.

### User roles

```ts
type UserRole = 'customer' | 'agent';
```

### Ticket priority

```ts
type TicketPriority = 'low' | 'medium' | 'high';
```

### Ticket status

```ts
type TicketStatus = 'open' | 'in-progress' | 'resolved' | 'closed';
```

### Main entities

```ts
interface User {
  id: number;
  name: string;
  email: string;
  password: string; // demo-only fake authentication
  role: UserRole;
}

interface Ticket {
  id: number;
  title: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  categoryId: number;
  customerId: number;
  assigneeId: number | null;
  links: string[];
  createdAt: string;
  updatedAt: string;
}

interface Comment {
  id: number;
  ticketId: number;
  authorId: number;
  body: string;
  createdAt: string;
}

interface Category {
  id: number;
  name: string;
}
```

Use IDs for relationships instead of duplicating display names in ticket records.

# README Maintenance Rule

`README.md` is a living project document and should evolve with the application.

At the end of **every phase**, Codex must decide whether the phase changed anything a developer needs to know. If yes, update `README.md` in the same phase and include that change in the same commit.

Examples that should trigger a README update:

- new install/setup requirements
- new npm scripts
- Tailwind setup changes
- json-server setup or commands
- environment configuration
- demo login credentials
- important routes
- how to run unit tests
- how to run Playwright
- production build commands
- any prerequisite needed to run the current state of the project

Do not postpone all README work until the final phase.

# Development Phases

## Phase 0 — Bootstrap the Angular App

### Implement
- Create standalone Angular application.
- Enable routing.
- Use **Tailwind CSS** for styling.
- Configure Tailwind as part of the initial bootstrap.
- App name: `helpdesk-ticket-manager`.
- Establish only the minimum top-level folders:
  - `core/`
  - `shared/`
  - `features/`

### Do not implement yet
- ticket features
- authentication
- services
- guards
- models
- json-server
- forms
- translations
- interceptors
- tests

### Acceptance
- `ng serve` works.
- `ng build` works.
- Tailwind utility classes compile and render correctly.
- Initial app renders.
- `README.md` contains the initial install/run instructions.

### Commit
`chore: bootstrap helpdesk Angular application`

---

## Phase 1 — Application Shell and Routes

### Implement
- Application shell.
- Navigation.
- Placeholder pages:
  - `/login`
  - `/tickets`
  - `/tickets/:id`
- Lazy-loaded `/admin` area.
- Placeholder admin page.

### Acceptance
- All routes render.
- `/admin` is lazy-loaded.
- Navigation works.

### Commit
`feat: add helpdesk application shell and routes`

---

## Phase 2 — Demo Authentication

### Implement
- One demo customer.
- One demo agent.
- `AuthService`.
- Login page.
- Fake token/session storage.
- Logout.
- Current-user state.

### Acceptance
- Customer and agent can log in.
- Login persists across refresh.
- Logout clears session.

### Commit
`feat: add demo authentication and user roles`

---

## Phase 3 — Route Protection

### Implement
- Auth guard.
- Redirect unauthenticated users to `/login`.
- Protect `/admin`.
- Only agent can access admin routes.

### Acceptance
- Logged-out user cannot access protected pages.
- Customer cannot access admin.
- Agent can access admin.

### Commit
`feat: protect routes with authentication guard`

---

## Phase 4 — Shared Angular Features

### Implement
- `TicketStatusBadgeComponent`.
- `TimeAgoPipe`.
- One custom directive such as priority highlighting.
- Use them in simple temporary ticket UI.

### Acceptance
- Shared component works via input.
- Custom pipe works.
- Custom directive visibly affects UI.

### Commit
`feat: add shared ticket presentation utilities`

---

## Phase 5 — Fake API Foundation

### Implement
- Add `json-server`.
- Add `db.json`.
- Collections:
  - `tickets`
  - `users`
  - `comments`
  - `categories`
- Add npm script for fake API.
- Add environment API URL.
- Add typed models.
- Add `TicketService`.
- Use `HttpClient`.

### Acceptance
- Angular app and fake API run separately.
- Ticket GET request works.
- API response is typed.

### Commit
`feat: connect ticket data to json-server`

---

## Phase 6 — Ticket List and URL Filters

### Implement
- Ticket list page.
- Status filter.
- Priority filter.
- Store filters in URL query parameters.
- Use `HttpParams`.
- Read filters from `ActivatedRoute`.

### Acceptance
Example:
`/tickets?status=open&priority=high`

- Refresh preserves filters.
- Network request contains expected query params.

### Commit
`feat: add ticket list filtering with query parameters`

---

## Phase 7 — Debounced Ticket Search

### Implement
Use:
- `Subject`
- `debounceTime`
- `distinctUntilChanged`
- `switchMap`

### Acceptance
- Rapid typing does not send one request per keystroke.
- Previous stale request is abandoned.
- Latest search result wins.

### Commit
`feat: add debounced ticket search`

---

## Phase 8 — Ticket Detail and Comments Loading

### Implement
- Route `/tickets/:id`.
- Load ticket and comments together using `forkJoin`.
- Add loading state.
- Add error state.
- Clean up subscriptions.

### Acceptance
- Ticket and comments appear together.
- Loading is visible.
- Failure shows a user-friendly error.

### Commit
`feat: add ticket detail with combined data loading`

---

## Phase 9 — HTTP Interceptors

### Implement
- Auth interceptor:
  - attach token to HTTP requests.
- Global error interceptor:
  - user-friendly error handling.
  - redirect to login for 401 where appropriate.

### Acceptance
- Authenticated requests contain token.
- API failures are handled consistently.
- 401 behavior works.

### Commit
`feat: add authentication and error interceptors`

---

## Phase 10 — Reactive Create/Edit Ticket Form

### Implement
Use Reactive Forms:
- `FormGroup`
- `FormBuilder`
- `FormArray`
- built-in validators
- one custom validator

Fields:
- title
- description
- priority
- category
- links

Requirements:
- title required
- one custom validation rule
- links stored in `FormArray`
- create and edit modes
- typed POST/PATCH methods

### Important
Use a normal save flow first.

Do **not** add `exhaustMap` yet.

### Commit
`feat: add reactive ticket create and edit form`

---

## Phase 11 — Add Comments

### Implement
- Template-driven comment form.
- Use `ngModel`.
- POST through `TicketService`.
- Update comments after success.

### Acceptance
- Comment can be submitted.
- New comment appears.

### Commit
`feat: add ticket comment workflow`

---

## Phase 12 — Authorization Rules

### Rules

Agent:
- can change status
- can change assignee
- can access admin

Customer:
- cannot change status
- cannot change assignee
- sees only own tickets

### Acceptance
- Customer does not see agent-only controls.
- Customer ticket list is restricted.
- Agent controls work.

### Commit
`feat: enforce customer and agent permissions`

---

## Phase 13 — Smart and Presentational Components

### Implement
Split ticket list into:
- smart/container page
- presentational ticket table/list component

Smart component:
- loads data
- owns state
- handles navigation/business events

Presentational component:
- receives data through inputs
- emits actions through outputs
- does not call API directly

Also add:
- loading state
- empty state
- error state

### Commit
`refactor: separate ticket list container and presentation`

---

## Phase 14 — Internationalization Infrastructure

### Implement
- `@ngx-translate/core`.
- English translations.
- Bangla translations.
- Language switcher.
- Initial language selection.

### Important
Do not refactor every user-facing string in this phase.

### Commit
`feat: add internationalization infrastructure`

---

## Phase 15 — Translate the Entire UI

### Implement
- Move visible user-facing text to translation files.
- Support English and Bangla across the app.
- Leave technical/log/debug strings alone unless shown to users.

### Acceptance
- Both languages are usable.
- Normal UI labels are no longer hard-coded.

### Commit
`refactor: move helpdesk UI text to translations`

---

## Phase 16 — Playwright Setup and Create-Ticket Test

### Implement
- Playwright setup.
- Page object(s).
- Stable `data-testid` selectors.
- One E2E test:
  - create a ticket.

### Rules
- Avoid assertions on visible English text.
- Prefer test IDs or stable state.

### Commit
`test: cover ticket creation workflow`

---

## Phase 17 — Remaining Playwright Workflows

### Implement
Add:
- comment workflow test.
- agent status-change workflow test.

### Final E2E workflows
1. create ticket
2. add comment
3. change ticket status as agent

### Commit
`test: cover comment and agent status workflows`

---

## Phase 18 — Signals Refactor

### Goal
Demonstrate modern Angular without rewriting the whole app.

### Target
Prefer the ticket detail page.

### Refactor
Use:
- `signal()`
- `computed()` where useful
- `@if`
- `@for`
- `track`

### Important
Behavior must remain unchanged.

### Commit
`refactor: migrate ticket detail page to signals`

---

## Phase 19 — Prevent Double Submit

### Implement
Use:
- `Subject`
- `exhaustMap`
- `finalize`
- inner `catchError` where appropriate
- `saving` signal for UI state

### Acceptance
Rapid double-submit generates only one POST/PATCH request.

### Commit
`feat: prevent duplicate ticket form submissions`

---

## Phase 20 — Unit Tests

### Implement

#### `TimeAgoPipe`
Test transformation behavior directly.

#### `TicketService`
Use:
- `TestBed`
- `provideHttpClient`
- `provideHttpClientTesting`
- `HttpTestingController`

Verify:
- expected URL
- HTTP method
- request body where applicable
- fake response handling

### Acceptance
Tests pass without json-server running.

### Commit
`test: add pipe and ticket service unit tests`

---

## Phase 21 — Production Build and Documentation

### Implement

Run:
`ng build --configuration production`

Review and finalize the existing `README.md` so it accurately contains:
- prerequisites
- install instructions
- Tailwind setup notes if relevant
- how to run Angular app
- how to run json-server
- how to run unit tests
- how to run Playwright
- demo customer login
- demo agent login

Add `NOTES.md` with:
- technical decisions
- patterns used
- difficult parts
- what would be improved in production
- unfinished work
- intentionally skipped work

### Acceptance
A fresh developer can clone and run the project from README alone.

### Commit
`docs: add helpdesk setup notes and final documentation`

---

# Explicitly Skipped Topics

Do not implement unless explicitly requested:
- NgRx
- signal-based store
- SSR
- SSG
- hydration
- OAuth/OIDC
- production authentication backend
- advanced telemetry
- feature flags
- advanced accessibility work
- async validators
- dynamic config-driven forms
- `@defer`
- unrelated extension topics

# Expected Final Architecture

This is the direction the app should gradually evolve toward.

Do **not** create all folders in Phase 0.

```text
src/app/

  core/
    auth/
      auth.service.ts
      auth.guard.ts

    interceptors/
      auth.interceptor.ts
      error.interceptor.ts

  shared/
    components/
      ticket-status-badge/

    directives/
      highlight-priority.directive.ts

    pipes/
      time-ago.pipe.ts

  features/
    auth/
      pages/
        login/

    tickets/
      models/
        ticket.model.ts
        comment.model.ts

      services/
        ticket.service.ts

      validators/

      components/
        ticket-table/

      pages/
        ticket-list/
        ticket-detail/
        ticket-form/

    admin/
      categories/

  app.config.ts
  app.routes.ts
```

# Git Workflow

Recommended branch:

```bash
git checkout -b training/helpdesk
```

After each completed phase:

```bash
git status
git add .
git commit -m "<phase commit message>"
git push
```

Do not squash phase commits before mentor review.

Optional checkpoints:

```bash
git tag helpdesk-day1
git tag helpdesk-day2
git tag helpdesk-day3
git tag helpdesk-day4
```

# Codex Response Format After Every Phase

```text
Phase completed: <phase name>

Changed files:
- ...
- ...

Validation performed:
- ...

README update:
- Updated: yes/no
- If yes, summarize what changed

Original requirements advanced:
- Requirement #...

Manual verification:
1. ...
2. ...
3. ...

Suggested commit:
<commit message>

Stopped here. No later phase was implemented.
```

# Current Phase

Start with:

`Phase 0 — Bootstrap the Angular App`

Do not start Phase 1 until explicitly instructed.
