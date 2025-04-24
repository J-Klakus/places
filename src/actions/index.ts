import { defineAction, ActionError } from "astro:actions";
import { and, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { places } from "../db/schema";
import { z } from "zod";

export const server = {
  createPlace: defineAction({
    input: z.object({
      name: z.string().min(3),
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
      return await db.select().from(places);
    },
  }),

  updatePlace: defineAction({
    input: z.object({
      id: z.string(),
      name: z.string().min(3),
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
      const [updated] = await db
        .update(places)
        .set({ name: input.name, link: input.link, tag: input.tag })
        .where(
          eq(places.id, input.id) && eq(places.userId, context.locals.user.id)
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

  Vote: defineAction({
    input: z.object({
      placeId: z.string(),
      isLike: z.boolean(),
    }),
    handler: async (input, context) => {
      if (!context.locals.user) throw new ActionError({ code: "UNAUTHORIZED" });
      const db = drizzle(context.locals.runtime?.env?.DB as D1Database);
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
