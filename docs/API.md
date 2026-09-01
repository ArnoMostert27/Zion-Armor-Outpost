# API reference

Base URL: `/api`. All request and response bodies are JSON.

## Authentication

A successful register or login returns a JWT and also sets it as an httpOnly
cookie. Either mechanism works:

```
Authorization: Bearer <token>
```

The client stores the token and sends the header; the cookie is a fallback that
also protects against the token being lost from storage.

**Access levels used below**

| Level | Meaning |
|---|---|
| Public | No token needed |
| Private | Any signed-in user |
| Keeper | `role: "keeper"` only |

## Errors

Every error has the same shape. The status code carries the meaning.

```json
{ "message": "Those credentials do not open the gate" }
```

In development a `stack` field is included; in production it is stripped.

| Status | When |
|---|---|
| 400 | Validation failed, duplicate key, empty cart, insufficient stock |
| 401 | Missing, malformed or expired token; wrong credentials |
| 403 | Signed in but not permitted (non-keeper hitting a keeper route) |
| 404 | No such resource, or no route matched |
| 500 | Unhandled server error |

---

## Health

### `GET /api/health`
**Public.** Service check, used by Render's health probe.

```json
{ "status": "standing", "outpost": "Zion Armor Outpost", "time": "2026-08-31T12:00:00.000Z" }
```

---

## Products

### `GET /api/products`
**Public.** Search, filter, sort and paginate.

| Query param | Type | Notes |
|---|---|---|
| `q` | string | Full-text across title, blurb, tags, author |
| `category` | string | Comma-separated; matches any |
| `armorSlot` | string | Comma-separated; matches any |
| `tag` | string | Comma-separated; matches any |
| `minPrice` / `maxPrice` | number | Inclusive bounds |
| `inStock` | `true` | Only `stock > 0` |
| `firstEdition` | `true` | Only first editions |
| `sort` | enum | `newest` (default), `oldest`, `price-asc`, `price-desc`, `rating`, `title` |
| `page` | number | Default 1 |
| `limit` | number | Default 12, capped at 48 |

```json
{ "items": [ /* Product */ ], "page": 1, "pages": 2, "total": 24 }
```

### `GET /api/products/featured`
**Public.** Up to 8 products flagged `featured`, for the home rail.

### `GET /api/products/by-slot`
**Public.** In-stock products grouped by armor slot, top 8 per slot by rating.
Powers the Build Your Armor drawer in one request instead of six.

```json
{ "helmet": [ /* ... */ ], "breastplate": [ /* ... */ ] }
```

### `GET /api/products/:slug`
**Public.** One product with its field reports and related titles.

```json
{ "product": { }, "reports": [ ], "related": [ ] }
```

### `POST /api/products`
**Keeper.** Create. Body is a product document. Returns 201 with the created product.

### `PUT /api/products/:id`
**Keeper.** Update. Runs schema validators. Returns the updated product.

### `DELETE /api/products/:id`
**Keeper.** Deletes the product and cascades to its reviews.

---

## Users and auth

### `POST /api/users/register`
**Public.** Body: `{ name, email, password }`. Returns 201 with the user, their
derived rank, and a token.

### `POST /api/users/login`
**Public.** Body: `{ email, password }`.

Also advances the daily visit streak as a side effect: consecutive days
increment it and award 5 XP, a gap resets it to 1, and 30 days unlocks the
Faithful Watch badge.

```json
{
  "_id": "...", "name": "Arno", "email": "arno@zionarmor.dev", "role": "customer",
  "xp": 820,
  "rank": { "key": "watchman", "name": "Watchman", "xp": 700, "discount": 0.05 },
  "nextRank": { "key": "champion", "name": "Champion of Zion", "xp": 1500 },
  "rankProgress": 0.15,
  "badges": [], "streak": 3, "token": "eyJhbGci..."
}
```

### `POST /api/users/logout`
**Private.** Clears the auth cookie.

### `GET /api/users/profile` · `PUT /api/users/profile`
**Private.** Read or update name, email, password and sigil.

### `GET /api/users/rank`
**Private.** The full dossier behind the Rank page.

