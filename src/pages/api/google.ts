// server/api/get-map.js
import type { APIContext } from "astro";
import crypto from "node:crypto";

const apiKey = "AIzaSyChWwDfyiZbkvzOMD_1mDkh3i5c6wpSsqk";
const signingSecret = "xi_bvUGHT5k7eLUVypzjVBoZITY=";

function generateSignature(urlToSign: string, key: string) {
  const hmac = crypto.createHmac("sha1", Buffer.from(key, "base64"));
  hmac.update(urlToSign);
  return hmac.digest("base64").replace(/\+/g, "-").replace(/\//g, "_");
}

export async function GET({ request, locals }: APIContext) {
  const { searchParams } = new URL(request.url);
  const center = searchParams.get("center") || "Berkeley,CA";
  const zoom = searchParams.get("zoom") || "14";
  const size = searchParams.get("size") || "400x400";

  if (!apiKey || !signingSecret) {
    console.error("API key or signing secret not configured.");
    return new Response("Internal server error", { status: 500 });
  }

  const baseUrl = `/maps/api/staticmap?center=${encodeURIComponent(
    center
  )}&zoom=${encodeURIComponent(zoom)}&size=${encodeURIComponent(
    size
  )}&key=${apiKey}`;
  const signature = generateSignature(baseUrl, signingSecret);
  const imageUrl = `https://maps.googleapis.com${baseUrl}&signature=${signature}`;

  try {
    const r = await fetch(imageUrl, { method: "GET" });

    if (!r.ok) {
      const errorText = await r.text();
      console.error(`Google Maps API error: ${r.status} - ${errorText}`);
      return new Response(`Failed to fetch map: ${r.status} - ${errorText}`, {
        status: r.status,
      });
    }
    const img = await r.arrayBuffer();

    const response = await locals.runtime.env.MEDIA.put(`${center}.png`, img, {
      httpMetadata: {
        contentType: "image/png",
      },
    });
    return new Response(JSON.stringify({ok: true, imageUrl: `${center}.png`}));
  } catch (error: any) {
    console.error("Error fetching map:", error);
    return new Response(`Error fetching map: ${error.message}`, {
      status: 500,
    });
  }
}
