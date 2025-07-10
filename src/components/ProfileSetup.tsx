import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Language, AppTexts } from "../App";

const AVATAR_EMOJIS = [
  "😊", "😌", "🌸", "🌺", "🦋", "🌙", "⭐", "🌈", 
  "🍃", "🌿", "🌻", "🌷", "🎨", "📝", "💫", "✨"
];

interface ProfileSetupProps {
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
  language: Language;
  setLanguage: (language: Language) => void;
  texts: AppTexts;
}

export function ProfileSetup({ theme, setTheme, language, setLanguage, texts }: ProfileSetupProps) {
  const [username, setUsername] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_EMOJIS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createProfile = useMutation(api.profiles.createProfile);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      toast.error("Please enter a username");
      return;
    }

    setIsSubmitting(true);
    try {
      await createProfile({
        username: username.trim(),
        avatar: selectedAvatar,
        theme,
        language,
      });
      toast.success("Welcome to Daily Voices!");
    } catch (error) {
      toast.error("Failed to create profile. Please try again.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className={`sticky top-0 z-10 backdrop-blur-sm h-16 flex justify-between items-center border-b shadow-sm px-4 ${
        theme === "dark" 
          ? "bg-gray-800/80 border-gray-700" 
          : "bg-white/80 border-gray-200"
      }`}>
        <div className="flex items-center space-x-3">
          <div className="text-2xl">🌸</div>
          <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {texts.appName}
          </h2>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={() => setLanguage("en")} className={`px-3 py-1 rounded-lg text-sm ${language === "en" ? "bg-purple-500 text-white" : "text-gray-500"}`}>EN</button>
          <button onClick={() => setLanguage("ja")} className={`px-3 py-1 rounded-lg text-sm ${language === "ja" ? "bg-purple-500 text-white" : "text-gray-500"}`}>日本語</button>
          <button onClick={() => setTheme(theme === "light" ? "dark" : "light")} className="p-2 rounded-lg">{theme === "light" ? "🌙" : "☀️"}</button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🌸</div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Welcome to Daily Voices
            </h1>
            <p className="text-gray-500">Let's set up your profile</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Choose your username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter a username"
                className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                  theme === "dark"
                    ? "bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500"
                } focus:ring-2 focus:ring-blue-500/20 outline-none`}
                maxLength={30}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-3">
                Choose your avatar
              </label>
              <div className="grid grid-cols-8 gap-2">
                {AVATAR_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setSelectedAvatar(emoji)}
                    className={`w-10 h-10 text-xl rounded-lg transition-all ${
                      selectedAvatar === emoji
                        ? "bg-blue-500 text-white scale-110"
                        : theme === "dark"
                        ? "bg-gray-700 hover:bg-gray-600"
                        : "bg-gray-100 hover:bg-gray-200"
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !username.trim()}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Creating Profile..." : "Continue"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
