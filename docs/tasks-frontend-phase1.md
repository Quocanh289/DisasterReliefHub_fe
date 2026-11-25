# Frontend Phase 1 Task Cards

## F1 - Login and Registration
Implement `/login` and `/register`. Passwords require at least 12 characters. Registration exposes only `Requester` and `Volunteer`. Use the flat `AuthResponse` and route users according to role.

## F2 - Catalog, Warehouses, and Inventory
Admin can CRUD events, items, and warehouses, with `MapPickerComponent` for warehouse locations. Coordinator can view inventory and use `PUT /api/inventories` without `quantityCommitted`; display `available` and handle `409`.

## F3 - Requester Portal
Requester can create requests with `phone`, `urgency`, `affectedPeople`, map coordinates, and a `FormArray` of `{ itemId, quantity }`. Show `quantityFulfilled / quantityNeeded` and allow cancellation only while `Pending`.

## F4 - Coordination Dashboard
Coordinator and Admin can view warehouse, request, and available-volunteer layers on the map and create `POST /api/assignments` payloads using `requestId`, warehouse, volunteer, and dispatched items.

## F5 - Volunteer Portal
Volunteer can update skills, location, and service radius; toggle only `Available` or `Offline` unless `Busy`; and update assignment status through `Pending -> Accepted -> InTransit -> Delivered` or `Failed` with a note.

## F6 - Notifications and Responsive Review
Load `GET /api/notifications/mine` in the navigation notification bell, add mobile navigation behavior, and verify all Phase 1 screens remain usable on small viewports.