```json
{
  "xp": 820, "rank": { }, "nextRank": { }, "progress": 0.15, "streak": 3,
  "orderCount": 4, "titlesOwned": 7,
  "badges": [ ], "allBadges": [ ]
}
```

### `GET /api/users/scroll`
**Private.** The wishlist, populated with full product documents.

### `POST /api/users/scroll/:productId`
**Private.** Toggles a product on or off the scroll. Returns the new id list.

### `GET /api/users`
**Keeper.** Every user with derived rank.

### `DELETE /api/users/:id`
**Keeper.** Removes a user. Refuses to delete a keeper (400).

---

## Orders

### `POST /api/orders/quote`
**Private.** Prices a satchel without placing anything. Body:
`{ items: [{ product, qty }] }`.

Used by the checkout summary so the totals shown are the server's, not the
client's arithmetic.

```json
{
  "items": [ ], "itemsTotal": 600, "armorSetDiscount": 90, "rankDiscount": 51,
  "shippingTotal": 75, "grandTotal": 534, "isFullArmorSet": true,
  "rank": { }, "xpPreview": 53
}
```

### `POST /api/orders`
**Private.** Places an order. Body: `{ items, dispatch, paymentMethod }`.

The server ignores any prices in the request. It reloads every product, checks
stock, recomputes the totals, decrements stock, awards XP and evaluates badges.

Returns 201:

```json
{
  "order": { }, "xpAwarded": 203,
  "newBadges": ["first-blood", "full-plate"],
  "rank": { }, "xp": 1023
}
```

400 if the satchel is empty, dispatch details are incomplete, an item no longer
exists, or stock is insufficient.

### `GET /api/orders/mine`
**Private.** The signed-in user's supply runs, newest first.

### `GET /api/orders/:id`
**Private.** One order. Owner or keeper only — 403 otherwise.

### `GET /api/orders`
**Keeper.** Every order with the user populated.

### `GET /api/orders/stats`
**Keeper.** Dashboard figures, built with four aggregations.

```json
{
  "revenue": 12450, "orders": 18, "units": 34,
  "daily": [ { "_id": "2026-08-30", "revenue": 1200, "orders": 2 } ],
  "topSellers": [ { "_id": "The Action Bible", "units": 9, "revenue": 4941 } ],
  "lowStock": [ { "title": "Watchman Collector Slipcase", "stock": 4 } ]
}
```

### `PUT /api/orders/:id/status`
**Keeper.** Body: `{ status }` — one of `placed`, `packing`, `dispatched`,
`delivered`, `cancelled`. Sets `deliveredAt` when moving to delivered.

---

## Reviews (Field Reports)

### `GET /api/reviews/:productId`
**Public.** Reports for a product, newest first.

### `POST /api/reviews/:productId`
**Private.** Body: `{ rating, headline, body }`.

Awards 25 XP, recomputes the product's average rating, and unlocks the Scribe
badge at ten reports. 400 if this user already reviewed this product.

### `DELETE /api/reviews/report/:id`
**Private.** Author or keeper only. Recomputes the product rating afterwards.

---

## Bundle (Build Your Armor)

### `GET /api/bundle/slots`
**Public.** Armor slot metadata and the set discount rate.

```json
{ "slots": [ { "key": "helmet", "name": "Helmet of Salvation", "verseRef": "Ephesians 6:17" } ], "discountRate": 0.15 }
```

### `POST /api/bundle/validate`
**Public.** Body: `{ selection: { helmet: "<id>", breastplate: "<id>", ... } }`.

Confirms each product genuinely belongs in the slot it was placed in — 400 if
not — and returns the saving.

```json
{ "complete": true, "filled": [ ], "missing": [], "subtotal": 600, "discount": 90, "total": 510 }
```

---

## Reading plans

### `GET /api/plans`
**Public.** All plans without other users' progress.

### `GET /api/plans/:slug`
**Public.** One plan. Includes `myProgress` when a token is supplied.

### `POST /api/plans/:slug/day/:day`
**Private.** Marks a day complete or incomplete. Completing the final day awards
100 XP once.

```json
{ "myProgress": { "completedDays": [1,2,3] }, "xpAwarded": 100, "xp": 920, "rank": { }, "completed": true }
```
