# Architecture overview

**Label:** Simplified illustrative example of the production layering. Not a dump of the live system.

The application is a Next.js App Router product (TypeScript, React) with PostgreSQL on Neon and Drizzle ORM. Domain rules live in pure TypeScript. Server services own SQL and transactions. Route `"use server"` files stay thin: they load the session, call a service, map errors, and revalidate.

```
Browser / App Router pages
        |
        v
Thin server actions   (session + getDb + error mapping)
        |
        v
Server services       (authorization, transactions, persistence)
        |
   +----+----+
   |         |
Domain     Drizzle / Neon
(pure)     (constraints, snapshots)
```

## Identity model (conceptual)

A login is a session user. Authorization is loaded from the database on each protected action:

- **Customer** is a party/profile tied to that user
- **Business member** is an active membership on one Business Account (primary or secondary; same permissions)
- **Affiliate / Senior / Manager** are capability flags on the Business Account, not Better Auth roles
- **Admin** is a separate membership on the platform party, and requires verified email plus session MFA

Hiding a navigation link is not authorization. Services call fail-closed helpers before reads and writes.

## Environment isolation (conceptual)

| Environment | Application | Database |
| --- | --- | --- |
| Development | local / Vercel development | dedicated Neon branch |
| Preview | Vercel preview deployments | dedicated Neon branch; pooler hostname rewrite |
| Production | Vercel production | dedicated Neon branch |
| Integration tests | Vitest, skipped unless configured | dedicated test branch; never falls back to the app `DATABASE_URL` |

CI on GitHub runs unit tests, typecheck, lint, and a production build with dummy environment values. It does not migrate or query production.

## What hiring managers should take from this

The interesting work is not a particular vendor SDK. It is:

1. Session identity kept separate from authorization
2. Database constraints as a last line of defense
3. Snapshot-first commerce so later catalog or org changes do not rewrite history
4. Preview and test isolation so serverless traffic and tests cannot land on production data
