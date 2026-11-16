# Vercel Deployment

This project is deployed on Vercel as a static site with one cached Node.js API route.

## What changes on Vercel

- `api/lunch.js` fetches Kakao profile metadata for lunch images
- the lunch API uses Vercel cache headers with a 15-minute lifetime, so a new day's menu appears without Firebase or cron

- `api/likes.js` keeps today's like counts in Abacus (`abacus.jasoncameron.dev`), a free counter service that needs no account or key
- like counts use one counter per restaurant per day; local and preview runs use a separate `-dev` namespace so they never touch production counts

## Vercel Project Settings

- Framework Preset: `Other`
- Root Directory: project root
- Build Command: leave empty (this project has no build step)
- Output Directory: leave empty
- Install Command: `npm install`

## Local development

- `npm run dev` serves the site and the real `api/lunch.js` at `http://127.0.0.1:3200`
- `npm run dev -- --lan` also opens it to devices on the same network, for testing on a phone
- the local server does not reproduce Vercel's CDN cache

## Notes

- `.vercelignore` keeps local-only files (`scripts/`, this document) out of the deployment
- GitHub Pages workflow was removed, so Vercel is the only deployment path
