# Nomad Places

A community map for the places worth remembering. People can add a spot, describe why it matters, sort it into a tag, and share it with everyone else. Built with Astro, Svelte, and Cloudflare's developer platform.

There is no hosted demo in this repository. Run it locally or deploy it to your own Cloudflare account.

## Features

- Email and password accounts, plus Google sign in
- Add a place with a name, short summary, longer description, map link, and tag
- Automatic Google Static Maps preview, stored in Cloudflare R2
- AI written summaries and descriptions through GitHub Models
- Public map, all places list, and tag pages
- Personal collection for signed in users
- Upvoting on public places
- Admin role that can see and edit every place, including private ones
- Password reset email through Resend
- Responsive Tailwind and FlyonUI interface
- Playwright tests for sign in and adding a map

## Stack

| Layer | Choice |
| --- | --- |
| Framework | Astro 5, server output |
| UI islands | Svelte 5 |
| Hosting | Cloudflare Workers |
| Database | Cloudflare D1 with Drizzle ORM |
| Auth | Better Auth, email/password and Google OAuth |
| Media | Cloudflare R2 |
| Email | Resend |
| Maps | Google Static Maps API with URL signing |
| AI | Azure AI Inference against GitHub Models (`mistral-small-2503`) |
| Styling | Tailwind CSS 4, FlyonUI |
| Testing | Playwright |

## How it works

Astro renders every page on the Worker. Svelte components hydrate the interactive pieces: the map, place lists, forms, and voting.

- `src/middleware.ts` initializes Better Auth with the D1 binding on every request and puts the session on `Astro.locals`.
- `src/actions/index.ts` contains the server actions for reading, creating, updating, deleting, searching, and voting on places.
- Creating a place calls the Google Static Maps API, signs the URL with HMAC SHA1, downloads the image, and writes it to the `MEDIA` R2 bucket.
- Images are served through `/api/r2/[...key]` rather than directly from R2.
- Place rows store the R2 object key, and pages build the public image URL from `IMAGE_BASE_URL`.

## Requirements

- Node.js 20 or newer
- npm
- A Cloudflare account with Wrangler access
- A Google Cloud project with the Static Maps API enabled
- Google OAuth credentials
- A Resend account and a verified sending domain
- A GitHub token with access to GitHub Models

## Quick start

```bash
npm install
```

Create a `.env` file for the values Astro reads at build time:

```dotenv
BETTER_AUTH_SECRET=replace-with-a-long-random-string
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_MAPS_API_KEY=your-static-maps-key
GOOGLE_MAPS_SIGNING_SECRET=your-static-maps-signing-secret
RESEND_API_KEY=your-resend-key
```

Create a `.dev.vars` file for the values the Worker reads at runtime:

```dotenv
AI_TOKEN=your-github-models-token
IMAGE_BASE_URL=http://localhost:4321/api/r2
```

`.dev.vars` is gitignored. Use `http://localhost:8787/api/r2` when running `npm run preview`, and your Worker URL in production.

### Cloudflare resources

The bindings are declared in `wrangler.jsonc`:

- D1 database `cfw-places-auth`, binding `DB`
- R2 bucket `places-images`, binding `MEDIA`
- Static assets binding `ASSETS`

Create them in your account:

```bash
npx wrangler d1 create cfw-places-auth
npx wrangler r2 bucket create places-images
```

Copy the new D1 `database_id` into `wrangler.jsonc`, replacing the committed one.

### Database

Drizzle schema and migrations live in `src/db/` and `drizzle/`.

```bash
npm run db:gen
npm run migrate:local
npm run migrate:remote
```

The schema covers Better Auth's `user`, `session`, `account`, and `verification` tables, plus `places` and `votes`.

### Run it

```bash
npm run dev
```

The Astro dev server runs at <http://localhost:4321> and proxies Cloudflare bindings through Wrangler.

The Google OAuth redirect URI is `/api/auth/callback/google`. Add both the local and production URLs to the Google Cloud console and to Better Auth's trusted origins.

## Environment variables

