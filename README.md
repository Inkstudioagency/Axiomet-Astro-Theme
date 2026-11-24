# Axiomet — Astro theme with Strapi CMS

Axiomet is a dark theme for technology consultancies built with [Astro](https://astro.build). Services, case studies and insights articles are managed in [Strapi](https://strapi.io), which is included in the `strapi/` folder with demo content.

- 21 pages: three home layouts, About, Services, Blog, three case study layouts, three contact layouts, Style Guide, Licenses, Changelog, Instructions, Password (401) and 404
- Detail pages generated from Strapi: `/service/[slug]`, `/project/[slug]` and `/blog/[slug]`
- Page-load and scroll animations, split-text headings, smooth scrolling, sliders, FAQ accordions, a full-screen menu, a background video, count-up numbers and contact forms
- Static output: no server needed in production, the site is rebuilt when content changes

## Requirements

- Node.js 22.23.4 or newer (Strapi supports Node 20 to 26)
- npm (any package manager works; the scripts below use npm)

## Quick start

```bash
# 1. Install the theme and the CMS
npm install
npm run cms:install

# 2. Configure Strapi (replace every "tobemodified" value with a random secret)
cp strapi/.env.example strapi/.env

# 3. Load the demo content into Strapi (services, case studies, articles and their images)
npm run cms:seed

# 4. Start Strapi on http://localhost:1337 (create your admin user at /admin)
npm run cms:dev

# 5. In a second terminal: configure and start Astro on http://localhost:4321
cp .env.example .env
npm run dev
```

`npm run build` writes the static site to `dist/`. The content is fetched from Strapi at build time, so Strapi must be reachable while building.

### Demo mode (no Strapi)

When `STRAPI_URL` is not set, the site is built from the demo content bundled in `strapi/data/seed.json` (the same data the seed scripts import), and its images are served from `/cms-demo/`. This lets you preview the theme with just `npm install && npm run build`. Set `STRAPI_URL` to switch to your Strapi content.

## Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `STRAPI_URL` | yes, for your own content | Base URL of the Strapi server, e.g. `http://localhost:1337`. Leave it unset to build with the demo content. |
| `STRAPI_TOKEN` | no | Read-only API token. Leave empty if the Public role can read the content (the seed scripts allow `find` and `findOne`). |
| `STRAPI_MEDIA` | no | By default the build downloads every Strapi image it uses into `dist/cms/`, so the deployed site does not depend on Strapi. Set it to `remote` to link to the Strapi URLs instead (e.g. when Strapi serves media from a CDN). |
| `PUBLIC_FORM_ENDPOINT` | no | URL that receives the contact forms (Formspree, Basin, Getform or your own API). Without it, forms show their success message but send nothing. |

The Strapi server has its own `strapi/.env` (secrets, database, `MCP_ENABLED`); see `strapi/.env.example`. Never commit either `.env` file.

## Project structure

```text
├── public/
│   ├── images/            # theme images, icons, logos and favicons
│   ├── videos/            # home page background video (mp4 + webm + poster)
│   ├── fonts/             # BDO Grotesk (headings)
│   └── js/                # interaction runtime (site.js) and jQuery
├── integrations/          # CMS media in the build (demo images, Strapi downloads)
├── src/
│   ├── components/
│   │   ├── layout/        # Header, Footer
│   │   ├── sections/      # page sections, one folder per page
│   │   ├── shared/        # call to action, social icons
│   │   ├── RichText.astro # Strapi rich text
│   │   └── SeoMeta.astro
│   ├── config/            # config.json (site settings), menu.json (navigation, footer)
│   ├── layouts/           # BaseLayout
│   ├── lib/               # Strapi client, demo content, queries, rich text renderer
│   ├── pages/             # routes, including service/, project/ and blog/ [slug] pages
│   ├── scripts/           # animations and forms (client side)
│   ├── styles/            # theme CSS
│   └── content.config.ts  # Strapi-backed content collections
└── strapi/                # Strapi 5 project (content types, seed data and scripts)
```

## Content model (Strapi)

| Collection | Fields | Used on |
| --- | --- | --- |
| **Service** | name, slug, order, short name, card image, short description, long summary, bigger picture text, challenge title, description, image and up to 4 challenges, expertise title, description, image and up to 4 areas of expertise (their titles are the service's feature list), SEO | Home service sections, `/service`, footer, `/service/[slug]` |
| **Project** | name, slug, order, category, image, client logo, stat value and label, summary, short description, client name, industry, location, engagement, timeline, team, overview, details (rich text), SEO | Home work sections, `/case-study-v1`, `/case-study-v2`, `/case-study-v3`, `/project/[slug]` |
| **Blog** | title, slug, order, category, image, date, read time, featured, short description, summary, content (rich text), quote, content after the quote (rich text), SEO | Home insights sections, About, `/blog`, `/blog/[slug]` |

Shared components: `shared.seo` (meta title and description) and `service.item` (title + description, used for challenges and expertise). Rich text uses Strapi's Blocks editor and is rendered with the template's rich text styles (`src/lib/blocks.ts`). Image alternative text comes from each file's **Alternative text** in the Media Library.

### Which entries appear where

Every list is sorted by the entry's **order** number (shown as `01`, `02`... on `/service`), like the collection lists of the original template:

- Home V1: the first three services; the three case studies and two articles with the highest order.
- Home V2 / V3: the three services, case studies and articles with the highest order.
- `/service`: every service, lowest order first. `/case-study-v1..v3`: case studies, highest order first.
- `/blog`: the featured article (`featured` on), then every other article, highest order first. About and article pages show the first articles by order.
- Related case studies on a case study page: the two other case studies with the highest order.
- Footer: every service, highest order first. The 404 page's "Single Pages" links point to the service, case study and article with the highest order.

The queries live in `src/lib/content.ts` and at the top of the section components (`src/components/sections`).

### Publishing changes

The site is static, so published changes appear after the next build. In production, add a webhook in Strapi (Settings > Webhooks) that calls your host's deploy hook on entry publish/unpublish.

### Strapi MCP server

The [Strapi MCP server](https://docs.strapi.io/cms/features/strapi-mcp-server) is enabled in `strapi/config/server.ts`, so AI assistants can list, create, update and publish services, case studies and articles and manage the Media Library. Create an admin token in the Strapi admin (Settings > Admin tokens), then connect, for example with Claude Code:

```bash
claude mcp add strapi-mcp --transport http http://localhost:1337/mcp -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

`npm run cms:seed:mcp` loads the demo content through the MCP server instead of directly; see `strapi/README.md` for the token permissions and caveats. Set `MCP_ENABLED=false` in `strapi/.env` to turn it off.

## Customization

- **Site settings, SEO defaults and footer texts**: `src/config/config.json`
- **Navigation menu, footer links and social links**: `src/config/menu.json`
- **Page titles and descriptions**: the `BaseLayout` props in each file in `src/pages`
- **Colors, spacing and typography**: the CSS variables at the top of `src/styles/axiomet.css`
- **Fonts**: Geist (body) and Instrument Serif are self-hosted through `fonts` in `astro.config.mjs`; BDO Grotesk (headings) lives in `public/fonts`
- **Forms**: set `PUBLIC_FORM_ENDPOINT`; the handler is `src/scripts/forms.ts`

### Animations

Animations are attached with attributes such as `to-top-0`, `to-top-2`, `title-animation` and `parallax`, and played by the interaction runtime in `public/js/site.js` (global `window.Axiomet`) with GSAP, which also runs the sliders, the menu, the FAQ accordions and the background video. Elements with `data-counter` count up when scrolled into view and Lenis provides smooth scrolling (`src/scripts/animations.ts`). The `/instructions` page summarises this.

## Deployment

Build with `npm run build` and deploy `dist/` to any static host (Netlify, Vercel, Cloudflare Pages, GitHub Pages...). Set `STRAPI_URL` (and `STRAPI_TOKEN` if used) in the host's build settings, and set `site.base_url` in `src/config/config.json` to your domain.

Deploy Strapi separately (Strapi Cloud, a VPS or a container), with a production database such as PostgreSQL; see `strapi/config/database.ts`.

## Troubleshooting

- **Build fails with "Could not reach Strapi"**: start Strapi (`npm run cms:dev`) or check `STRAPI_URL` in `.env`.
- **Build fails with a 401/403 from Strapi**: run `npm run cms:seed` (it allows public read access) or set `STRAPI_TOKEN`.
- **Strapi stops with "The upload folder ... doesn't exist"**: create `strapi/public/uploads` (it ships with a `.gitkeep`).
- **`An Application Control policy has blocked this file` on Windows**: Windows Smart App Control can block newly published native modules (Astro's compiler, sharp). Install the WebAssembly build of the blocked module without saving it, e.g. `npm install --no-save --force @astrojs/compiler-binding-wasm32-wasi` or `npm --prefix strapi install --no-save @img/sharp-wasm32`, or run the project in WSL.

## Credits

Designed by [Ink Studio](https://www.inks.studio/). Photos and videos are for demo purposes; replace them with your own.
