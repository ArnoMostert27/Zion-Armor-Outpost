# Deploying Zion Armor Outpost

Two services: a MongoDB Atlas cluster for the data, and Vercel for everything
else. The React client and the Express API deploy together from one repository,
so they share an origin and there is no CORS to configure.

Both are free.

---

## How it fits together on Vercel

```
one Vercel project
├── client/dist          static React build, served from the CDN
└── api/index.js         serverless function
        └── imports server/app.js — the same Express app you run locally
```

`vercel.json` sends `/api/*` to the function and everything else to the React
app. Because both live on the same domain, the client calls `/api/products` with
no base URL at all.

**What changed to make this work**

- `server/app.js` builds and exports the Express app. It does not connect to the
  database and does not call `listen()`.
- `server/server.js` is the local entry point: connect, then listen.
- `api/index.js` is the Vercel entry point: connect, then hand the request to
  the same app.
- `server/config/db.js` caches the connection on `globalThis`. Serverless reuses
  warm processes, so without caching every request would open a new connection
  pool and exhaust Atlas within minutes.

Local development is unchanged: `npm run dev` still runs a normal Node server.

---

## 1. MongoDB Atlas

You have already done most of this.

1. Free **M0** cluster created.
2. **Database Access** — a user with read/write access.
3. **Network Access** → **Allow access from anywhere** (`0.0.0.0/0`).
   Vercel's functions have no fixed outbound IPs, so anything narrower will fail
   — and it fails as a silent timeout, not a clear error.
4. Your connection string, with the database name and query params added:

   ```
   mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/zion-armor-outpost?retryWrites=true&w=majority
   ```

### Seed it

Point `server/.env` at Atlas temporarily and run:

```bash
npm run seed
```

Expect `[seeder] Outpost stocked.` and a host ending in `mongodb.net`. Then put
your local URI back.

---

## 2. Push

```bash
git add .
git commit -m "Deploy to Vercel as a single project"
git push
```

Check `.env` is not in the push. Your `.gitignore` should include `*.env` so a
file like `atlascredentials.env` cannot slip through — plain `.env` only matches
a file with exactly that name.

---

## 3. Vercel

1. Sign up at [vercel.com](https://vercel.com) with GitHub.
2. **Add New** → **Project** → import `Zion-Armor-Outpost`.
3. **Root Directory: leave it as the repository root.** Not `client`. The root
   `vercel.json` builds the client and picks up the API function; pointing at
   `client` would deploy the front end with no API behind it.
4. Leave the build settings alone — `vercel.json` supplies them.
5. Add environment variables:

   | Name | Value |
   |---|---|
   | `MONGO_URI` | your Atlas connection string |
   | `JWT_SECRET` | a long random string — generate one, do not reuse the example |
   | `NODE_ENV` | `production` |
   | `DEMO_MODE` | `true` |

   No `VITE_API_URL` and no `CLIENT_URL`. Same origin means neither is needed.

6. **Deploy.**

### Generating a JWT secret

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

---

## 4. Check it

- `https://your-app.vercel.app/api/health` → `{"status":"standing","runtime":"vercel-serverless"}`
- The home page loads with the 3D hero
- **Try it as a demo visitor** on the sign-in screen signs you straight in
- Add to the satchel, then place a demo order end to end
- Hard-refresh on `/racks` — a deep link must not 404

If the health check returns `"runtime":"node"` something is serving the old
build. If it 404s, the root directory is set to `client` instead of the root.

---

## Demo mode

`DEMO_MODE=true` means orders are placed, XP is awarded and badges unlock
exactly as normal — but stock is never decremented.

Without it, every visitor who tests checkout permanently reduces your inventory,
and within a few months a portfolio site reads "Rack Empty" across half the
store. Stock is still validated on every order, so the logic remains visible in
the code; it simply is not written back.

Set `DEMO_MODE=false` for real inventory behaviour.

---

## Troubleshooting

**`/api/*` returns 404**
Root directory is set to `client`. It must be the repository root.

**"The outpost cannot reach its records"**
`MONGO_URI` is wrong or Atlas Network Access is not `0.0.0.0/0`. Check the
function logs under Vercel → your project → **Logs**.

**`MongoServerError: bad auth`**
Wrong password, or it contains a character needing URL encoding (`@ : / # %`).

**Signing in works, then requests 401**
`JWT_SECRET` is missing in Vercel. It must be set, and changing it invalidates
every existing token.

**First request is slow**
Serverless cold start, roughly a second. Subsequent requests are warm.

**Deep links 404 on refresh**
The SPA rewrite is missing — confirm `vercel.json` is at the repository root.

---

## Before sharing the link

- [ ] Rotate the Atlas password if it has ever been pasted anywhere
- [ ] `JWT_SECRET` is a real random value, not from `.env.example`
- [ ] Place a test order on the live site
- [ ] Open it on a phone
- [ ] Check the browser console for errors
- [ ] `npm test` passes

---

## Other hosts

`render.yaml`, `client/vercel.json` and `client/netlify.toml` are left over from
the earlier three-service setup and are not used by this deployment. They do no
harm — Vercel only reads the `vercel.json` at the repository root — but they can
be deleted if you want the repo tidy.