| Variable | Read by | Purpose |
| --- | --- | --- |
| `BETTER_AUTH_SECRET` | Astro build | Signs sessions and tokens |
| `GOOGLE_CLIENT_ID` | Astro build | Google OAuth client |
| `GOOGLE_CLIENT_SECRET` | Astro build | Google OAuth secret |
| `GOOGLE_MAPS_API_KEY` | Astro build | Static Maps requests |
| `GOOGLE_MAPS_SIGNING_SECRET` | Astro build | HMAC signing for Static Maps |
| `RESEND_API_KEY` | Astro build | Password reset email |
| `AI_TOKEN` | Worker runtime | GitHub Models inference |
| `IMAGE_BASE_URL` | Worker runtime | Public base URL for R2 images |

`import.meta.env` values are inlined at build time. Treat them as build secrets and do not commit `.env`. Runtime values belong in `.dev.vars` locally and in `wrangler secret put` for production.

## Scripts

| Command | Action |
| --- | --- |
| `npm run dev` | Astro dev server with Cloudflare bindings |
| `npm run build` | Build the Worker and assets |
| `npm run preview` | Build, then run the Worker locally with Wrangler |
| `npm run deploy` | Build and deploy with Wrangler |
| `npm run db:gen` | Generate a Drizzle migration |
| `npm run db:push` | Push the schema directly to the database |
| `npm run db:migration` | Apply Drizzle migrations |
| `npm run migrate:local` | Apply migrations to local D1 |
| `npm run migrate:remote` | Apply migrations to remote D1 |
| `npm run cf-typegen` | Regenerate Wrangler binding types |

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Map and place feed |
| `/maps` | Map focused view |
| `/all-maps` | Every public place |
| `/tags/[tag]` | Places filtered by tag |
| `/signin`, `/signup` | Authentication |
| `/forgot`, `/reset` | Password reset |
| `/privacy`, `/terms`, `/cookies` | Legal pages |
| `/api/auth/[...all]` | Better Auth handler |
| `/api/r2/[...key]` | R2 image proxy |

Tags are fixed to `food`, `accommodation`, `cafes-with-wifi`, `attractions`, and `mixed`.

## Server actions

`createPlace`, `getPlaces`, `getTopPlaces`, `getPlacesByTag`, `getPlacesForUser`, `updatePlace`, `deletePlace`, `searchPlaces`, `Vote`, `getCity`, and `getDescription`.

Every mutation checks the session. Admins can edit any place. Everyone else can only edit their own.

## Tests

```bash
npx playwright test
```

The suite covers signing in and adding a place. Playwright starts `npm run dev` on port 4321 automatically unless a dev server is already running.

## Deployment

```bash
npm run build
npx wrangler deploy
```

Set the runtime secrets before the first deploy:

```bash
npx wrangler secret put AI_TOKEN
npx wrangler secret put IMAGE_BASE_URL
```

Because the auth and Maps values are read through `import.meta.env`, they must be present in the build environment. On CI, provide them as build secrets.

Set `IMAGE_BASE_URL` to your Worker URL plus `/api/r2`, then update the Google OAuth redirect URI and the Resend sender domain for that host.

## Security notes

- Rotate any key that has ever been committed or shared in a build log.
- The default Resend sender is `auth@places.com`. Replace it with an address on a domain you have verified.
- Better Auth's admin plugin is enabled. Promote an admin deliberately, and review the role check in the place update action before opening sign ups.
- The committed D1 database ID points at the original project. Replace it, or your deploy will fail against an account that does not own it.

## Project structure

```text
/
├── drizzle/                 # SQL migrations
├── public/
├── src/
│   ├── actions/             # Server actions and AI/Maps helpers
│   ├── components/          # Astro and Svelte UI
│   ├── db/                  # Drizzle schema
│   ├── layouts/
│   ├── pages/               # Routes and API handlers
│   ├── styles/
│   └── middleware.ts        # Auth session and D1 setup
├── tests/                   # Playwright specs
├── utils/                   # Auth client and server setup
├── astro.config.mjs
├── drizzle.config.ts
└── wrangler.jsonc
```

## License

No license has been declared for this repository.
