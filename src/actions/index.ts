import { defineAction, ActionError } from "astro:actions";
import { and, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { places, votes } from "../db/schema";
import { z } from "zod";

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
      const db = drizzle(context.locals.runtime?.env?.DB as D1Database);
      const [newPlace] = await db
        .insert(places)
        .values({
          ...input,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          userId: context.locals.user.id,
          votes: 0,
        })
        .returning();

      return newPlace;
    },
  }),

  getPlaces: defineAction({
    handler: async (_, context) => {
      const db = drizzle(context.locals.runtime?.env?.DB as D1Database);
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
      const place = await db
        .select()
        .from(places)
        .where(
          and(
            eq(places.id, input.id),
            eq(places.userId, context.locals.user.id)
          )
        )
        .get();

      if (!place) {
        throw new ActionError({
          code: "NOT_FOUND",
          message: "Place not found or you don't have permission to update it",
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
        .where(
          and(
            eq(places.id, input.id),
            eq(places.userId, context.locals.user.id)
          )
        )
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

      const place = await db
        .select()
        .from(places)
        .where(
          and(
            eq(places.id, input.id),
            eq(places.userId, context.locals.user.id)
          )
        )
        .get();

      if (!place) {
        throw new ActionError({
          code: "NOT_FOUND",
          message: "Place not found or you don't have permission to delete it",
        });
      }

      await db.delete(votes).where(eq(votes.placeId, input.id));

      await db
        .delete(places)
        .where(
          and(
            eq(places.id, input.id),
            eq(places.userId, context.locals.user.id)
          )
        );

      return { success: true };
    },
  }),

  searchPlaces: defineAction({
    input: z.object({
      searchTerm: z.string().min(1),
      tag: z.enum([
        "food",
        "accommodation",
        "cafes-with-wifi",
        "attractions",
        "mixed",
      ]).optional(),
    }),
    handler: async ({ searchTerm, tag }, context) => {
      const db = drizzle(context.locals.runtime?.env?.DB as D1Database);
      
      const whereConditions = [
        eq(places.isPublic, true),
        sql`LOWER(${places.name}) LIKE LOWER(${sql.param('%' + searchTerm.toLowerCase() + '%')})`
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
};
