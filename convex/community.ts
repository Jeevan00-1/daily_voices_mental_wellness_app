import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Helper function to create anonymous hash for user
function createUserHash(userId: string): string {
  // Simple hash function for anonymization
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

export const createPost = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    category: v.union(
      v.literal("story"),
      v.literal("advice"),
      v.literal("support"),
      v.literal("gratitude"),
      v.literal("milestone")
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const authorHash = createUserHash(userId);

    return await ctx.db.insert("communityPosts", {
      authorHash,
      title: args.title,
      content: args.content,
      category: args.category,
      upvotes: 0,
      commentCount: 0,
      isAnonymous: true,
      createdAt: Date.now(),
    });
  },
});

export const getPosts = query({
  args: {
    category: v.optional(v.union(
      v.literal("story"),
      v.literal("advice"),
      v.literal("support"),
      v.literal("gratitude"),
      v.literal("milestone")
    )),
    sortBy: v.optional(v.union(v.literal("recent"), v.literal("popular"))),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    const offset = args.offset || 0;

    if (args.category) {
      const posts = await ctx.db
        .query("communityPosts")
        .withIndex("by_category", (q) => q.eq("category", args.category as any))
        .order("desc")
        .take(limit + offset);
      return posts.slice(offset);
    }

    if (args.sortBy === "popular") {
      const posts = await ctx.db
        .query("communityPosts")
        .withIndex("by_popularity")
        .order("desc")
        .take(limit + offset);
      return posts.slice(offset);
    } else {
      const posts = await ctx.db
        .query("communityPosts")
        .withIndex("by_date")
        .order("desc")
        .take(limit + offset);
      return posts.slice(offset);
    }
  },
});

export const getPost = query({
  args: { postId: v.id("communityPosts") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.postId);
  },
});

export const upvotePost = mutation({
  args: { postId: v.id("communityPosts") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const userHash = createUserHash(userId);

    // Check if user already upvoted
    const existingUpvote = await ctx.db
      .query("communityUpvotes")
      .withIndex("by_post_and_user", (q) => 
        q.eq("postId", args.postId).eq("userHash", userHash)
      )
      .unique();

    if (existingUpvote) {
      // Remove upvote
      await ctx.db.delete(existingUpvote._id);
      
      const post = await ctx.db.get(args.postId);
      if (post) {
        await ctx.db.patch(args.postId, {
          upvotes: Math.max(0, post.upvotes - 1),
        });
      }
      return { upvoted: false };
    } else {
      // Add upvote
      await ctx.db.insert("communityUpvotes", {
        postId: args.postId,
        userHash,
        createdAt: Date.now(),
      });

      const post = await ctx.db.get(args.postId);
      if (post) {
        await ctx.db.patch(args.postId, {
          upvotes: post.upvotes + 1,
        });
      }
      return { upvoted: true };
    }
  },
});

export const addComment = mutation({
  args: {
    postId: v.id("communityPosts"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const authorHash = createUserHash(userId);

    const commentId = await ctx.db.insert("communityComments", {
      postId: args.postId,
      authorHash,
      content: args.content,
      upvotes: 0,
      createdAt: Date.now(),
    });

    // Update comment count on post
    const post = await ctx.db.get(args.postId);
    if (post) {
      await ctx.db.patch(args.postId, {
        commentCount: post.commentCount + 1,
      });
    }

    return commentId;
  },
});

export const getComments = query({
  args: { postId: v.id("communityPosts") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("communityComments")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .order("asc")
      .collect();
  },
});

export const getUserUpvotes = query({
  args: { postIds: v.array(v.id("communityPosts")) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const userHash = createUserHash(userId);
    const upvotes: string[] = [];

    for (const postId of args.postIds) {
      const upvote = await ctx.db
        .query("communityUpvotes")
        .withIndex("by_post_and_user", (q) => 
          q.eq("postId", postId).eq("userHash", userHash)
        )
        .unique();
      
      if (upvote) {
        upvotes.push(postId);
      }
    }

    return upvotes;
  },
});

export const deletePost = mutation({
  args: { postId: v.id("communityPosts") },
  handler: async (ctx, args) => {
    // No auth check: anyone can delete any post (temporary for admin functionality)
    await ctx.db.delete(args.postId);
    return { success: true };
  },
});
