# File Uploader

A file drive built with Express, EJS, Prisma, PostgreSQL, and Supabase Storage.

## Features

- User sign-up and login
- Nested folders with create, rename, and delete actions
- JPEG, PNG, and PDF uploads up to 10 MB
- File details and downloads
- Expiring public folder share links

## Local setup

### 1. Install the requirements

Use Node.js 20 or newer and create a [Supabase project](https://supabase.com/).

### 2. Create a Storage bucket

In Supabase, open **Storage** and create a **private** bucket named `files`.

Set the file limit to 10 MB. Allow `image/jpeg`, `image/png`, and `application/pdf`.

### 3. Get your Supabase settings

From the project dashboard, copy the project URL and a server-side secret key.

Open **Connect** to get the PostgreSQL connection strings. Set `DATABASE_URL` for the app and `DIRECT_URL` for Prisma migrations.

### 4. Create your `.env` file

Add these values in the project root. Replace each placeholder with your Supabase settings and a long random session secret.

```dotenv
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require"
DIRECT_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require"
SESSION_SECRET="replace-with-a-long-random-secret"
PORT=3000
NODE_ENV=development
SUPABASE_URL="https://your-project-ref.supabase.co"
SUPABASE_SECRET_KEY="your-server-side-secret-key"
SUPABASE_STORAGE_BUCKET="files"
```

Use the connection type that works from your network. Direct connections require IPv6 unless your project has IPv4 enabled. Use the Supabase session pooler on IPv4-only networks.

### 5. Install dependencies and set up the database

```sh
npm install
npm run db:deploy
```

### 6. Start the development server

```sh
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
