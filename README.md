# Trainee Project Management

Full-stack app: React (Vite) frontend + Express API + MongoDB. Sign up / sign in, trainee profiles, and admin dashboard.

## Local development

1. **Install** (from repo root):
   ```bash
   npm install
   ```

2. **Environment**  
   Copy `server/.env.example` to `server/.env` and set:
   - `MONGO_URI` – MongoDB connection string (e.g. MongoDB Atlas)
   - `JWT_SECRET` – secret for JWT signing (min 32 chars)
   - `ADMIN_EMAIL` / `ADMIN_PASSWORD` – used to seed the admin user

3. **Seed admin** (once):
   ```bash
   npm --workspace server run seed-admin
   ```

4. **Run**:
   - API: `npm run dev:server` (port 5000)
   - Client: `npm run dev:client` (port 3000, proxies `/api` to server)

## Deploy to Vercel

1. **Connect** the repo to Vercel (Import Git Repository).

2. **Build settings** (use repo root):
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

3. **Environment variables** (Project → Settings → Environment Variables). Set for Production (and Preview if you want):
   - `MONGO_URI` – your MongoDB connection string (e.g. Atlas)
   - `JWT_SECRET` – strong secret (min 32 chars)
   - `ADMIN_EMAIL` – admin login email
   - `ADMIN_PASSWORD` – admin login password

4. **Deploy.** After the first deploy, create the admin user in your **production** DB by running once from your machine:
   ```bash
   cd server
   set MONGO_URI=<your-production-mongo-uri>
   set JWT_SECRET=<your-production-jwt-secret>
   set ADMIN_EMAIL=admin@example.com
   set ADMIN_PASSWORD=YourAdminPassword123!
   node seedAdmin.js
   ```
   (Use `export` instead of `set` on macOS/Linux.)

5. **Check API:** open `https://your-app.vercel.app/api/health`. You should see `{"ok":true,"mongo":"connected",...}` when DB and env are correct.

Sign-in and sign-up use the same API and MongoDB; data is stored in the database you configure with `MONGO_URI`.
