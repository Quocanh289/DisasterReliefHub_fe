# Group 1 API Contract

Base URL: `http://localhost:8080/api`. Protected routes require `Authorization: Bearer <accessToken>`.
JSON enum values use their names, for example `"Pending"` and `"Volunteer"`.

## Authentication

| Method | Path | Access | Purpose |
|---|---|---|---|
| POST | `/auth/register` | Public | Register a Requester or Volunteer. Omitted role defaults to Volunteer. |
| POST | `/auth/login` | Public | Return user details, access token, and refresh token. |
| POST | `/auth/refresh` | Public | Exchange a valid refresh token for a new token pair. |

```json
{ "fullName": "Requester One", "email": "requester@example.test", "password": "AtLeast12Chars", "role": "Requester" }
```

Only public roles can be selected at registration; Admin and Coordinator accounts are provisioned by administrators.

## Catalog and stock

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/events`, `/events/{id}` | Authenticated | List events or read one event. |
| POST | `/events` | Admin | Create a disaster event. |
| PUT, DELETE | `/events/{id}` | Admin | Update or remove an unused event. |
| GET | `/warehouses`, `/warehouses/{id}` | Authenticated | List warehouses or read one warehouse. |
| POST | `/warehouses` | Admin | Create a warehouse. |
| PUT, DELETE | `/warehouses/{id}` | Admin | Update or remove an unused warehouse. |
| GET | `/items`, `/items/{id}` | Authenticated | List items or read one item. |
| POST | `/items` | Admin | Create a catalog item. |
| PUT, DELETE | `/items/{id}` | Admin | Update or remove an unused item. |
| GET | `/inventories?warehouseId={id}` | Admin, Coordinator | Read stock and available quantity. |
| PUT | `/inventories` | Admin, Coordinator | Upsert stock for a warehouse/item pair. |

Inventory update body:

```json
{ "warehouseId": "guid", "itemId": "guid", "quantityOnHand": 100, "safetyStock": 10 }
```

`quantityCommitted` is controlled by assignment processing and is not writable through this endpoint.

## Volunteers and relief requests

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET, PUT | `/volunteers/me` | Volunteer | Read or update skills, service radius, and location. |
| PATCH | `/volunteers/me/status` | Volunteer | Set `Available` or `Offline`; `Busy` is assignment-managed. |
| GET | `/volunteers` | Coordinator, Admin | List volunteer profiles and availability. |
| POST | `/relief-requests` | Requester | Create a request at longitude/latitude with requested items. |
| GET | `/relief-requests/mine` | Requester | List the signed-in requester's requests. |
| POST | `/relief-requests/{id}/cancel` | Requester | Cancel an owned request while Pending. |
| GET | `/relief-requests` | Coordinator, Admin | List requests for coordination. |

Request body example:

```json
{
  "phone": "0900000000",
  "eventId": null,
  "urgency": 4,
  "affectedPeople": 3,
  "longitude": 105.8542,
  "latitude": 21.0285,
  "items": [{ "itemId": "guid", "quantity": 5 }]
}
```

## Manual assignment and notifications

| Method | Path | Access | Purpose |
|---|---|---|---|
| POST | `/assignments` | Coordinator, Admin | Assign a pending request, active warehouse, stock items, and available volunteer. |
| GET | `/assignments/mine` | Volunteer | List the signed-in volunteer's assignments. |
| PATCH | `/assignments/{id}/status` | Assigned Volunteer | Accept, start delivery, mark delivered, or report failure. |
| GET | `/notifications/mine` | Authenticated | Read the latest 100 persisted notifications. |

Assignment creation body:

```json
{
  "requestId": "guid",
  "warehouseId": "guid",
  "volunteerId": "guid",
  "eta": null,
  "note": "Demo delivery",
  "items": [{ "itemId": "guid", "quantity": 2 }]
}
```

Assignment status body:

```json
{ "status": "InTransit", "note": "Departed warehouse" }
```

Creating an assignment validates requested quantities and available stock, then reserves inventory in a database transaction. Delivery records dispatched quantities as delivered/received, updates request fulfilment, releases the reservation, and persists notifications for the volunteer and requester.

Legacy routes `/api/warehouse` and `/api/reliefrequest` remain available for compatibility.

## Error responses

Error responses in this contract use RFC 7807 `ProblemDetails` with the JSON fields `type`, `title`, `status`, `detail`, and `instance`. Validation errors may use `ValidationProblemDetails`, which also includes an `errors` object keyed by field name. Do not return stack traces, credentials, or other sensitive values.

```json
{
  "type": "https://api.example.test/problems/validation",
  "title": "One or more validation errors occurred.",
  "status": 400,
  "detail": "The request is invalid.",
  "instance": "/api/relief-requests",
  "errors": {
    "request": ["The supplied values are invalid."]
  }
}
```

| Endpoint group | Applicable error status codes | Typical cases |
|---|---|---|
| Authentication | `400`, `401`, `409` | Invalid registration input (`400`), invalid credentials or refresh token (`401`), duplicate email (`409`). |
| Events, warehouses, and items | `401`, `403`, `400`, `404`, `409` | Authentication/role failure (`401`/`403`), invalid input (`400`), missing resource (`404`), duplicate or in-use resource (`409`). |
| Inventories | `401`, `403`, `400`, `404`, `409` | Authentication/role failure (`401`/`403`), negative quantities (`400`), unknown warehouse/item (`404`), quantity below committed stock (`409`). |
| Volunteer profiles and volunteer list | `401`, `403`, `400`, `404` | Authentication/role failure (`401`/`403`), invalid profile/status (`400`), profile not found (`404`). |
| Relief requests | `401`, `403`, `400`, `404`, `409` | Authentication/role failure (`401`/`403`), invalid request/event/items (`400`), request not found or not owned (`404`), request cannot be cancelled in its current state (`409`). |
| Assignments | `401`, `403`, `400`, `404`, `409` | Authentication/role or ownership failure (`401`/`403`), invalid item/status/quantity (`400`), missing request, warehouse, volunteer, or assignment (`404`), unavailable stock or invalid state transition (`409`). |
| Notifications | `401`, `403` | Missing/invalid authentication (`401`) or insufficient access (`403`). |

These are the contract's standard error shapes and status mappings. The current controllers do not yet apply RFC 7807 consistently: for example, several validation/conflict responses use a `{ "message": "..." }` object and some unauthorized responses have no body. A client should use the HTTP status as the reliable signal until implementation is aligned with this format.

## Response examples

The examples below show the JSON field names emitted by the current response DTOs/projections. Enum values are serialized as strings.

### `POST /auth/login` â€” `200 OK`

`AuthResponse`:

```json
{
  "userId": "00000000-0000-0000-0000-000000000001",
  "fullName": "Volunteer One",
  "email": "volunteer@example.test",
  "role": "Volunteer",
  "accessToken": "<access-token>",
  "refreshToken": "<refresh-token>"
}
```

### `GET /inventories` â€” `200 OK`

Returns an array; `available` is calculated as `quantityOnHand - quantityCommitted - safetyStock`.

```json
[
  {
    "id": "00000000-0000-0000-0000-000000000010",
    "warehouseId": "00000000-0000-0000-0000-000000000011",
    "warehouseName": "Central Warehouse",
    "itemId": "00000000-0000-0000-0000-000000000012",
    "itemName": "Water",
    "unit": "bottle",
    "quantityOnHand": 100,
    "quantityCommitted": 10,
    "safetyStock": 5,
    "available": 85
  }
]
```

### `GET /volunteers/me` â€” `200 OK`

```json
{
  "id": "00000000-0000-0000-0000-000000000020",
  "userId": "00000000-0000-0000-0000-000000000001",
  "fullName": "Volunteer One",
  "email": "volunteer@example.test",
  "skills": ["FirstAid"],
  "location": { "longitude": 105.8542, "latitude": 21.0285 },
  "serviceRadiusKm": 15,
  "status": "Available",
  "currentLoad": 0
}
```

`location` is `null` when the volunteer has no saved home location.

### `GET /relief-requests` â€” `200 OK`

Returns an array of `ReliefRequestResponse`:

```json
[
  {
    "id": "00000000-0000-0000-0000-000000000030",
    "eventId": null,
    "requesterId": "00000000-0000-0000-0000-000000000031",
    "requesterName": "Requester One",
    "phone": "0900000000",
    "location": { "longitude": 105.8542, "latitude": 21.0285 },
    "urgency": 4,
    "affectedPeople": 3,
    "status": "Pending",
    "createdAt": "2026-01-15T08:30:00+00:00",
    "items": [
      {
        "itemId": "00000000-0000-0000-0000-000000000012",
        "itemName": "Water",
        "unit": "bottle",
        "quantityNeeded": 5,
        "quantityFulfilled": 0
      }
    ]
  }
]
```

### `POST /assignments` â€” `201 Created`

Returns an `AssignmentResponse`:

```json
{
  "id": "00000000-0000-0000-0000-000000000040",
  "requestId": "00000000-0000-0000-0000-000000000030",
  "requesterName": "Requester One",
  "warehouseId": "00000000-0000-0000-0000-000000000011",
  "warehouseName": "Central Warehouse",
  "volunteerId": "00000000-0000-0000-0000-000000000041",
  "volunteerName": "Volunteer One",
  "status": "Pending",
  "eta": null,
  "note": "Demo delivery",
  "items": [
    {
      "itemId": "00000000-0000-0000-0000-000000000012",
      "itemName": "Water",
      "unit": "bottle",
      "qtyDispatched": 2,
      "qtyDelivered": 0,
      "qtyReceived": 0
    }
  ]
}
```

### `GET /assignments/mine` â€” `200 OK`

Returns an array of `AssignmentResponse`, with the same fields and item structure as the `POST /assignments` response.

### `GET /notifications/mine` â€” `200 OK`

Returns an array of persisted notification records:

```json
[
  {
    "id": "00000000-0000-0000-0000-000000000050",
    "createdAt": "2026-01-15T08:30:00Z",
    "updatedAt": null,
    "createdBy": null,
    "userId": "00000000-0000-0000-0000-000000000001",
    "title": "You have a new relief assignment",
    "message": "A relief request has been assigned to you.",
    "type": "AssignmentCreated",
    "relatedEntityId": "00000000-0000-0000-0000-000000000040",
    "isRead": false,
    "readAt": null
  }
]
```

## Endpoint implementation check

The current controllers do not define `GET /skills` or `PATCH /notifications/{id}/read`; neither route is part of the endpoint tables above.
