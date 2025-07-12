import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  // User profiles
  profiles: defineTable({
    userId: v.id("users"),
    username: v.string(),
    avatar: v.string(), // emoji or base64 image
    theme: v.union(v.literal("light"), v.literal("dark")),
    language: v.optional(v.union(v.literal("en"), v.literal("ja"))),
    background: v.optional(v.string()),
    fontSize: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  // AI Companions
  companions: defineTable({
    userId: v.id("users"),
    name: v.string(),
    avatar: v.string(),
    personality: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  // Private journal entries
  journalEntries: defineTable({
    userId: v.id("users"),
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
    moodScore: v.number(), // 1-10 scale
    tags: v.array(v.string()),
    isPrivate: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_date", ["userId", "createdAt"])
    .searchIndex("search_content", {
      searchField: "content",
      filterFields: ["userId"],
    }),

  // AI chat conversations
  chatMessages: defineTable({
    userId: v.id("users"),
    companionId: v.id("companions"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    timestamp: v.number(),
  })
    .index("by_user_and_companion", ["userId", "companionId"])
    .index("by_conversation", ["userId", "companionId", "timestamp"]),

  // Anonymous community posts
  communityPosts: defineTable({
    authorHash: v.string(), // anonymized user identifier
    title: v.string(),
    content: v.string(),
    category: v.union(
      v.literal("story"),
      v.literal("advice"),
      v.literal("support"),
      v.literal("gratitude"),
      v.literal("milestone")
    ),
    upvotes: v.number(),
    commentCount: v.number(),
    isAnonymous: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_category", ["category"])
    .index("by_popularity", ["upvotes"])
    .index("by_date", ["createdAt"])
    .searchIndex("search_posts", {
      searchField: "content",
      filterFields: ["category"],
    }),

  // Community post comments
  communityComments: defineTable({
    postId: v.id("communityPosts"),
    authorHash: v.string(),
    content: v.string(),
    upvotes: v.number(),
    createdAt: v.number(),
  }).index("by_post", ["postId", "createdAt"]),

  // Community post upvotes
  communityUpvotes: defineTable({
    postId: v.optional(v.id("communityPosts")),
    commentId: v.optional(v.id("communityComments")),
    userHash: v.string(),
    createdAt: v.number(),
  })
    .index("by_post_and_user", ["postId", "userHash"])
    .index("by_comment_and_user", ["commentId", "userHash"]),

  flaggedEntries: defineTable({
    userId: v.id("users"),
    entryId: v.string(),
    timestamp: v.number(),
    matchedKeywords: v.array(v.string()),
    dismissed: v.boolean(),
  }).index("by_user", ["userId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
