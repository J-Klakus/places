import type { APIContext } from "astro";

export async function GET({ request }: APIContext) {
  const { searchParams } = new URL(request.url);
  let url = searchParams.get("url");
  try {
    const accountId = "3ad64a60ccc5be89beca1fde79b0bb4a";
    const accessToken = "mokRp6Rlh6QVb1LZ2K-slKWcZLMEnAdKh9ORX159";

    const params = {
      url: url,
      screenshotOptions: {
        clip: { x: 0, y: 60, width: 500, height: 460 - 60 },
      },
      setJavaScriptEnabled: true,
      waitForTimeout: 5000,
      gotoOptions: {
        waitUntil: "domcontentloaded",
        timeout: 45000,
      },
    };

    const r = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/browser-rendering/screenshot`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          url: params.url,
          screenshotOptions: params.screenshotOptions,
          waitForTimeout: params.waitForTimeout,
        }),
      }
    );

    if (!r.ok) {
      const errorText = await r.text(); // Get the error message
      console.error(`Cloudflare API error: ${r.status} - ${errorText}`);
      return new Response(
        `Failed to take screenshot: ${r.status} - ${errorText}`,
        { status: r.status }
      );
    }
    const img = await r.arrayBuffer();
    return new Response(img, {
      headers: {
        "content-type": "image/jpeg",
      },
    });
  } catch (error: any) {
    console.error("Error taking screenshot:", error);
    return new Response(`Error taking screenshot: ${error.message}`, {
      status: 500,
    });
  }
}
