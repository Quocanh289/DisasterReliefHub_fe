# AI Coding Instructions — DisasterReliefHub Frontend (Angular)

## Project Context & Scope
Build the Angular frontend for the Disaster Relief Volunteer & Supply Coordination Platform, using the .NET 8 API at `http://localhost:8080/api`.

- Actors: `Admin`, `Coordinator`, `Volunteer`, `Requester`.
- Phase 1 only: authentication, catalog and stock, volunteer profile/status, relief request creation, manual assignment, assignment execution, and notifications.
- Out of scope: SignalR real-time features, deduplication UI, allocation-plan approval, minimum-cost-flow triggers, rerouting, isolated zones, `GET /skills`, and `PATCH /notifications/{id}/read`.

## Technical Rules
- Use Angular 18 standalone components, strict TypeScript, RxJS, reactive forms, Angular Router, and Leaflet.
- Keep all endpoint paths and payloads aligned with `api-contract.md`.
- Preserve backend longitude/latitude field names and convert to Leaflet `[latitude, longitude]`.
- Use RFC 7807 parsing with legacy `{ message }` and HTTP-status fallbacks.
- Hide unauthorized menu items and enforce route role guards.
- Volunteers may set only `Available` or `Offline`; assignment transitions are `Pending -> Accepted -> InTransit -> Delivered` or `Failed`.
- Keep code clean, unsubscribe streams, and avoid placeholders or console logging.

## Feature Workflow
For F1-F6 tasks: plan exact files and interactions first, wait for approval, implement only the task scope, and verify `ng build`.

## UI and design rules
- Use PrimeNG components (including p-table, p-dialog, p-select, p-inputnumber, p-tag, p-toast, p-button, and p-tabs) and primeicons; use Leaflet with OpenStreetMap for maps.
- Match the reference screens in `fe_kit/design/` and tokens in `fe_kit/design/styles.css`.
- Use the ReliefHub tokens: primary `#1E6FD9`, warning `#F59E0B`, danger `#DC2626`, success `#16A34A`, page background `#F5F7FA`, white cards, border `#E5E7EB`, text `#1F2937`, muted text `#6B7280`, 10px card radius, and 6px input/button radius.
- Keep the sidebar 240px and header 60px on desktop; below 768px use a menu button and hide the sidebar until opened.
- Hide unauthorized menu entries and protect routes by role. User-facing UI text is Vietnamese.

## API and implementation rules
- `api-contract.md` is authoritative for endpoint paths, payloads, and response fields.
- Keep API access in resource-specific services that return typed `Observable<T>` values; components must not use `HttpClient` directly.
- Keep `AuthResponse` flat, omit `phone` from `RegisterRequest`, use `available` for inventory availability, and model volunteer locations as `GeoLocation | null`.
- Relief-request payloads use `longitude`, `latitude`, and `items: [{ itemId, quantity }]`; assignment creation uses `requestId`.
- Inventory updates send only `warehouseId`, `itemId`, `quantityOnHand`, and `safetyStock`; never send `quantityCommitted`.
- Volunteers can set only `Available` or `Offline`; assignment transitions are `Pending -> Accepted -> InTransit -> Delivered` or `Failed`.
- Parse RFC 7807 validation errors, `detail`, `title`, legacy `{ message }`, then HTTP status fallbacks. Do not call `GET /skills` or `PATCH /notifications/{id}/read`.
- Every screen should represent loading, error with retry, empty, and submitting/disabled states where applicable.
- Use reactive forms, clean up subscriptions, surface failures, and do not leave TODOs, unfinished placeholders, or console logging.
