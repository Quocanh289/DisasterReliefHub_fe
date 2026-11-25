# Frontend Phase 1 Acceptance Checklist

1. **API contract:** Verify paths, methods, request fields, and response fields from `api-contract.md` in DevTools Network.
2. **Leaflet coordinates:** Confirm every backend location is converted to `[latitude, longitude]` inside map components.
3. **Authorization:** Confirm route guards and menu visibility follow the signed-in role.
4. **Error handling:** Confirm messages are parsed from `ProblemDetails`, legacy `{ message }`, and HTTP status fallbacks.
5. **Build:** Confirm `ng build` completes without TypeScript, template, or stylesheet errors.
