# Zion Armor Outpost — project report

**Arno Mostert · Code College · MERN stack**
Repository: https://github.com/ArnoMostert27/Zion-Armor-Outpost

---

## 1. What it is

An e-commerce store selling comic-format Bibles — the Action Bible line, kids'
graphic novels, study editions, boxed sets and related gear.

The brief called for a MERN application with a heavily animated front end. The
risk in a brief like that is building a generic shop and painting effects onto
it afterwards, which produces a site where the animation and the commerce feel
like two unrelated projects.

So the theme was chosen first and everything else derived from it.

## 2. The organising idea

The store is named for the armor of God in Ephesians 6. That passage lists six
pieces, so the shop has **six categories, one per piece**:

| Armor piece | Rack | Verse |
|---|---|---|
| Helmet of Salvation | Kids Comics | Ephesians 6:17 |
| Breastplate of Righteousness | Action Bibles | Ephesians 6:14 |
| Belt of Truth | Study Editions | Ephesians 6:14 |
| Shield of Faith | Devotionals | Ephesians 6:16 |
| Sword of the Spirit | Boxed Sets | Ephesians 6:17 |
| Boots of the Gospel | Gear | Ephesians 6:15 |

This one decision does a surprising amount of work:

- **Navigation becomes the hero.** The landing page is six 3D armor pieces in
  orbit. Hovering one shows its verse; clicking it opens that category. The most
  visually ambitious element on the site is also its primary navigation, so the
  animation is not decoration that could be deleted without loss.
- **It generates a genuinely novel feature.** "Build Your Armor" — pick one
  title per slot, complete all six, get a discount. That feature only exists
  because the categories map to a set.
- **It gives the interface one voice.** The cart is the Satchel, checkout is
  Requisition, order history is Supply Runs, reviews are Field Reports, the
  admin panel is the Keeper's Ledger, an out-of-stock item reads "Rack Empty".

## 3. Stack

| Layer | Choice | Reasoning |
|---|---|---|
| Database | MongoDB + Mongoose | Required. Products vary by category, so a flexible document shape beats rigid columns. |
| API | Node + Express | Required. Small, explicit, easy to reason about. |
| Client | React 18 + Vite | Required. Vite for fast HMR and a straightforward production build. |
| Styling | Handwritten CSS | Chosen over Tailwind. See below. |
| Routing | React Router 6 | Standard. |
| State | Zustand | Three small stores instead of Redux boilerplate or prop drilling. |
| Scroll animation | GSAP + ScrollTrigger | The only mature option for scrubbed, pinned scroll timelines. |
| Component animation | Framer Motion | Declarative enter/exit, works with React's lifecycle. |
| Smooth scroll | Lenis | Makes scrubbed scroll animation feel intentional rather than jerky. |
| 3D | React Three Fiber + drei | Three.js expressed as React components. |
| Testing | Vitest | One test runner for both packages. |

### Why handwritten CSS and not Tailwind

Tailwind is faster to write, but this project is partly assessed on CSS ability,
and a wall of utility classes demonstrates familiarity with Tailwind rather than
with CSS.

More practically, the visual language here — halftone dot fields, clip-path
torn panel edges, conic-gradient holographic foil, comic gutters — is not what
utility frameworks are built for. Every one of those would have ended up in a
custom layer anyway.

The stylesheet is organised in six layers, loaded in order:

```
tokens.css      custom properties: colour, type scale, spacing, easing
base.css        reset, base typography, reduced-motion handling
comic.css       the comic language: panels, halftone, bursts, foil, stamps
components.css  buttons, fields, cards, badges, modals
layout.css      header, footer, satchel drawer, cursor, transitions
pages.css       page-specific composition
```

Every colour is a custom property, which is what makes the Day Watch / Night
Watch theme swap a matter of redefining a dozen variables under one selector
rather than duplicating the stylesheet.

## 4. Architecture

```
Browser
  └─ React (Vite)
       ├─ Zustand stores: auth · cart · ui · scroll
       ├─ api/client.js — fetch wrapper, attaches the JWT
       └─ React Router
              │  HTTP + JSON
              ▼
Express API
  ├─ routes/       path to controller
  ├─ middleware/   protect · keeperOnly · notFound · errorHandler
  ├─ controllers/  request handling, orchestration
  ├─ utils/        ranks.js · pricing.js — pure, no I/O
  └─ models/       Mongoose schemas, validation, hooks
              │
              ▼
MongoDB (Atlas in production)
```

### Deliberate boundaries

**Pure logic is separated from I/O.** `utils/ranks.js` and `utils/pricing.js`
contain no database access. They take values and return values. That makes them
directly unit-testable without any test database, which is why the test suite
runs in under a second.

**Validation lives on the schema.** Enums, minimums, patterns and required
fields are declared in Mongoose, so they hold whether a document is written by
the API, the seeder or a console session. Controllers do not re-implement them.

**Errors are centralised.** Controllers `throw`; `express-async-handler` catches
async rejections; one error middleware translates Mongoose CastErrors, duplicate
keys and validation errors into the right status codes and a consistent body.

## 5. Security

**Passwords** are hashed with bcrypt in a Mongoose pre-save hook, so any code
path that sets a password gets hashing for free. The field is `select: false`,
so an ordinary query cannot leak it even by accident.

**Tokens** are signed JWTs, delivered both as a Bearer token and as an httpOnly
cookie with `secure` and `sameSite` set according to environment.

