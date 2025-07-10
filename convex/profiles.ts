import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createProfile = mutation({
  args: {
    username: v.string(),
    avatar: v.string(),
    theme: v.union(v.literal("light"), v.literal("dark")),
    language: v.optional(v.union(v.literal("en"), v.literal("ja"))),
    background: v.optional(v.string()),
    fontSize: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Check if profile already exists
    const existingProfile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (existingProfile) {
      throw new Error("Profile already exists");
    }

    return await ctx.db.insert("profiles", {
      userId,
      username: args.username,
      avatar: args.avatar,
      theme: args.theme,
      language: args.language || "en",
      background: args.background || "default",
      fontSize: args.fontSize || "medium",
      createdAt: Date.now(),
    });
  },
});

export const updateProfile = mutation({
  args: {
    username: v.optional(v.string()),
    avatar: v.optional(v.string()),
    theme: v.optional(v.union(v.literal("light"), v.literal("dark"))),
    language: v.optional(v.union(v.literal("en"), v.literal("ja"))),
    background: v.optional(v.string()),
    fontSize: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!profile) {
      throw new Error("Profile not found");
    }

    const updates: any = {};
    if (args.username !== undefined) updates.username = args.username;
    if (args.avatar !== undefined) updates.avatar = args.avatar;
    if (args.theme !== undefined) updates.theme = args.theme;
    if (args.language !== undefined) updates.language = args.language;
    if (args.background !== undefined) updates.background = args.background;
    if (args.fontSize !== undefined) updates.fontSize = args.fontSize;

    await ctx.db.patch(profile._id, updates);
    return profile._id;
  },
});

export const getProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    return await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
  },
});
