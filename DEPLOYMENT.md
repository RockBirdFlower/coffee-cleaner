# Vercel Deployment

This project is deployed on Vercel as a static site with one cached Node.js API route.

## What changes on Vercel

- `api/lunch.js` fetches Kakao profile metadata for lunch images
- the lunch API uses Vercel cache headers with a 5-minute lifetime, so a new day's menu appears without Firebase or cron

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

- GitHub Pages workflow was removed, so Vercel is the only deployment path