**Authorisation is a middleware chain,** not a check inside each handler.
`protect` establishes identity, `keeperOnly` establishes permission. A route is
secured by its declaration, so it is visible at a glance in the routes file
rather than buried in a controller.

**The server never trusts client prices.** This is the most important decision
in the codebase. `POST /api/orders` accepts only product ids and quantities. It
reloads every product from the database, verifies stock, and recomputes every
figure. A tampered request that claims a R2499 slipcase costs R1 is priced at
R2499 anyway.

The same function backs `POST /api/orders/quote`, so what the customer sees at
checkout and what they are charged come from one source.

**Ownership is checked, not assumed.** `GET /api/orders/:id` compares the order
owner against the requesting user and returns 403 for anyone else — an
authenticated user cannot read another user's order by guessing an id.

**CORS is an allow-list** driven by `CLIENT_URL`, which accepts a
comma-separated list so preview deploys work without opening the API to
everything.

## 6. Front end

### The Armory hero

Six armor pieces built from Three.js primitives — no downloaded models, which
keeps the payload small. They orbit slowly and drift with the pointer.
Hovering scales a piece, raises its emissive intensity and prints its verse;
clicking opens its rack.

Three.js is large, so the hero is behind `React.lazy` and Vite splits it into
its own chunk. The rest of the site loads without it. If WebGL is unavailable or
the visitor prefers reduced motion, a static icon grid renders instead — the
navigation still works, which matters because this *is* the navigation.

### The motion comic

A pinned stage over roughly four viewport heights of scroll. Five panels slam in
on a scrubbed GSAP timeline, each also revealed with an animating `clip-path` so
the panel appears to be inked onto the page. Onomatopoeia bursts pop between
them, and a progress bar tracks the scroll.

Scroll velocity is fed from Lenis into a CSS custom property, which stretches
the halftone dot field — scroll fast and the texture streaks.

### Build Your Armor

Six slots, one per armor piece. Choosing a title lights that piece on an SVG
figure and advances a progress ring. Filling all six ignites the figure and
unlocks the discount.

The discount shown here is a preview. The authoritative calculation happens
server-side at checkout, where the set is re-detected from the actual order
contents. A user who assembles a set here and then removes an item from the
satchel does not keep the discount.

### Performance

- Code split into four chunks: three (220 kB gzipped), motion (71 kB), react
  (54 kB), app (46 kB). Only the last three are needed before the hero arrives.
- Product images are lazy-loaded.
- Cover art is SVG — resolution-independent and a few kilobytes each.
- Animations run on `transform` and `opacity` to stay off the layout path.

### Accessibility

- Every animation is wrapped in a `prefers-reduced-motion` check; the 3D hero
  and the scroll comic both have static equivalents.
- The custom cursor is disabled on coarse pointers.
- Interactive controls are real `<button>` and `<a>` elements with `aria-label`
  where the visible content is an icon, and `aria-pressed` on toggles.
- Focus states are visible and not suppressed.
- Colour contrast was chosen against the parchment/ink palette in both themes.

## 7. Testing

48 tests across two Vitest suites, run with `npm test` from the root.

**Server (27 tests)** cover the rank engine and the pricing module: threshold
boundaries, the max-rank ceiling, XP conversion, discount rates, armor set
detection, discount stacking order, shipping thresholds and integer rounding.

**Client (21 tests)** cover the cart store — quantity merging, removal at zero,
subtotal arithmetic, slot coverage, payload shape — and the formatting helpers
and armor data integrity.

### A test that found a real bug

While writing the pricing tests I asserted that a R600 full armor set would ship
free, since R600 clears the R500 threshold. The test failed: the actual total
was R534, not R459.

The code was right and my assumption was wrong. Discounts are applied *before*
the shipping threshold is evaluated, so 15% off for the set plus 10% for
Champion rank drops the subtotal to R459 — back under R500, and shipping is
charged again.

That is a genuine edge case a customer would notice and complain about, and it
is exactly the kind of thing that hides in an untested pricing function. It is
now an explicit test with a comment explaining the behaviour, so the ordering of
those two operations cannot be changed silently.

## 8. What I would do next

**Payment.** Checkout currently has a `demo` method that marks orders paid
instantly. A real integration — PayFast is the sensible South African choice —
needs a redirect flow and a webhook that flips `isPaid` on confirmation rather
than trusting a return URL.

**Reading plan progress at scale.** Progress is embedded in the plan document.
Bounded and fine at this size, but at tens of thousands of users per plan it
becomes the bottleneck and should move to its own collection.

**Integration tests.** The unit suite covers pure logic. The API routes are
tested manually. Supertest plus an in-memory MongoDB would close that gap.

**Image handling.** Cover art is generated SVG. Real artwork would want
Cloudinary or similar, with upload from the Keeper's Ledger and responsive
variants.

**Rate limiting.** The login endpoint has no throttle, which is fine for a
student project on a free tier and not fine for anything public.

## 9. Running it

```bash
npm run install:all
cp server/.env.example server/.env   # set MONGO_URI and JWT_SECRET
npm run covers                       # generate the placeholder cover art
npm run seed                         # 3 users, 24 products, 3 reading plans
npm run dev                          # API on :5000, client on :5173
npm test                             # 48 tests
```

Demo accounts: `keeper@zionarmor.dev` / `keeper123` (admin) and
`arno@zionarmor.dev` / `recruit123` (customer).

Deployment is documented separately in `DEPLOYMENT.md`; the data model and API
in `docs/DATA-MODEL.md` and `docs/API.md`.
