import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createEntry = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    mood: v.union(
      v.literal("very_happy"),
      v.literal("happy"),
      v.literal("neutral"),
      v.literal("sad"),
      v.literal("very_sad"),
      v.literal("anxious"),
      v.literal("angry"),
      v.literal("excited"),
      v.literal("grateful")
    ),
    moodScore: v.number(),
    tags: v.array(v.string()),
    isPrivate: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const now = Date.now();

    return await ctx.db.insert("journalEntries", {
      userId,
      title: args.title,
      content: args.content,
      mood: args.mood,
      moodScore: args.moodScore,
      tags: args.tags,
      isPrivate: args.isPrivate,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const getEntries = query({
  args: {
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const limit = args.limit || 20;
    const offset = args.offset || 0;

    const entries = await ctx.db
      .query("journalEntries")
      .withIndex("by_user_and_date", (q) => q.eq("userId", userId))
      .order("desc")
      .take(limit + offset);

    return entries.slice(offset);
  },
});

export const getEntry = query({
  args: { entryId: v.id("journalEntries") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const entry = await ctx.db.get(args.entryId);
    if (!entry || entry.userId !== userId) {
      return null;
    }

    return entry;
  },
});

export const updateEntry = mutation({
  args: {
    entryId: v.id("journalEntries"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    mood: v.optional(v.union(
      v.literal("very_happy"),
      v.literal("happy"),
      v.literal("neutral"),
      v.literal("sad"),
      v.literal("very_sad"),
      v.literal("anxious"),
      v.literal("angry"),
      v.literal("excited"),
      v.literal("grateful")
    )),
    moodScore: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
    isPrivate: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const entry = await ctx.db.get(args.entryId);
    if (!entry || entry.userId !== userId) {
      throw new Error("Entry not found or unauthorized");
    }

    const updates: any = { updatedAt: Date.now() };
    if (args.title !== undefined) updates.title = args.title;
    if (args.content !== undefined) updates.content = args.content;
    if (args.mood !== undefined) updates.mood = args.mood;
    if (args.moodScore !== undefined) updates.moodScore = args.moodScore;
    if (args.tags !== undefined) updates.tags = args.tags;
    if (args.isPrivate !== undefined) updates.isPrivate = args.isPrivate;

    await ctx.db.patch(args.entryId, updates);
    return args.entryId;
  },
});

export const deleteEntry = mutation({
  args: { entryId: v.id("journalEntries") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const entry = await ctx.db.get(args.entryId);
    if (!entry || entry.userId !== userId) {
      throw new Error("Entry not found or unauthorized");
    }

    await ctx.db.delete(args.entryId);
    return { success: true };
  },
});

export const getMoodStats = query({
  args: { days: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const days = args.days || 30;
    const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);

    const entries = await ctx.db
      .query("journalEntries")
      .withIndex("by_user_and_date", (q) => 
        q.eq("userId", userId).gte("createdAt", cutoffTime)
      )
      .collect();

    if (entries.length === 0) {
      return {
        totalEntries: 0,
        averageMoodScore: 0,
        moodCounts: {},
        timeRange: days,
      };
    }

    const totalMoodScore = entries.reduce((sum, entry) => sum + entry.moodScore, 0);
    const averageMoodScore = totalMoodScore / entries.length;

    const moodCounts: Record<string, number> = {};
    entries.forEach(entry => {
      moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
    });

    return {
      totalEntries: entries.length,
      averageMoodScore,
      moodCounts,
      timeRange: days,
    };
  },
});

export const searchEntries = query({
  args: {
    searchTerm: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const limit = args.limit || 20;

    const results = await ctx.db
      .query("journalEntries")
      .withSearchIndex("search_content", (q) =>
        q.search("content", args.searchTerm).eq("userId", userId)
      )
      .take(limit);

    return results;
  },
});
