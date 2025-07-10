import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Language, AppTexts } from "../App";
import { useSafetyDetection } from "../utils/safetyDetection";

interface CommunityProps {
  theme: "light" | "dark";
  language: Language;
  texts: AppTexts;
}

const CATEGORIES = [
  { id: "story", label: "Story", emoji: "📖", description: "Share your experiences" },
  { id: "advice", label: "Advice", emoji: "💡", description: "Seek or offer guidance" },
  { id: "support", label: "Support", emoji: "🤝", description: "Find encouragement" },
  { id: "gratitude", label: "Gratitude", emoji: "🙏", description: "Express thankfulness" },
  { id: "milestone", label: "Milestone", emoji: "🎉", description: "Celebrate achievements" },
] as const;

export function Community({ theme, language, texts }: CommunityProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"recent" | "popular">("recent");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [postCategory, setPostCategory] = useState<"story" | "advice" | "support" | "gratitude" | "milestone">("story");

  const posts = useQuery(api.community.getPosts, {
    category: selectedCategory === "all" ? undefined : selectedCategory as any,
    sortBy,
    limit: 20,
  });

  const userUpvotes = useQuery(api.community.getUserUpvotes, {
    postIds: posts?.map(p => p._id) || [],
  });

  const createPost = useMutation(api.community.createPost);
  const upvotePost = useMutation(api.community.upvotePost);

  const { detectSafetyWords, triggerSafetyModal } = useSafetyDetection(language);

  // Monitor content for safety words
  useEffect(() => {
    if (content && detectSafetyWords(content)) {
      triggerSafetyModal();
    }
  }, [content, detectSafetyWords, triggerSafetyModal]);

  // Monitor title for safety words
  useEffect(() => {
    if (title && detectSafetyWords(title)) {
      triggerSafetyModal();
    }
  }, [title, detectSafetyWords, triggerSafetyModal]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    // Check for safety words before posting
    if (detectSafetyWords(content) || detectSafetyWords(title)) {
      triggerSafetyModal();
      return;
    }

    try {
      await createPost({
        title: title.trim(),
        content: content.trim(),
        category: postCategory,
      });

      toast.success("Post shared with the community!");
      setTitle("");
      setContent("");
      setIsCreating(false);
    } catch (error) {
      toast.error("Failed to create post");
      console.error(error);
    }
  };

  const handleUpvote = async (postId: string) => {
    try {
      await upvotePost({ postId: postId as any });
    } catch (error) {
      toast.error("Failed to upvote post");
      console.error(error);
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
  };

  if (isCreating) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Share with Community</h1>
          <button
            onClick={() => setIsCreating(false)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              theme === "dark"
                ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                : "bg-gray-200 hover:bg-gray-300 text-gray-700"
            }`}
          >
            Cancel
          </button>
        </div>

        <div className={`p-4 rounded-lg mb-6 ${
          theme === "dark" ? "bg-gray-800 border border-gray-700" : "bg-blue-50 border border-blue-200"
        }`}>
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-lg">🔒</span>
            <span className="font-medium">Anonymous Sharing</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Your identity is completely protected. Posts are shared anonymously to maintain your privacy 
            while allowing you to connect with others.
          </p>
        </div>

        <form onSubmit={handleCreatePost} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-3">Category</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setPostCategory(category.id)}
                  className={`p-3 text-left rounded-lg border transition-colors ${
                    postCategory === category.id
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : theme === "dark"
                      ? "border-gray-600 bg-gray-700 hover:bg-gray-600"
                      : "border-gray-300 bg-white hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-lg">{category.emoji}</span>
                    <span className="font-medium">{category.label}</span>
                  </div>
                  <p className="text-xs text-gray-500">{category.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your post a meaningful title..."
              className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                theme === "dark"
                  ? "bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
              } focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your story, ask for advice, or offer support..."
              rows={8}
              className={`w-full px-4 py-3 rounded-lg border transition-colors resize-none ${
                theme === "dark"
                  ? "bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
              } focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none`}
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all"
          >
            Share Anonymously
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Community</h1>
        <button
          onClick={() => setIsCreating(true)}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all"
        >
          ✍️ Share
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === "all"
                ? "bg-blue-500 text-white"
                : theme === "dark"
                ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                : "bg-gray-200 hover:bg-gray-300 text-gray-700"
            }`}
          >
            All
          </button>
          {CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === category.id
                  ? "bg-blue-500 text-white"
                  : theme === "dark"
                  ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-700"
              }`}
            >
              {category.emoji} {category.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setSortBy("recent")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              sortBy === "recent"
                ? "bg-blue-500 text-white"
                : theme === "dark"
                ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                : "bg-gray-200 hover:bg-gray-300 text-gray-700"
            }`}
          >
            Recent
          </button>
          <button
            onClick={() => setSortBy("popular")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              sortBy === "popular"
                ? "bg-blue-500 text-white"
                : theme === "dark"
                ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                : "bg-gray-200 hover:bg-gray-300 text-gray-700"
            }`}
          >
            Popular
          </button>
        </div>
      </div>

      {/* Posts */}
      <div className="space-y-4">
        {posts?.map((post) => {
          const category = CATEGORIES.find(c => c.id === post.category);
          const isUpvoted = userUpvotes?.includes(post._id);
          
          return (
            <div
              key={post._id}
              className={`p-6 rounded-lg shadow-sm border transition-colors ${
                theme === "dark" 
                  ? "bg-gray-800 border-gray-700 hover:bg-gray-750" 
                  : "bg-white border-gray-200 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{category?.emoji}</span>
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold text-lg">{post.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        theme === "dark" ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"
                      }`}>
                        {category?.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      Anonymous • {formatTimeAgo(post.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-700 dark:text-gray-300 mb-4 whitespace-pre-wrap">
                {post.content}
              </p>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handleUpvote(post._id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                    isUpvoted
                      ? "bg-blue-500 text-white"
                      : theme === "dark"
                      ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  }`}
                >
                  <span>{isUpvoted ? "❤️" : "🤍"}</span>
                  <span className="text-sm">{post.upvotes}</span>
                </button>
                
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span>💬</span>
                  <span>{post.commentCount} comments</span>
                </div>
              </div>
            </div>
          );
        })}

        {posts?.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🌍</div>
            <h3 className="text-xl font-semibold mb-2">Welcome to the Community</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              This is a safe space to share your experiences, seek support, and connect with others 
              on their mental wellness journey. All posts are anonymous.
            </p>
            <button
              onClick={() => setIsCreating(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all"
            >
              Share Your Story
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
