# Zion Armor Outpost

A comic Bible bookstore built on the MERN stack. The shop is organised around the
armor of God from Ephesians 6 — six racks, one per piece — and the front end is
deliberately the main event: a 3D armoury hero, a scroll-driven motion comic, a
"Build Your Armor" bundle builder, and an XP/rank system that runs through the
whole store.

**Stack:** MongoDB · Express · React (Vite) · Node · handwritten CSS

---

## Quick start

```bash
# 1. install everything (root, server, client)
npm run install:all

# 2. set up the server environment
cp server/.env.example server/.env
#    then edit server/.env and set MONGO_URI and JWT_SECRET

# 3. generate the placeholder cover art
npm run covers

# 4. seed the database
npm run seed

# 5. run both the API and the client
npm run dev

# 6. run the tests (48 across server and client)
npm test
```

- Client: http://localhost:5173
- API: http://localhost:5000/api/health

### Demo logins

| Role | Email | Password |
|---|---|---|
| Outpost Keeper (admin) | `keeper@zionarmor.dev` | `keeper123` |
| Recruit (customer) | `arno@zionarmor.dev` | `recruit123` |

---

## Documentation

| Document | What's in it |
|---|---|
| [`docs/PROJECT-REPORT.md`](docs/PROJECT-REPORT.md) | The write-up: concept, architecture, security, testing, next steps |
| [`docs/DATA-MODEL.md`](docs/DATA-MODEL.md) | ERD and the reasoning behind each schema decision |
| [`docs/API.md`](docs/API.md) | Every endpoint, with parameters and example responses |
| [`DEPLOYMENT.md`](DEPLOYMENT.md) | Step-by-step Atlas + Render + Vercel deployment |

## Project layout

```
zion-armor-outpost/
├── package.json            root scripts (dev, seed, build)
├── scripts/
│   └── generate-covers.mjs procedural SVG cover art
├── server/
│   ├── server.js           Express entry point
│   ├── config/db.js        Mongo connection
│   ├── models/             User, Product, Order, Review, ReadingPlan
│   ├── controllers/        route handlers
│   ├── routes/             route definitions
│   ├── middleware/         auth + error handling
│   ├── utils/              JWT + the rank/XP engine
│   ├── data/               seed catalogue, users, reading plans
│   └── seeder.js           import / destroy data
└── client/
    ├── index.html
    ├── vite.config.js      dev proxy to the API
    └── src/
        ├── styles/         tokens, base, comic, components, layout, pages
        ├── components/     layout, ui, home
        ├── pages/          Home, Racks, Dossier, Forge, Requisition, Rank, Ledger, Plans, Gate, 404
        ├── store/          zustand stores (auth, cart, ui)
        ├── hooks/          useApi, useSmoothScroll
        ├── api/client.js   fetch wrapper
        ├── lib/            formatting + animation helpers
        └── data/armor.js   the six armor pieces
```

---

## The naming

The store speaks in one voice throughout. It is worth knowing the mapping:

| Normal e-commerce | Zion Armor Outpost |
|---|---|
| Cart | The Satchel |
| Wishlist | The Scroll |
| Checkout | Requisition |
| Order history | Supply Runs |
| Account | Your Rank |
| Categories | The Six Racks |
| Reviews | Field Reports |
| Admin panel | The Keeper's Ledger |
| Search | Scout |
| Out of stock | Rack Empty |

---

## Front end highlights

**The Armory hero** (`components/home/ArmoryHero.jsx`)
Six armor pieces built from Three.js primitives, floating in a slow orbit with
pointer parallax. Hovering one lights it and prints its verse; clicking opens
that rack. Falls back to a static icon grid when WebGL is unavailable or the
visitor prefers reduced motion.

**The motion comic** (`components/home/MotionComic.jsx`)
A pinned stage with five comic panels that slam in on scroll, driven by GSAP
ScrollTrigger with `scrub`. Onomatopoeia bursts pop between panels and a
progress bar tracks the scroll.

**Build Your Armor** (`pages/Forge.jsx`)
Six slots, one per armor piece. Pick a title for each and the SVG figure fills
in piece by piece. Complete the set and the figure ignites, a 15% discount
unlocks, and the order earns a 150 XP bonus. The discount is recalculated on the
server at checkout — the client number is only a preview.

