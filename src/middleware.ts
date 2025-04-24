import { defineMiddleware } from "astro:middleware";
import { initAuth } from "@utils/auth";
import type { D1Database } from "@cloudflare/workers-types";

export const onRequest = defineMiddleware(async (context, next) => {
  // Access the D1 database from runtime context
  const D1Database = context.locals.runtime?.env?.DB as D1Database;

  if (!D1Database) {
    console.error("D1 database not available in runtime context");
    return next();
  }

  // Initialize auth with the database
  const auth = initAuth(D1Database);

  const isAuthed = await auth.api.getSession({
    headers: context.request.headers,
  });

  if (isAuthed) {
    context.locals.user = isAuthed.user;
    context.locals.session = isAuthed.session;
  } else {
    context.locals.user = null;
    context.locals.session = null;
  }

  return next();
});
