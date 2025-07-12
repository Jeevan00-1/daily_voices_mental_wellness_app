"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";
// NOTE: You must install the 'twilio' package in your Convex backend:
// pnpm add -D twilio @types/twilio
import { makeAnonymousCall } from "./twilioHelper";

export const requestAnonymousCall = action({
  args: {
    userId: v.id("users"),
    toNumber: v.string(),
  },
  returns: v.object({ success: v.boolean(), error: v.optional(v.string()) }),
  handler: async (ctx, args) => {
    // Optionally fetch user for logging
    try {
      await makeAnonymousCall({
        to: args.toNumber,
      });
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },
}); 