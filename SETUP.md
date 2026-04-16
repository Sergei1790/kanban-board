# Kanban Board — Project Setup Guide

## Stack
- Next.js 15, TypeScript, Tailwind CSS v4, Turbopack
- Prisma 7 (adapter-pg pattern)
- PostgreSQL (Neon)
- NextAuth v5 (GitHub + Google OAuth)

---

## Step 1 — Create the project

```bash
npx create-next-app@latest kanban-board
# TypeScript: Yes | ESLint: Yes | Tailwind: Yes | src/: Yes | App Router: Yes | Turbopack: Yes | alias: default
cd kanban-board
```

---

## Step 2 — Install dependencies

```bash
npm install prisma @prisma/client @prisma/adapter-pg pg dotenv next-auth@beta @auth/prisma-adapter
npm install -D @types/pg
```

---

## Step 3 — Create the database

- Go to neon.tech, create a new project
- Copy the connection string

Create `.env` in the project root:
```
DATABASE_URL="your_neon_connection_string"
AUTH_SECRET="generate below"
AUTH_GITHUB_ID="from github oauth app"
AUTH_GITHUB_SECRET="from github oauth app"
AUTH_GOOGLE_ID="from google cloud console"
AUTH_GOOGLE_SECRET="from google cloud console"
```

Generate AUTH_SECRET:
```bash
npx auth secret
```

---

## Step 4 — Initialize Prisma

```bash
npx prisma init
```

This creates `prisma/schema.prisma` and `prisma.config.ts`.

---

## Step 5 — Configure Prisma (prisma.config.ts)

Already generated correctly by Prisma. Should look like:
```ts
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: { url: process.env["DATABASE_URL"] },
});
```

---

## Step 6 — Write the schema (prisma/schema.prisma)

```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
}

model User {
  id      String  @id @default(cuid())
  email   String  @unique
  boards  Board[]
}

model Board {
  id        Int      @id @default(autoincrement())
  title     String
  createdAt DateTime @default(now())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  columns   Column[]
}

model Column {
  id      Int    @id @default(autoincrement())
  title   String
  order   Int
  boardId Int
  board   Board  @relation(fields: [boardId], references: [id], onDelete: Cascade)
  cards   Card[]
}

model Card {
  id       Int    @id @default(autoincrement())
  title    String
  order    Int
  columnId Int
  column   Column @relation(fields: [columnId], references: [id], onDelete: Cascade)
}
```

---

## Step 7 — Run migration and generate client

```bash
npx prisma migrate dev --name init
npx prisma generate
```

---

## Step 8 — Create Prisma client (src/lib/prisma.ts)

```ts
import { PrismaClient } from '@/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

export { prisma };
```

Note: import from `@/generated/prisma/client` not `@/generated/prisma` (Prisma 7 no longer generates index.ts).

---

## Step 9 — Set up NextAuth (src/auth.ts)

```ts
import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [GitHub, Google],
});
```

---

## Step 10 — Auth API route (src/app/api/auth/[...nextauth]/route.ts)

```ts
import { handlers } from '@/auth';
export const { GET, POST } = handlers;
```

---

## Step 11 — Middleware (src/proxy.ts)

```ts
import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
    if (!req.auth) {
        return NextResponse.redirect(new URL('/signin', req.url));
    }
});

export const config = {
    matcher: ['/((?!api/auth|signin|_next/static|_next/image|favicon.ico).*)'],
};
```

---

## Step 12 — Add postinstall to package.json

```json
"scripts": {
  "postinstall": "prisma generate"
}
```

---

## Deployment (Vercel)

1. Push to GitHub
2. Connect repo to Vercel
3. Add all env variables from `.env` to Vercel project settings
4. Add production OAuth callback URLs:
   - GitHub: `https://your-domain.vercel.app/api/auth/callback/github`
   - Google: `https://your-domain.vercel.app/api/auth/callback/google`
5. Deploy

After deploy, run to apply migrations to production DB:
```bash
npx prisma migrate deploy
```