import { initAuth } from "@utils/auth";
import type { APIRoute } from "astro";

export const ALL: APIRoute = async (ctx) => {
  const D1Database = ctx.locals.runtime?.env?.DB as D1Database;
  if (!D1Database) {
    console.error("D1 database not available in runtime context");
    return new Response("D1 database not available", { status: 500 });
  }
  // Initialize auth with the database
  const auth = initAuth(D1Database);
  if (!auth) {
    return new Response("Auth configuration not found", { status: 500 });
  }

  return auth.handler(ctx.request);
};
