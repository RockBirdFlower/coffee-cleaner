# Vercel Deployment

This project is deployed on Vercel as a static site with one cached Node.js API route.

## What changes on Vercel

- `index.html` calculates the cleaner from the current weekday in `Asia/Seoul`
- `api/lunch.js` fetches Kakao profile metadata for lunch images
- the lunch API uses Vercel cache headers, so the result is effectively refreshed once per day without Firebase or cron

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
- the weekday owner is fixed:
- Monday `강궁현`
- Tuesday `김정태`
- Wednesday `손형수`
- Thursday `유지헌`
- Friday `이용혁`
- Saturday and Sunday show no assigned cleaner
- GitHub Pages workflow was removed, so Vercel is the only deployment path
