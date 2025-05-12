// src/pages/api/r2/[...key].js
import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ request, params, locals }) => {
  try {
    const { key } = params;

    if (key) {
      const file = await locals.runtime.env.MEDIA.get(key);

      if (!file) {
        return new Response("Not Found", { status: 404 });
      }

      const headers = new Headers();
      headers.append(
        "cache-control",
        "immutable, no-transform, max-age=31536000"
      );
      headers.append("etag", file.httpEtag);
      headers.append("date", file.uploaded.toUTCString());

      return new Response(file.body, {
        headers,
      });
    }
    return new Response("Please specify a key", { status: 400 });
  } catch (ex) {
    console.error("Worker ex: ", ex);
    return new Response("Internal server error", { status: 500 });
  }
};
