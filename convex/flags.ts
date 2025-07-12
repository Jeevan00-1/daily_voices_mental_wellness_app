import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const flagEntry = mutation({
  args: {
    userId: v.id("users"),
    entryId: v.string(),
    matchedKeywords: v.array(v.string()),
  },
  returns: v.id("flaggedEntries"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("flaggedEntries", {
      userId: args.userId,
      entryId: args.entryId,
      timestamp: Date.now(),
      matchedKeywords: args.matchedKeywords,
      dismissed: false,
    });
  },
});

export const markDismissed = mutation({
  args: { flagId: v.id("flaggedEntries") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.flagId, { dismissed: true });
    return null;
  },
}); 