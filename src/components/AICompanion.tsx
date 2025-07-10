import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Language, AppTexts } from "../App";
import { useSafetyDetection } from "../utils/safetyDetection";

interface AICompanionProps {
  theme: "light" | "dark";
  language: Language;
  texts: AppTexts;
}

const COMPANION_AVATARS = [
  "🤖", "🌸", "🦋", "⭐", "🌙", "💫", "✨", "🌈", "🌺", "🍃"
];

const COMPANION_PERSONALITIES = [
  { id: "supportive", label: "Supportive & Caring", description: "Warm, empathetic, and encouraging", gradient: "from-pink-500 to-rose-500" },
  { id: "wise", label: "Wise & Thoughtful", description: "Reflective, insightful, and philosophical", gradient: "from-purple-500 to-indigo-500" },
  { id: "cheerful", label: "Cheerful & Uplifting", description: "Positive, energetic, and optimistic", gradient: "from-yellow-500 to-orange-500" },
  { id: "calm", label: "Calm & Peaceful", description: "Serene, mindful, and grounding", gradient: "from-blue-500 to-teal-500" },
];

export function AICompanion({ theme, language, texts }: AICompanionProps) {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isCreatingCompanion, setIsCreatingCompanion] = useState(false);
  const [companionName, setCompanionName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(COMPANION_AVATARS[0]);
  const [selectedPersonality, setSelectedPersonality] = useState(COMPANION_PERSONALITIES[0].id);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const companion = useQuery(api.companions.getCompanion);
  const chatHistory = useQuery(api.chat.getChatHistory, 
    companion ? { companionId: companion._id } : "skip"
  );
  
  const sendMessage = useMutation(api.chat.sendMessage);
  const createCompanion = useMutation(api.companions.createCompanion);
  const generateResponse = useAction(api.chat.generateAIResponse);

  const { detectSafetyWords, triggerSafetyModal } = useSafetyDetection(language);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  // Monitor messages for safety words
  useEffect(() => {
    if (message && detectSafetyWords(message)) {
      triggerSafetyModal();
    }
  }, [message, detectSafetyWords, triggerSafetyModal]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !companion || isTyping) return;

    const userMessage = message.trim();
    
    // Check for safety words before sending
    if (detectSafetyWords(userMessage)) {
      triggerSafetyModal();
      setMessage("");
      return;
    }

    setMessage("");
    setIsTyping(true);

    try {
      await sendMessage({
        companionId: companion._id,
        content: userMessage,
      });

      await generateResponse({
        companionId: companion._id,
        userMessage,
      });
    } catch (error) {
      toast.error("Failed to send message");
      console.error(error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleCreateCompanion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companionName.trim()) {
      toast.error("Please enter a name for your companion");
      return;
    }

    try {
      const personality = COMPANION_PERSONALITIES.find(p => p.id === selectedPersonality);
      await createCompanion({
        name: companionName.trim(),
        avatar: selectedAvatar,
        personality: personality?.description,
      });
      toast.success("Your AI companion has been created! 🤖");
      setIsCreatingCompanion(false);
    } catch (error) {
      toast.error("Failed to create companion");
      console.error(error);
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (companion === null) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <div className="text-8xl mb-6 animate-bounce">🤖</div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Create Your AI Companion
          </h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Your personal AI companion will be here to listen, support, and chat with you anytime. 
            They're trained to provide compassionate, non-judgmental support.
          </p>
        </div>

        <div className={`p-8 rounded-3xl shadow-xl backdrop-blur-xl border ${
          theme === "dark" 
            ? "bg-slate-800/50 border-purple-500/20" 
            : "bg-white/70 border-rose-200/50"
        }`}>
          <form onSubmit={handleCreateCompanion} className="space-y-8">
            <div>
              <label className="block text-lg font-semibold mb-3">Companion Name</label>
              <input
                type="text"
                value={companionName}
                onChange={(e) => setCompanionName(e.target.value)}
                placeholder="Give your companion a name..."
                className={`w-full px-6 py-4 rounded-2xl border-2 transition-all text-lg ${
                  theme === "dark"
                    ? "bg-slate-700/50 border-slate-600 text-white placeholder-gray-400 focus:border-purple-400"
                    : "bg-white/80 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-rose-400"
                } focus:ring-4 focus:ring-purple-500/20 outline-none`}
              />
            </div>

            <div>
              <label className="block text-lg font-semibold mb-4">Choose Avatar</label>
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-3">
                {COMPANION_AVATARS.map((avatar) => (
                  <button
                    key={avatar}
                    type="button"
                    onClick={() => setSelectedAvatar(avatar)}
                    className={`w-12 h-12 text-2xl rounded-2xl transition-all transform hover:scale-110 ${
                      selectedAvatar === avatar
                        ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white scale-110 shadow-lg"
                        : theme === "dark"
                        ? "bg-slate-700/50 hover:bg-slate-600/50"
                        : "bg-gray-100/50 hover:bg-gray-200/50"
                    }`}
                  >
                    {avatar}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-lg font-semibold mb-4">Personality</label>
              <div className="space-y-3">
                {COMPANION_PERSONALITIES.map((personality) => (
                  <button
                    key={personality.id}
                    type="button"
                    onClick={() => setSelectedPersonality(personality.id)}
                    className={`w-full p-4 text-left rounded-2xl border-2 transition-all ${
                      selectedPersonality === personality.id
                        ? `border-transparent bg-gradient-to-r ${personality.gradient} text-white shadow-lg`
                        : theme === "dark"
                        ? "border-slate-600 bg-slate-700/50 hover:bg-slate-600/50"
                        : "border-gray-300 bg-white/80 hover:bg-gray-50/80"
                    }`}
                  >
                    <div className="font-semibold text-lg">{personality.label}</div>
                    <div className={`text-sm ${selectedPersonality === personality.id ? 'text-white/90' : 'text-gray-500'}`}>
                      {personality.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-bold rounded-2xl hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 text-lg shadow-lg"
            >
              ✨ Create Companion
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (companion === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-pink-400 rounded-full animate-spin animation-delay-150"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-200px)] flex flex-col">
      {/* Header */}
      <div className={`p-6 rounded-t-3xl border-b ${
        theme === "dark" ? "border-purple-500/20 bg-slate-800/50" : "border-rose-200/50 bg-white/70"
      } backdrop-blur-xl`}>
        <div className="flex items-center space-x-4">
          <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 text-white">
            <span className="text-3xl">{companion.avatar}</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold">{companion.name}</h1>
            <p className="text-gray-500">Your AI Companion • Always here to listen</p>
          </div>
          <div className="ml-auto flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-600 font-medium">Online</span>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className={`flex-1 overflow-y-auto p-6 space-y-6 ${
        theme === "dark" ? "bg-slate-800/30" : "bg-white/30"
      } backdrop-blur-xl`}>
        {chatHistory?.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-6 animate-pulse">{companion.avatar}</div>
            <h3 className="text-2xl font-bold mb-4">Hello! I'm {companion.name}</h3>
            <p className="text-gray-500 mb-6 text-lg max-w-md mx-auto">
              I'm here to listen, support, and chat with you. How are you feeling today? 
              Remember, this is a safe space where you can share anything.
            </p>
            <div className={`p-4 rounded-2xl max-w-md mx-auto ${
              theme === "dark" ? "bg-blue-900/30" : "bg-blue-50"
            }`}>
              <p className="text-sm text-blue-600">
                💙 If you're having thoughts of self-harm, please reach out for immediate help. 
                I'm here to support you, but professional help is always available.
              </p>
            </div>
          </div>
        )}

        {chatHistory?.map((msg) => (
          <div
            key={msg._id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div className={`max-w-xs lg:max-w-md px-6 py-4 rounded-3xl shadow-lg ${
              msg.role === "user"
                ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                : theme === "dark"
                ? "bg-slate-700/80 text-gray-100 border border-purple-500/20"
                : "bg-white/90 text-gray-900 border border-rose-200/50"
            } backdrop-blur-xl`}>
              <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              <p className={`text-xs mt-2 ${
                msg.role === "user" ? "text-blue-100" : "text-gray-500"
              }`}>
                {formatTime(msg.timestamp)}
              </p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className={`max-w-xs lg:max-w-md px-6 py-4 rounded-3xl shadow-lg ${
              theme === "dark" ? "bg-slate-700/80 border border-purple-500/20" : "bg-white/90 border border-rose-200/50"
            } backdrop-blur-xl`}>
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className={`p-6 rounded-b-3xl border-t ${
        theme === "dark" ? "border-purple-500/20 bg-slate-800/50" : "border-rose-200/50 bg-white/70"
      } backdrop-blur-xl`}>
        <form onSubmit={handleSendMessage} className="flex space-x-4">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Share your thoughts... I'm here to listen."
            disabled={isTyping}
            className={`flex-1 px-6 py-4 rounded-2xl border-2 transition-all text-lg ${
              theme === "dark"
                ? "bg-slate-700/50 border-slate-600 text-white placeholder-gray-400 focus:border-purple-400"
                : "bg-white/80 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-rose-400"
            } focus:ring-4 focus:ring-purple-500/20 outline-none disabled:opacity-50`}
          />
          <button
            type="submit"
            disabled={!message.trim() || isTyping}
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl hover:from-blue-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg"
          >
            Send
          </button>
        </form>
        
        <div className="mt-3 text-center">
          <p className="text-xs text-gray-500">
            🔒 Your conversations are private and secure • 💙 Crisis support available 24/7
          </p>
        </div>
      </div>
    </div>
  );
}
