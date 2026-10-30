# Marketing website

The public website for selling the clinic manager as a SaaS product: a landing page (features, how it works, pricing, FAQ) and a **Book a demo** page. It's a separate Next.js app from the clinic app in `apps/web`, so it can live on its own domain while each clinic uses the app.

## Run it

From the repo root:

```bash
npm run dev:site     # http://localhost:3001
npm run build:site   # production build; every page is static
```

## Before you launch

Everything you'd change lives in [`lib/site.ts`](lib/site.ts):

| What | Where | Now |
|---|---|---|
| Product name | `site.name` | `Clinicdesk` (a placeholder) |
| Domain shown in the screenshots' address bar | `site.domain` | `clinicdesk.pk` |
| Plans, prices and limits | `plans` | Placeholder prices in PKR |
| Free months on yearly billing | `YEARLY_MONTHS_CHARGED` | 10 months charged, 2 free |

Contact details come from environment variables. Copy `.env.example` to `.env.local` for local use, or set them in your hosting dashboard:

| Variable | What it does |
|---|---|
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Where demo requests go, e.g. `923001234567`. Shows the WhatsApp buttons. |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Email option on the demo form and in the footer. |
| `NEXT_PUBLIC_SITE_URL` | The site's public address, for link previews and the sitemap. Vercel fills this in. |
| `NEXT_PUBLIC_APP_URL` | Shows a **Sign in** link pointing here. Leave empty to hide it. |

With neither WhatsApp nor email set, the demo form says requests aren't available, so set at least one.

**How demo requests work.** There's no backend. The form checks the details, then opens WhatsApp (or the visitor's email app) with a message already written: name, clinic, type of clinic, city, branches, plan and phone. The visitor presses send, and the request arrives in your WhatsApp or inbox.

Also review the copy before launch. These statements are claims or promises you need to be happy to stand behind:
- "Built inside a working clinic" in `components/sections/trust.tsx`
- The plan features, such as guided setup and priority support, in `lib/site.ts`
- "We'll help you add your branches, price list and team" in the FAQ

## Deploy

On Vercel, add a third project from this repo with **Root Directory** set to `apps/site` and the environment variables above. Nothing else is needed: the site has no database or API.

## Screenshots

`public/screenshots/` holds real screenshots of the clinic app. They were taken against a separate, throwaway database filled with fictional demo data for a made-up clinic, "Lumen Health". No real clinic or patient data is in them. [`lib/screenshots.ts`](lib/screenshots.ts) lists the ones the site uses and their sizes.

When the app's screens change, take them again with one command from the repo root:

```bash
npm run screenshots -w @daesthetics/site
```

It needs `mongod` (MongoDB) and Google Chrome installed, and ports 27077 and 5077 free. It starts its own MongoDB in a temporary folder and its own API, fills them with [`scripts/seed-demo.mjs`](scripts/seed-demo.mjs), then drives the web app (port 3000; reused if it's already running) and saves the images. Your own database and API are never touched, and everything it started is stopped and deleted at the end. The demo data is dated relative to today, so the calendar and dashboard always look current.

The demo clinic's name is changed in the page text just before each capture, because the app shows its own clinic name (`apps/web/lib/clinic-info.ts`).
