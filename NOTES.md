# Project notes

## Decisions and patterns

- Standalone Angular components are grouped into `core`, `shared`, and `feature` folders. The guarded admin area is lazy-loaded.
- Functional guards return redirect `UrlTree` values. Authentication exposes the current user as a read-only signal, which the app header reads directly; session persistence and the token getter remain in `AuthService`.
- RxJS handles HTTP requests and debounced search. The ticket detail page uses signals and computed values; the ticket form uses a Subject, `exhaustMap`, and a saving signal to prevent duplicate requests.
- Ticket forms use reactive forms, a `FormArray` for links, and a custom URL validator. Comments use a template-driven form.
- Shared components display comments, ticket lists, and status badges. A custom directive highlights priority, and `TimeAgoPipe` formats relative dates.
- Templates use built-in `@if` and `@for` control flow. Loops track records by ID, fixed options by value, and editable link rows by their `FormControl` identity. Read-only ticket-detail links use the index because duplicate URLs are allowed.
- English and Bangla translations are stored in JSON files. The app shell's language, loading, and error state use signals; its English fallback stays in the same cancellable translation-load pipeline.
- API models and requests are typed. Component subscriptions use `takeUntilDestroyed()` for teardown. Explicit request handles remain where a replacement load must cancel an earlier request; the ticket list keeps `switchMap` cancellation.

## Difficult parts

- Keeping search and filters in sync with route query parameters.
- Keeping forms usable after failed saves while preventing duplicate submissions.

## Testing

- Unit tests cover relative-date formatting and language changes, plus ticket request URLs, methods, payloads, and responses using `HttpTestingController`.
- Playwright covers ticket creation, comment validation and retry, and agent status/assignee changes in English and Bangla. Each test uses its own mocked API records.

## Limitations and production improvements

- Authentication and the JSON API are for training. A production application needs server-side authentication, authorization, and validation, plus an appropriate API URL in its environment configuration.
- The admin route is guarded and lazy-loaded, but category management is still a placeholder.
- Unit tests currently cover the pipe and ticket service; component, guard, and interceptor tests could be added later.
- NgRx, a signal store, SSR, SSG, hydration, OAuth/OIDC, and other optional extension features were intentionally skipped.
