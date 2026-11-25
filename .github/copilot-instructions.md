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
