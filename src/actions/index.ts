import { defineAction, ActionError } from "astro:actions";
import { and, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { places, votes } from "../db/schema";
import { z } from "zod";
import crypto from "node:crypto";
import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

const endpoint = "https://models.github.ai/inference";
const model = "mistral-ai/mistral-small-2503";

async function getAIDescription(data: any, token: string): Promise<string> {
  const client = ModelClient(endpoint, new AzureKeyCredential(token));
  const response = await client.path("/chat/completions").post({
    body: {
      messages: [
        {
          role: "system",
          content:
            "Respond with exactly 100 to 130 characters. Provide the response as plain text, don't list the charcacter amounts. also no bold, no italics, no headers, no bullet points, no links, no code blocks. Just words, without any special characters. No emojis. No HTML tags. No markdown. No JSON. No XML. No YAML. No CSV. No TSV. No code snippets. No code comments. No code examples. No code explanations.",
        },
        { role: "user", content: JSON.stringify(data) },
      ],
      temperature: 1.0,
      top_p: 1.0,
      max_tokens: 40,
      model: model,
    },
  });

  if (isUnexpected(response)) {
    console.log(response);
    throw response.body.error;
  }

  return response.body.choices[0].message.content || "";
}

function generateSignature(urlToSign: string, key: string) {
  const hmac = crypto.createHmac("sha1", Buffer.from(key, "base64"));
  hmac.update(urlToSign);
  return hmac.digest("base64").replace(/\+/g, "-").replace(/\//g, "_");
}

async function getMap(place: string, context: any) {
  const apiKey =
    context.locals.runtime.GOOGLE_MAPS_API_KEY ||
    import.meta.env.GOOGLE_MAPS_API_KEY;
  const signingSecret =
    context.locals.runtime.GOOGLE_MAPS_SIGNING_SECRET ||
    import.meta.env.GOOGLE_MAPS_SIGNING_SECRET;
  if (!apiKey || !signingSecret) {
    console.error("API key or signing secret not configured.");
    return {
      success: false,
      error: "Internal server error",
    };
  }

  const baseUrl = `/maps/api/staticmap?center=${encodeURIComponent(
    place
  )}&zoom=${encodeURIComponent(14)}&size=${encodeURIComponent(
    "500x400"
  )}&key=${apiKey}`;
  const signature = generateSignature(baseUrl, signingSecret);
  const imageUrl = `https://maps.googleapis.com${baseUrl}&signature=${signature}`;

  try {
    const r = await fetch(imageUrl, { method: "GET" });

    if (!r.ok) {
      const errorText = await r.text();
      console.error(`Google Maps API error: ${r.status} - ${errorText}`);
      return {
        success: false,
        error: `Failed to fetch map: ${r.status} - ${errorText}`,
      };
    }

    const img = await r.arrayBuffer();
    const shortUuid = crypto.randomBytes(8).toString("hex");
    const imageName = `${place}-${shortUuid}.png`;

    await context.locals.runtime.env.MEDIA.put(imageName, img, {
      httpMetadata: {
        contentType: "image/png",
      },
    });

    return {
      success: true,
      imageUrl: imageName,
    };
  } catch (error: any) {
    console.error("Error fetching map:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

export const server = {
  createPlace: defineAction({
    input: z.object({
      name: z.string().min(3),
      summary: z.string().min(3),
      description: z.string().min(10),
      isPublic: z.boolean(),
      link: z.string().min(10),
      tag: z.enum([
        "food",
        "accommodation",
        "cafes-with-wifi",
        "attractions",
        "mixed",
      ]),
    }),
    handler: async (input, context) => {
      if (!context.locals.user) throw new ActionError({ code: "UNAUTHORIZED" });
      const mapResult = await getMap(input.name, context);
      if (!mapResult.success) {
        throw new ActionError({
          code: "BAD_REQUEST",
          message: "Failed to generate map image: " + mapResult.error,
        });
      }
      const imageUrl = mapResult.imageUrl;
      const db = drizzle(context.locals.runtime?.env?.DB as D1Database);
      const [newPlace] = await db
        .insert(places)
        .values({
          ...input,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          userId: context.locals.user.id,
          image: imageUrl,
          votes: 0,
        })
        .returning();

      return newPlace;
    },
  }),
  getPlaces: defineAction({
    handler: async (_, context) => {
      const db = drizzle(context.locals.runtime?.env?.DB as D1Database);
      if (context.locals.user && context.locals.user.role === "admin") {
        console.log("Admin user detected, fetching all places.");
        return await db.select().from(places);
      }
      return await db.select().from(places).where(eq(places.isPublic, true));
    },
  }),
  getTopPlaces: defineAction({
    handler: async (_, context) => {
      const db = drizzle(context.locals.runtime?.env?.DB as D1Database);
      return await db
        .select()
        .from(places)
        .where(eq(places.isPublic, true))
        .orderBy(sql`${places.votes} DESC`)
        .limit(10);
    },
  }),
  getPlacesByTag: defineAction({
    input: z.object({
      tag: z.enum([
        "food",
        "accommodation",
        "cafes-with-wifi",
        "attractions",
        "mixed",
      ]),
    }),
    handler: async ({ tag }, context) => {
      const db = drizzle(context.locals.runtime?.env?.DB as D1Database);
      return await db
        .select()
        .from(places)
        .where(and(eq(places.tag, tag), eq(places.isPublic, true)))
        .orderBy(sql`${places.votes} DESC`)
        .limit(10);
    },
  }),
  getPlacesForUser: defineAction({
    handler: async (_, context) => {
      if (!context.locals.user) throw new ActionError({ code: "UNAUTHORIZED" });
      const db = drizzle(context.locals.runtime?.env?.DB as D1Database);
      return await db
        .select()
        .from(places)
        .where(eq(places.userId, context.locals.user.id));
    },
  }),
  updatePlace: defineAction({
    input: z.object({
      id: z.string(),
      name: z.string().min(3),
      summary: z.string().min(3),
      description: z.string().min(10),
      isPublic: z.boolean(),
      link: z.string().min(10),
      tag: z.enum([
        "food",
        "accommodation",
        "cafes-with-wifi",
        "attractions",
        "mixed",
      ]),
    }),
    handler: async (input, context) => {
      if (!context.locals.user) throw new ActionError({ code: "UNAUTHORIZED" });
      const db = drizzle(context.locals.runtime?.env?.DB as D1Database);
      
      // Check if the user is an admin
      const isAdmin = context.locals.user.role === "admin";
  
      // Query for the place using only the ID. Admins don't need to be the owner.
      const place = await db.select().from(places).where(eq(places.id, input.id)).get();
  
      // The user can't update if the place doesn't exist
      if (!place) {
        throw new ActionError({
          code: "NOT_FOUND",
          message: "Place not found",
        });
      }
  
      // Check ownership only if the user is NOT an admin
      if (!isAdmin && place.userId !== context.locals.user.id) {
        throw new ActionError({
          code: "UNAUTHORIZED",
          message: "You don't have permission to update this place",
        });
      }
  
      const [updated] = await db
        .update(places)
        .set({
          name: input.name,
          description: input.description,
          summary: input.summary,
          isPublic: input.isPublic,
          link: input.link,
          tag: input.tag,
        })
        .where(eq(places.id, input.id)) // Admins can update any place by ID
        .returning();
  
      return updated;
    },
  }),
  deletePlace: defineAction({
    input: z.object({
      id: z.string(),
    }),
    handler: async (input, context) => {
      if (!context.locals.user) throw new ActionError({ code: "UNAUTHORIZED" });
  
      const db = drizzle(context.locals.runtime?.env?.DB as D1Database);
  
      // Check if the user is an admin
      const isAdmin = context.locals.user.role === "admin";
      
      // Query for the place to check if it exists
      const place = await db.select().from(places).where(eq(places.id, input.id)).get();
      
      if (!place) {
        throw new ActionError({
          code: "NOT_FOUND",
          message: "Place not found",
        });
      }
  
      // Check ownership only if the user is NOT an admin
      if (!isAdmin && place.userId !== context.locals.user.id) {
        throw new ActionError({
          code: "UNAUTHORIZED",
          message: "You don't have permission to delete this place",
        });
      }
  
      // Delete votes and place. Admins can delete any place by ID.
      await db.delete(votes).where(eq(votes.placeId, input.id));
      await db.delete(places).where(eq(places.id, input.id));
  
      return { success: true };
    },
  }),
  searchPlaces: defineAction({
    input: z.object({
      searchTerm: z.string().min(1),
      tag: z
        .enum([
          "food",
          "accommodation",
          "cafes-with-wifi",
          "attractions",
          "mixed",
        ])
        .optional(),
    }),
    handler: async ({ searchTerm, tag }, context) => {
      const db = drizzle(context.locals.runtime?.env?.DB as D1Database);

      const whereConditions = [
        eq(places.isPublic, true),
        sql`LOWER(${places.name}) LIKE LOWER(${sql.param(
          "%" + searchTerm.toLowerCase() + "%"
        )})`,
      ];

      if (tag) {
        whereConditions.push(eq(places.tag, tag));
      }

      return await db
        .select()
        .from(places)
        .where(and(...whereConditions))
        .orderBy(sql`${places.votes} DESC`);
    },
  }),
  Vote: defineAction({
    input: z.object({
      placeId: z.string(),
      isLike: z.boolean(),
    }),
    handler: async (input, context) => {
      if (!context.locals.user) throw new ActionError({ code: "UNAUTHORIZED" });

      const userId = context.locals.user.id;
      const db = drizzle(context.locals.runtime?.env?.DB as D1Database);

      // Check if user already voted
      const existingVote = await db
        .select()
        .from(votes)
        .where(and(eq(votes.userId, userId), eq(votes.placeId, input.placeId)))
        .get();

      if (existingVote) {
        throw new ActionError({
          code: "BAD_REQUEST",
          message: "You have already voted on this place",
        });
      }

      // Insert new vote
      const voteType = input.isLike ? "like" : "dislike";
      await db.insert(votes).values({
        id: crypto.randomUUID(),
        userId,
        placeId: input.placeId,
        voteType,
      });

      // Update vote count on place
      const [updated] = await db
        .update(places)
        .set({
          votes: input.isLike
            ? sql`${places.votes} + 1`
            : sql`${places.votes} - 1`,
        })
        .where(eq(places.id, input.placeId))
        .returning();

      return updated;
    },
  }),
  getCity: defineAction({
    input: z.string(),
    handler: async (input, context) => {
      if (!context.locals.runtime.env.GOOGLE_MAPS_API_KEY) {
        console.warn("Google Maps API key is missing. Returning default.");
        return ["London"]; // Fallback if API key is not set
      }

      const autocompleteUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
        input
      )}&types=(cities)&key=${context.locals.runtime.env.GOOGLE_MAPS_API_KEY}`;

      try {
        const response = await fetch(autocompleteUrl);
        if (!response.ok) {
          console.error(
            `Google Maps API error: ${response.status} - ${response.statusText}`
          );
          return ["London"]; // Fallback on API error
        }
        const data: any = await response.json();

        if (data.status === "OK") {
          return data.predictions.map(
            (prediction: any) => prediction.description
          );
        } else if (data.status === "ZERO_RESULTS") {
          return []; // No cities found for the input
        } else {
          console.error(`Google Maps API returned status: ${data.status}`);
          return ["London"]; // Fallback on unexpected API status
        }
      } catch (error) {
        console.error("Error calling Google Maps API:", error);
        return ["London"]; // Fallback on network or other errors
      }
    },
  }),
  getDescription: defineAction({
    input: z.string(),
    handler: async (input, context) => {
      if (!context.locals.runtime.env.AI_TOKEN) {
        console.warn(
          "Azure API key is missing. Returning a default description."
        );
      }
      try {
        const prompt = `Generate a short description between 100-130 characters for a map showing the following place and spots: ${input}`;
        const response = await getAIDescription(
          prompt,
          context.locals.runtime.env.AI_TOKEN as string
        );
        return response;
      } catch (error) {
        console.error(
          "An error occurred while fetching the AI description:",
          error
        );
        return "Unable to generate a description at this time. Please try again later.";
      }
    },
  }),
};
