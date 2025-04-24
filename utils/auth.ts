import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import type { D1Database } from "@cloudflare/workers-types";
import { drizzle } from "drizzle-orm/d1";
import { account, session, user, verification } from "@db/schema";
// Define a function that creates and returns the auth instance
export function initAuth(D1: D1Database) {
  const db = drizzle(D1);

  return betterAuth({
    database: drizzleAdapter(db, {
      provider: "sqlite",
      schema: {
        user,
        session,
        account,
        verification,
      },
    }),
    socialProviders: {
      google: {
        clientId: import.meta.env.GOOGLE_CLIENT_ID as string,
        clientSecret: import.meta.env.GOOGLE_CLIENT_SECRET as string,
      },
    },
    emailAndPassword: {
      enabled: true,
    },
    secret: import.meta.env.BETTER_AUTH_SECRET,
  });
}
