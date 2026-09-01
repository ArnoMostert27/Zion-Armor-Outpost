# Deploying Zion Armor Outpost

Three services: a MongoDB Atlas cluster, the Express API on Render, and the
React client on Vercel. All three have free tiers that comfortably run this app.

Total time if nothing goes wrong: about 30 minutes.

---

## Before you start

Push the code to GitHub first — Render and Vercel both deploy from the repo.

```bash
git add .
git commit -m "Add deployment configuration"
git push
```

Check that `.env` is **not** in the push. `git status` should not list it, and
`.gitignore` already excludes it.

---

## 1. MongoDB Atlas

1. Sign up at [mongodb.com/atlas](https://www.mongodb.com/atlas) and create a
   free **M0** cluster. Pick the region closest to you.
2. **Database Access** → Add New Database User. Username and password, built-in
   role **Read and write to any database**. Save the password somewhere — you
   only see it once, and it goes in your connection string.
3. **Network Access** → Add IP Address → **Allow access from anywhere**
   (`0.0.0.0/0`). Render's outbound IPs are not fixed on the free tier, so
   restricting by IP will break the connection.
4. **Database** → Connect → Drivers. Copy the connection string. It looks like:

   ```
   mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

5. Edit it: replace `<password>` with the real password, and insert the database
   name before the `?`:

   ```
   mongodb+srv://arno:realpassword@cluster0.xxxxx.mongodb.net/zion-armor-outpost?retryWrites=true&w=majority
   ```

   If your password contains `@`, `:`, `/` or `#` you must URL-encode it, or the
   connection string will not parse.

### Seed the live database

Point your local `.env` at Atlas temporarily and run the seeder:

```bash
# server/.env — swap MONGO_URI for the Atlas string, then:
npm run seed
```

Change it back to your local URI afterwards so local development keeps using the
local database.

---

## 2. The API on Render

The repo includes `render.yaml`, so this is mostly automatic.

1. Sign up at [render.com](https://render.com) with your GitHub account.
2. **New** → **Blueprint** → select the `Zion-Armor-Outpost` repository.
3. Render reads `render.yaml` and proposes a web service. Approve it.
4. Two variables are marked `sync: false`, meaning you fill them in yourself:

   | Variable | Value |
   |---|---|
   | `MONGO_URI` | your Atlas connection string from step 1 |
   | `CLIENT_URL` | leave blank for now — you get this in step 3 |

   `JWT_SECRET` is generated for you. `NODE_ENV` is already `production`.

5. Deploy. When it finishes, visit `https://your-api.onrender.com/api/health`.
   You should see `{"status":"standing", ...}`.

**Note on the free tier:** Render spins the service down after 15 minutes idle.
The first request after that takes 30–50 seconds to wake it. That is normal, but
if you are demonstrating live, load the health endpoint a minute beforehand so
the marker does not sit watching a spinner.

---

## 3. The client on Vercel

1. Sign up at [vercel.com](https://vercel.com) with GitHub.
2. **Add New** → **Project** → import the repository.
3. Set **Root Directory** to `client`. Vercel detects Vite and reads
   `client/vercel.json` for the rest.
4. Add one environment variable:

   | Variable | Value |
   |---|---|
   | `VITE_API_URL` | `https://your-api.onrender.com` — no trailing slash |

5. Deploy. You get a URL like `https://zion-armor-outpost.vercel.app`.

---

## 4. Close the loop

Go back to Render → your service → **Environment**, and set:

```
CLIENT_URL = https://zion-armor-outpost.vercel.app
```

No trailing slash. This is what the CORS check compares against, so a mismatch
here is the single most common reason a deployed build "can log in locally but
not in production".

If you also want Vercel preview deploys to work, `CLIENT_URL` accepts a
comma-separated list:

```
CLIENT_URL = https://zion-armor-outpost.vercel.app,https://zion-armor-outpost-git-main-arno.vercel.app
```

Save. Render redeploys automatically. Test the live site.

---

## Alternative: one service instead of three

`server.js` already serves `client/dist` when `NODE_ENV=production`, so you can
run the whole app from Render alone.

- Root directory: leave blank (the repo root)
- Build command: `npm run install:all && npm run build`
- Start command: `npm start`
- Environment: `NODE_ENV`, `MONGO_URI`, `JWT_SECRET`. No `CLIENT_URL` or
  `VITE_API_URL` needed — same origin means no CORS at all.

Simpler to configure and fewer things to mismatch. The trade-off is that the
front end loses Vercel's CDN, so first paint is slower and every asset request
also has to wake the sleeping free-tier service.

---

## Before you hand it in

- [ ] Change the seeded passwords, or delete the demo users entirely
- [ ] Confirm `JWT_SECRET` in production is not the value from `.env.example`
- [ ] Sign in on the live site and place a test order end to end
- [ ] Open the live site on a phone — check the hero, the motion comic and the forge
- [ ] Hard-refresh on a deep link like `/racks` to confirm SPA routing works
- [ ] Check the browser console on the live site for errors
- [ ] Run `npm test` one last time

---

## Troubleshooting

**"Not authorised" immediately after signing in on the live site**
`CLIENT_URL` on Render does not exactly match the Vercel URL. Check for a
trailing slash, `http` vs `https`, or a `www.` prefix.

**The client loads but every request 404s**
`VITE_API_URL` is missing or wrong on Vercel. Note that Vite bakes environment
variables in at build time — after changing it you must **redeploy**, not just
restart.

**`MongoServerError: bad auth`**
The password in the connection string is wrong, or contains a character that
needs URL-encoding.

**The API times out connecting to Atlas**
Network Access is not set to `0.0.0.0/0`.

**Deep links 404 on refresh**
The SPA rewrite is missing. `vercel.json` and `netlify.toml` both handle this —
make sure the root directory is set to `client` so the platform finds them.

**The 3D hero does not appear on a phone**
Expected on some devices. The hero checks for WebGL and falls back to a static
icon grid, and it also respects the reduced-motion setting.
