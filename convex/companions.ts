import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createCompanion = mutation({
  args: {
    name: v.string(),
    avatar: v.string(),
    personality: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    return await ctx.db.insert("companions", {
      userId,
      name: args.name,
      avatar: args.avatar,
      personality: args.personality,
      createdAt: Date.now(),
    });
  },
});

export const getCompanion = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    return await ctx.db
      .query("companions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
  },
});

export const getCompanionById = query({
  args: { companionId: v.id("companions") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const companion = await ctx.db.get(args.companionId);
    if (!companion || companion.userId !== userId) {
      return null;
    }

    return companion;
  },
});

export const updateCompanion = mutation({
  args: {
    companionId: v.id("companions"),
    name: v.optional(v.string()),
    avatar: v.optional(v.string()),
    personality: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const companion = await ctx.db.get(args.companionId);
    if (!companion || companion.userId !== userId) {
      throw new Error("Companion not found or unauthorized");
    }

    const updates: any = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.avatar !== undefined) updates.avatar = args.avatar;
    if (args.personality !== undefined) updates.personality = args.personality;

    await ctx.db.patch(args.companionId, updates);
    return args.companionId;
  },
});
