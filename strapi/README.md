# Axiomet CMS (Strapi 5)

The content backend of the Axiomet Astro theme. It stores the services, case studies (projects) and insights articles; the Astro site reads them through the REST API at build time.

## Setup

```bash
npm install
cp .env.example .env   # then replace every "tobemodified" value with a random secret
npm run seed           # demo content + public read access
npm run develop        # http://localhost:1337/admin
```

`npm run seed` only runs on an empty database. Use `npm run seed -- --force` to delete the three collections and import the demo content again. `npm run seed:mcp` imports the same content into a running Strapi through the MCP server (see below).

## Content types

| Type | API | Notes |
| --- | --- | --- |
| Service | `/api/services` | `challenges` and `expertise` are repeatable `service.item` components (title + description, up to 4 each); the expertise titles are the service's feature list on the cards |
| Project | `/api/projects` | A case study. `details` uses the Blocks editor; `statValue` is text so values such as `41%` or `3×` work (numbers count up on the site) |
| Blog | `/api/blogs` | `featured` marks the article shown first on `/blog`; `content` and `contentAfterQuote` use the Blocks editor, with `quote` displayed between them |

Every type has an `order` number that sorts the lists on the site (shown as `01`, `02`... on the services page) and an optional `seo` component (`shared.seo`: meta title and description). All three use Draft & Publish; the site only shows published entries. Schemas live in `src/api/*/content-types/*/schema.json` and `src/components`.

## Demo data

`data/seed.json` and `data/uploads/` hold the demo content. Each image is uploaded with its own alternative text, which the theme uses as the `alt` attribute. The Astro site also reads `data/seed.json` directly when it is built without a Strapi server (demo mode).

## MCP server

The [Strapi MCP server](https://docs.strapi.io/cms/features/strapi-mcp-server) (Strapi 5.47+, Media Library tools 5.54+) is enabled in `config/server.ts` (`MCP_ENABLED` in `.env`). It listens on `POST /mcp` (Streamable HTTP) and authenticates with an **admin token** (Settings > Admin tokens), not an API token.

```bash
claude mcp add strapi-mcp --transport http http://localhost:1337/mcp -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

The tools a client sees follow the token's permissions. A token with read, create, update and publish on Service, Project and Blog plus Media Library read, create and update exposes `list_service`, `get_service`, `create_service`, `update_service`, `publish_service`, `unpublish_service`, `discard_service_draft`, the same for `project` and `blog`, and the `media_*` tools. Grant delete only if the assistant should be able to delete entries.

To load the demo content through MCP, start Strapi, create an admin user and such a token, then run:

```bash
STRAPI_URL=http://localhost:1337 STRAPI_ADMIN_EMAIL=you@example.com STRAPI_ADMIN_PASSWORD=... STRAPI_MCP_TOKEN=... npm run seed:mcp
```

It uploads the images with the admin Upload API (the MCP server cannot upload files), sets their alternative texts with `media_update_asset`, creates and publishes every entry with `create_*` / `publish_*`, checks them with `list_*`, and allows public read access. Entries and files that already exist are skipped.

Good to know:

- `update_*` validates the whole entry, so an update must include the type's required fields, not only the field being changed.
- Media fields take the numeric id of an existing asset (find it with `media_list_assets`).
- Created and updated entries are drafts until `publish_*` is called. The site shows them after the next build.
- Content types themselves are edited in the Content-Type Builder or in the schema files, not through MCP.

## Troubleshooting

- **`The upload folder ... doesn't exist`**: create `public/uploads` (the repository ships it with a `.gitkeep`).
- **`Could not load the "sharp" module` / `An Application Control policy has blocked this file` on Windows**: Windows Smart App Control is blocking the native image library that Strapi's Media Library uses. Run Strapi in Docker or WSL, or install sharp's WebAssembly build (`npm install --no-save @img/sharp-wasm32`, repeat after each `npm install`).
- **`Too many requests` on admin login**: Strapi rate-limits admin logins; wait a few minutes or restart the server.

## Production

- Use PostgreSQL or MySQL instead of SQLite (`config/database.ts`, `DATABASE_*` variables).
- Run `npm run build` then `npm run start`.
- Add a webhook (Settings > Webhooks) that triggers a rebuild of the Astro site when entries are published or unpublished.
- If you prefer not to expose the API publicly, remove the Public role's `find`/`findOne` permissions and give the site a read-only API token (`STRAPI_TOKEN`).
