# Vercel Deployment

This project is deployed on Vercel as a static site with one cached Node.js API route.

## What changes on Vercel

- `api/lunch.js` fetches Kakao profile metadata for lunch images
- the lunch API uses Vercel cache headers with a 5-minute lifetime, so a new day's menu appears without Firebase or cron

## Vercel Project Settings

- Framework Preset: `Other`
- Root Directory: project root
- Build Command: `npm run build`
- Output Directory: leave empty
- Install Command: `npm install`

## Required Vercel environment variables

- `APP_PASSWORD`

## Notes

- the build step only injects the password hash into `index.html`
- GitHub Pages workflow was removed, so Vercel is the only deployment path
