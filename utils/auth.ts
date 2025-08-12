import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import type { D1Database } from "@cloudflare/workers-types";
import { drizzle } from "drizzle-orm/d1";
import { account, session, user, verification } from "@db/schema";
import { Resend } from 'resend';
import { admin } from "better-auth/plugins"

const resend = new Resend(import.meta.env.RESEND_API_KEY as string);
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
      sendResetPassword: async ({ user, url, token }, request) => {
          try {
              await resend.emails.send({
                  to: user.email,
                  from: "auth@places.com", 
                  subject: "Reset your password",
                  html: `<p>Click the link to reset your password: <a href="${url}">${url}</a></p>`, 
                  text: `Click the link to reset your password: ${url}`,
              });
          } catch (error) {
              console.error("Error sending reset password email:", error);
              throw new Error("Failed to send reset email.");
          }
      },
  },
  plugins: [
    admin() 
],
    secret: import.meta.env.BETTER_AUTH_SECRET,
  });
}
