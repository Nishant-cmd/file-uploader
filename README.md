# File Uploader

A small file drive built with Express, EJS, Prisma, PostgreSQL, and Supabase Storage.

## Features

- Sign up and log in, with per-user file and folder access.
- Create nested folders, rename them, or delete a folder and its contents.
- Upload JPEG, PNG, and PDF files up to 10 MB to a private Supabase Storage bucket.
- Browse file metadata and download files.
- Create public, read-only folder links that expire after 1, 10, or 30 days.

## Local setup

Use Node.js 20 or newer and a Supabase project. Supabase hosts both this app's PostgreSQL database and its file storage. `DATABASE_URL` is the PostgreSQL connection string used by the running app. `DIRECT_URL` is used by Prisma migrations. Copy both from your project's **Connect** panel, and replace any password placeholder with your database password. The app also uses `SUPABASE_URL` and `SUPABASE_SECRET_KEY` to call the separate Storage API.

Create a **private** Storage bucket named `files` (or choose a different name in `SUPABASE_STORAGE_BUCKET`). Set its maximum file size to 10 MB and allowed MIME types to `image/jpeg`, `image/png`, and `application/pdf`. Add a `.env` file:

```dotenv
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require"
DIRECT_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require"
SESSION_SECRET="a-long-random-secret-value"
PORT=3000
NODE_ENV=development
SUPABASE_URL="https://your-project-ref.supabase.co"
SUPABASE_SECRET_KEY="your-server-side-secret-key"
SUPABASE_STORAGE_BUCKET="files"
```

Then install dependencies, apply the migrations, and start the app:

```sh
npm install
npm run db:deploy
npm run dev
```

Open `http://localhost:3000`. `npm run build` generates the Prisma client, compiles TypeScript, and copies the EJS views and public assets into the build. Run the production build with `npm start`.

## Deployment

Provision a Supabase project and private Storage bucket, set all environment variables above in the host, and use:

```sh
npm install
npm run db:deploy
npm run build
npm start
```

Choose a database connection string that the deployment host can reach. Supabase recommends a direct connection for persistent backends when the host supports IPv6, or the session pooler for IPv4-only hosts. Set `NODE_ENV=production` to enable secure session cookies. Never expose the Supabase secret/service role key in browser code or commit it to source control. Files stay in a private bucket; the app creates short-lived signed download URLs after checking file ownership or the folder share expiry. Anyone with a folder share link can download its contents until the selected expiry.

Uploads are limited by extension and MIME type to JPEG, PNG, and PDF, with a 10 MB maximum. Add further types only after deciding how they should be stored and served.
