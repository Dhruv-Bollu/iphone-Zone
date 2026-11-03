# iPhone Zone — Netlify (site) + Vercel (API) + Supabase (database)

```
frontend/   → Netlify (static site: index.html + config.js)
backend/    → Vercel  (serverless API in /api)
supabase/   → schema.sql (run once)
```

## 1. Supabase
1. Create a project at supabase.com.
2. SQL Editor → paste `supabase/schema.sql` → Run.
3. Project Settings → API: copy the **Project URL** and the **service_role** key (secret — only for Vercel).

## 2. Vercel (backend)
1. Easiest: install Node.js, then in a terminal run `cd backend`, `npm i -g vercel`, `vercel login`, `vercel` (accept defaults). Or push the folder to GitHub and import it in Vercel with Root Directory = `backend`.
2. Environment variables (see `backend/.env.example`):
   `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_ID`, `ADMIN_PASSWORD`, `JWT_SECRET` (long random string), `ALLOWED_ORIGIN` (your Netlify URL, no trailing slash).
3. Add the variables in Vercel → Project → Settings → Environment Variables, then run `vercel --prod` (or Redeploy). Test: `https://YOUR-API.vercel.app/api/public` should return JSON.

## 3. Netlify (frontend)
1. Edit `frontend/config.js` → `window.API_URL = 'https://YOUR-API.vercel.app';`
2. Drag the `frontend` folder onto Netlify (app.netlify.com/drop), or connect a repo with publish directory `frontend`.
3. Set `ALLOWED_ORIGIN` on Vercel to the final Netlify URL and redeploy the API.

## 4. First run
Open `https://YOUR-SITE.netlify.app/#admin` → sign in with your `ADMIN_ID` and `ADMIN_PASSWORD` (the values you set in Vercel).
Settings → **Load sample iPhones & reviews** (optional) or add your real stock under Products.
Edit WhatsApp number, phone, Diwali offer; upload photos with “+ Images” (max 6 per phone; ✕ removes one).
Changes are saved to Supabase automatically and appear on the public site within ~20 seconds.

## Daily use
- Update price/stock: Admin → Products → change the price or stock; the “last updated” time changes automatically.
- Today's Deals: tick “in Today's Deals”, or set a ₹ discount with start/end dates.
- Reviews: Admin → Reviews. Delete the DEMO ones and add genuine reviews only.

## Testing checklist
- [ ] `/api/public` returns JSON; site shows your products
- [ ] Wrong admin password is rejected; right one logs in
- [ ] Change a price → public site shows it after refresh
- [ ] Mark a colour out of stock → it is greyed out on the product page
- [ ] Upload 3–4 images; remove one with ✕; product page gallery updates
- [ ] Diwali offer disappears after its end date
- [ ] WhatsApp button opens chat with model, storage and colour filled in
- [ ] Call Us dials; mobile layout has no horizontal scroll

## Security notes
- The service-role key and admin password live only in Vercel env vars.
- Tables have Row Level Security on and no public policies; only the API can write.
- Login is limited to 5 wrong tries per 15 min per IP (best effort on serverless). For production add Vercel Firewall rate limits for `/api/login` and `/api/click`.
- Uploaded images are checked for type and size (≤3 MB); the browser resizes them first.
- Removing an image in admin unlinks it from the product; delete unused files in Supabase Storage if you want to reclaim space.
- Data model is simple JSON documents per product (easy to edit, fine for a shop catalogue). Online checkout is not included.

## Photos
Admin → Products → **+ Images** on a phone (max 6, ✕ removes one). The first photo is used on the card, in the product gallery, and in the hero and scroll animation. Use transparent-background PNG/WebP photos for the best look.