**Holographic covers** (`components/ui/ProductCard.jsx`)
Cards tilt in 3D under the pointer, sweep a foil shine on hover, and first
editions get a rotating rainbow layer driven by pointer position.

**Longbox view** (`pages/Racks.jsx`)
An alternative browse mode that stacks the covers like comics in a physical
long box; hovering pulls one out.

**Everything else**
Custom sword cursor, armor-assembly preloader, comic-panel page transitions,
Day Watch / Night Watch themes, scroll-velocity halftone stretch, wax-seal order
confirmation, and a 404 that counts to forty years.

Every animation is wrapped in a `prefers-reduced-motion` check.

---

## Back end highlights

**Rank engine** (`server/utils/ranks.js`)
Pure functions — rank thresholds, XP rules and badge definitions live in one
file with no database access, so they are trivial to test.

**Server-side pricing** (`server/controllers/orderController.js`)
`priceOrder()` recalculates every figure from live product prices, checks stock,
detects a complete armor set, and applies the rank discount. Prices sent by the
client are never trusted.

**Auth** — JWT issued both as a Bearer token and an httpOnly cookie, bcrypt
hashing in a Mongoose pre-save hook, and a `keeperOnly` guard for admin routes.

**Search** — a Mongo text index across title, blurb, tags and author powers the
Scout endpoint; filters, sorting and pagination are all handled in one query.

---

## API reference

| Method | Route | Access | Purpose |
|---|---|---|---|
| GET | `/api/health` | Public | Service check |
| GET | `/api/products` | Public | Search, filter, sort, paginate |
| GET | `/api/products/featured` | Public | Home page rail |
| GET | `/api/products/by-slot` | Public | Products grouped by armor slot |
| GET | `/api/products/:slug` | Public | One product + reports + related |
| POST | `/api/products` | Keeper | Create |
| PUT | `/api/products/:id` | Keeper | Update |
| DELETE | `/api/products/:id` | Keeper | Delete |
| POST | `/api/users/register` | Public | Enlist |
| POST | `/api/users/login` | Public | Sign in (also advances visit streak) |
| POST | `/api/users/logout` | Private | Clear cookie |
| GET/PUT | `/api/users/profile` | Private | Read / update profile |
| GET | `/api/users/rank` | Private | Full rank dossier |
| GET/POST | `/api/users/scroll` | Private | Wishlist |
| GET | `/api/users` | Keeper | List users |
| POST | `/api/orders/quote` | Private | Price a satchel without ordering |
| POST | `/api/orders` | Private | Place an order, award XP and badges |
| GET | `/api/orders/mine` | Private | Supply runs |
| GET | `/api/orders/stats` | Keeper | Dashboard figures |
| PUT | `/api/orders/:id/status` | Keeper | Advance status |
| GET/POST | `/api/reviews/:productId` | Public / Private | Field reports |
| GET | `/api/bundle/slots` | Public | Armor slot metadata |
| POST | `/api/bundle/validate` | Public | Validate a six-slot selection |
| GET | `/api/plans` | Public | Reading plans |
| POST | `/api/plans/:slug/day/:day` | Private | Mark a day complete |

---

## Deployment

**Database** — create a free cluster on MongoDB Atlas, allow access from
anywhere (or your host's IPs), and copy the connection string into `MONGO_URI`.

**Two-service deploy (recommended)**

1. API on Render / Railway: root directory `server`, build `npm install`,
   start `npm start`. Set `NODE_ENV=production`, `MONGO_URI`, `JWT_SECRET`,
   and `CLIENT_URL` to the deployed client URL.
2. Client on Vercel / Netlify: root directory `client`, build `npm run build`,
   output `dist`. Set `VITE_API_URL` to the deployed API URL.

**Single-service deploy** — `server.js` already serves `client/dist` when
`NODE_ENV=production`. Build the client, then run the server alone.

Remember to change the seeded passwords and set a real `JWT_SECRET` before any
public deployment.

---

## Replacing the placeholder art

Cover files live in `client/public/covers/` and are named after each product's
slug. Drop a real image in with the same name (and update `coverImage` in the
product record if you change the extension) and it appears everywhere the
product does.
