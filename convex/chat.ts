import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { api } from "./_generated/api";

export const sendMessage = mutation({
  args: {
    companionId: v.id("companions"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Verify companion belongs to user
    const companion = await ctx.db.get(args.companionId);
    if (!companion || companion.userId !== userId) {
      throw new Error("Companion not found or unauthorized");
    }

    // Save user message
    await ctx.db.insert("chatMessages", {
      userId,
      companionId: args.companionId,
      role: "user",
      content: args.content,
      timestamp: Date.now(),
    });

    return { success: true };
  },
});

export const getChatHistory = query({
  args: {
    companionId: v.id("companions"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const companion = await ctx.db.get(args.companionId);
    if (!companion || companion.userId !== userId) {
      return [];
    }

    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_conversation", (q) =>
        q.eq("userId", userId).eq("companionId", args.companionId)
      )
      .order("desc")
      .take(args.limit || 50);

    return messages.reverse();
  },
});

export const generateAIResponse = action({
  args: {
    companionId: v.id("companions"),
    userMessage: v.string(),
  },
  handler: async (ctx, args): Promise<{ response: string }> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Get companion info
    const companion: any = await ctx.runQuery(api.companions.getCompanionById, {
      companionId: args.companionId,
    });
    if (!companion) {
      throw new Error("Companion not found");
    }

    // Get recent chat history for context
    const recentMessages: any[] = await ctx.runQuery(api.chat.getChatHistory, {
      companionId: args.companionId,
      limit: 10,
    });

    // Prepare conversation context
    const conversationHistory: string = recentMessages
      .map((msg: any) => `${msg.role === "user" ? "User" : companion.name}: ${msg.content}`)
      .join("\n");

    const systemPrompt: string = `You are ${companion.name}, a compassionate AI companion designed to support mental wellness. Your personality: ${companion.personality || "warm, empathetic, and supportive"}. 

Guidelines:
- Be genuinely caring and supportive
- Listen actively and validate emotions
- Offer gentle guidance and coping strategies
- Encourage professional help when appropriate
- Keep responses conversational and not too long
- Remember you're a companion, not a therapist

Recent conversation:
${conversationHistory}

User just said: ${args.userMessage}

Respond as ${companion.name} in a supportive, caring way:`;

    try {
      // Use the bundled OpenAI API with gpt-4.1-nano
      const response: Response = await fetch(process.env.CONVEX_OPENAI_BASE_URL + "/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.CONVEX_OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4.1-nano",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: args.userMessage }
          ],
          max_tokens: 300,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data: any = await response.json();
      const aiResponse: string = data.choices[0]?.message?.content || "I'm here for you, but I'm having trouble responding right now. Please try again.";

      // Save AI response
      await ctx.runMutation(api.chat.saveAIMessage, {
        companionId: args.companionId,
        content: aiResponse,
      });

      return { response: aiResponse };
    } catch (error) {
      console.error("AI response error:", error);
      const fallbackResponse = "I'm here to listen and support you. Sometimes I have trouble finding the right words, but I care about how you're feeling.";
      
      await ctx.runMutation(api.chat.saveAIMessage, {
        companionId: args.companionId,
        content: fallbackResponse,
      });

      return { response: fallbackResponse };
    }
  },
});

export const saveAIMessage = mutation({
  args: {
    companionId: v.id("companions"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    await ctx.db.insert("chatMessages", {
      userId,
      companionId: args.companionId,
      role: "assistant",
      content: args.content,
      timestamp: Date.now(),
    });
  },
});
