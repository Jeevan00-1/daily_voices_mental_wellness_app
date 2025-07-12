import { query } from "./_generated/server";
import { v } from "convex/values";

export const getFlaggedUsers = query({
  args: {},
  returns: v.array(
    v.object({
      userId: v.id("users"),
      entryId: v.string(),
      timestamp: v.number(),
      matchedKeywords: v.array(v.string()),
      dismissed: v.boolean(),
    })
  ),
  handler: async (ctx, args) => {
    // TODO: Add admin auth check
    return await ctx.db.query("flaggedEntries").collect();
  },
}); 