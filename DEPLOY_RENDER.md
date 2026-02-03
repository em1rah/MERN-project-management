# Deploy this project on Render (via GitHub)

Follow these steps to deploy the full app (frontend + API + database) on Render by importing your GitHub repository.

---

## Prerequisites

- The project is in a **GitHub repository** (pushed and up to date).
- A **MongoDB** database (e.g. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) free tier). You need the connection string (e.g. `mongodb+srv://user:pass@cluster.mongodb.net/trainee-db`).

---

## Step 1: Sign in to Render

1. Go to [https://render.com](https://render.com).
2. Sign in (or create an account). You can use **Sign in with GitHub** to connect your GitHub account.

---

## Step 2: Create a new Web Service

1. From the **Dashboard**, click **New +**.
2. Choose **Web Service**.

---

## Step 3: Connect your GitHub repository

1. If this is your first time, click **Connect account** next to GitHub and authorize Render.
2. Find your repository in the list (e.g. `trainee-project-management`) and click **Connect** next to it.
3. If you don’t see it, click **Configure account** and grant access to the org or repo that contains the project, then try again.

---

## Step 4: Configure the Web Service

Use these settings (leave the rest as default unless you know you need to change them).

| Field | Value |
|--------|--------|
| **Name** | Any name (e.g. `trainee-project-management`). This becomes part of the URL: `https://<name>.onrender.com`. |
| **Region** | Choose the one closest to you or your users. |
| **Branch** | `main` or `master` (the branch you deploy from). |
| **Root Directory** | Leave **empty** (project root). |
| **Runtime** | **Node**. |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |

- **Build Command:** installs dependencies and builds the React app into `dist/`.
- **Start Command:** runs `npm start`, which starts the Node server that serves the API and the built frontend.

---

## Step 5: Choose a plan

- Select **Free** or **Starter** (or another plan if you prefer).
- Free tier sleeps after inactivity; the first request after sleep can be slow.

---

## Step 6: Add environment variables

Before deploying, add the variables the server needs.

1. In the same setup screen, find **Environment Variables** (or **Environment**).
2. Click **Add Environment Variable** and add each of these (use your real values):

| Key | Value | Notes |
|-----|--------|--------|
| `MONGO_URI` | Your MongoDB connection string | e.g. `mongodb+srv://user:pass@cluster.mongodb.net/trainee-db?retryWrites=true&w=majority` |
| `JWT_SECRET` | A long random string | At least 32 characters; use a password generator if needed. |
| `ADMIN_EMAIL` | Admin login email | Email you’ll use to sign in as admin. |
| `ADMIN_PASSWORD` | Admin login password | Strong password for the admin account. |

3. Save each variable. You can add more later under the service’s **Environment** tab.

---

## Step 7: Deploy

1. Click **Create Web Service**.
2. Render will clone the repo, run `npm install && npm run build`, then `npm start`.
3. Wait for the build and deploy to finish (first time can take a few minutes). The log will show “Build successful” and then that the server is running.

---

## Step 8: Create the admin user (one time)

The app uses MongoDB for users. You need to create the admin user in that database once.

1. On your **own machine**, open a terminal in the project.
2. Go to the `server` folder and run the seed script, using the **same** values you set on Render (same `MONGO_URI`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`).

**Windows (PowerShell or CMD):**

```bash
cd server
set MONGO_URI=your-mongodb-connection-string-here
set JWT_SECRET=your-jwt-secret-here
set ADMIN_EMAIL=your-admin@example.com
set ADMIN_PASSWORD=YourAdminPassword123!
node seedAdmin.js
```

**macOS / Linux:**

```bash
cd server
export MONGO_URI="your-mongodb-connection-string-here"
export JWT_SECRET="your-jwt-secret-here"
export ADMIN_EMAIL="your-admin@example.com"
export ADMIN_PASSWORD="YourAdminPassword123!"
node seedAdmin.js
```

3. You should see something like: `Admin created: your-admin@example.com`.

---

## Step 9: Verify the deployment

1. **App URL**  
   In the Render dashboard, open your service and copy the URL (e.g. `https://trainee-project-management.onrender.com`). Open it in a browser — you should see the app (landing, sign up, sign in).

2. **API / database**  
   Visit:  
   `https://<your-service-name>.onrender.com/api/health`  
   You should see something like:  
   `{"ok":true,"mongo":"connected","hasJwt":true}`  

3. **Sign in as admin**  
   Go to the app → Sign in → use the same `ADMIN_EMAIL` and `ADMIN_PASSWORD` you set in Render and used in the seed script. You should land on the admin dashboard.

---

## Summary

| What | Value |
|------|--------|
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Env vars** | `MONGO_URI`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` |
| **After first deploy** | Run `node seedAdmin.js` locally with the same env to create the admin user. |

After that, the whole project runs on Render: the same server serves the React app and the API, and all data (sign up, sign in, users) is stored in your MongoDB database.
