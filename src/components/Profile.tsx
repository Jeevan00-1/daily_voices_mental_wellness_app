import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Language, AppTexts } from "../App";

interface ProfileProps {
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
  profile: any;
  language: Language;
  setLanguage: (language: Language) => void;
  texts: AppTexts;
}

const AVATAR_EMOJIS = [
  "😊", "😌", "🌸", "🌺", "🦋", "🌙", "⭐", "🌈", 
  "🍃", "🌿", "🌻", "🌷", "🎨", "📝", "💫", "✨",
  "🌊", "🔥", "❄️", "🌱", "🌟", "💎", "🎭", "🎪",
  "🎨", "🎵", "🎸", "🎹", "🎤", "🎧", "📚", "✏️"
];

const BACKGROUND_COLORS = [
  { id: "default", name: "Default", gradient: "from-rose-50 via-teal-50 to-blue-50" },
  { id: "sunset", name: "Sunset", gradient: "from-orange-200 via-pink-200 to-purple-200" },
  { id: "ocean", name: "Ocean", gradient: "from-blue-200 via-cyan-200 to-teal-200" },
  { id: "forest", name: "Forest", gradient: "from-green-200 via-emerald-200 to-teal-200" },
  { id: "lavender", name: "Lavender", gradient: "from-purple-200 via-pink-200 to-indigo-200" },
  { id: "cherry", name: "Cherry Blossom", gradient: "from-pink-200 via-rose-200 to-red-200" },
  { id: "mint", name: "Mint", gradient: "from-green-100 via-teal-100 to-cyan-100" },
  { id: "peach", name: "Peach", gradient: "from-orange-100 via-pink-100 to-yellow-100" }
];

const DARK_BACKGROUNDS = [
  { id: "default", name: "Default", gradient: "from-slate-900 via-purple-900 to-slate-900" },
  { id: "midnight", name: "Midnight", gradient: "from-gray-900 via-blue-900 to-black" },
  { id: "cosmic", name: "Cosmic", gradient: "from-purple-900 via-indigo-900 to-black" },
  { id: "deep", name: "Deep Ocean", gradient: "from-blue-900 via-teal-900 to-cyan-900" },
  { id: "forest", name: "Dark Forest", gradient: "from-green-900 via-emerald-900 to-teal-900" },
  { id: "wine", name: "Wine", gradient: "from-red-900 via-purple-900 to-pink-900" }
];

const FONT_SIZES = [
  { id: "small", name: "Small", class: "text-sm" },
  { id: "medium", name: "Medium", class: "text-base" },
  { id: "large", name: "Large", class: "text-lg" },
  { id: "xl", name: "Extra Large", class: "text-xl" }
];

const PROFILE_TEXTS = {
  en: {
    title: "Profile Settings",
    profileInfo: "Profile Information",
    username: "Username",
    avatar: "Avatar",
    appearance: "Appearance",
    theme: "Theme",
    themeDesc: "Choose your preferred theme",
    language: "Language",
    languageDesc: "Choose your preferred language",
    background: "Background",
    backgroundDesc: "Choose your background style",
    fontSize: "Font Size",
    fontSizeDesc: "Choose your preferred text size",
    privacy: "Privacy & Data",
    journalEntries: "Journal Entries",
    journalDesc: "All entries are private by default",
    communityPosts: "Community Posts",
    communityDesc: "Shared anonymously to protect your identity",
    aiConversations: "AI Conversations",
    aiDesc: "Private conversations with your companion",
    memberSince: "Member since",
    edit: "Edit Profile",
    save: "Save",
    cancel: "Cancel",
    secure: "Secure",
    anonymous: "Anonymous",
    private: "Private",
    light: "Light",
    dark: "Dark",
    english: "English",
    japanese: "Japanese"
  },
  ja: {
    title: "プロフィール設定",
    profileInfo: "プロフィール情報",
    username: "ユーザー名",
    avatar: "アバター",
    appearance: "外観",
    theme: "テーマ",
    themeDesc: "お好みのテーマを選択してください",
    language: "言語",
    languageDesc: "お好みの言語を選択してください",
    background: "背景",
    backgroundDesc: "背景スタイルを選択してください",
    fontSize: "フォントサイズ",
    fontSizeDesc: "お好みのテキストサイズを選択してください",
    privacy: "プライバシーとデータ",
    journalEntries: "日記エントリー",
    journalDesc: "すべてのエントリーはデフォルトでプライベートです",
    communityPosts: "コミュニティ投稿",
    communityDesc: "あなたのアイデンティティを保護するために匿名で共有されます",
    aiConversations: "AI会話",
    aiDesc: "コンパニオンとのプライベート会話",
    memberSince: "メンバー登録日",
    edit: "プロフィール編集",
    save: "保存",
    cancel: "キャンセル",
    secure: "安全",
    anonymous: "匿名",
    private: "プライベート",
    light: "ライト",
    dark: "ダーク",
    english: "英語",
    japanese: "日本語"
  }
};

export function Profile({ theme, setTheme, profile, language, setLanguage, texts }: ProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState(profile.username);
  const [selectedAvatar, setSelectedAvatar] = useState(profile.avatar);
  const [selectedBackground, setSelectedBackground] = useState(profile.background || "default");
  const [selectedFontSize, setSelectedFontSize] = useState(profile.fontSize || "medium");

  const updateProfile = useMutation(api.profiles.updateProfile);

  const profileTexts = PROFILE_TEXTS[language];

  const handleSave = async () => {
    try {
      await updateProfile({
        username: username.trim(),
        avatar: selectedAvatar,
        theme,
        language,
        background: selectedBackground,
        fontSize: selectedFontSize,
      });
      toast.success(language === "en" ? "Profile updated!" : "プロフィールが更新されました！");
      setIsEditing(false);
    } catch (error) {
      toast.error(language === "en" ? "Failed to update profile" : "プロフィールの更新に失敗しました");
      console.error(error);
    }
  };

  const handleCancel = () => {
    setUsername(profile.username);
    setSelectedAvatar(profile.avatar);
    setSelectedBackground(profile.background || "default");
    setSelectedFontSize(profile.fontSize || "medium");
    setIsEditing(false);
  };

  const backgroundOptions = theme === "dark" ? DARK_BACKGROUNDS : BACKGROUND_COLORS;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-8">
        {profileTexts.title}
      </h1>

      <div className="space-y-8">
        {/* Profile Info */}
        <div className={`p-8 rounded-3xl shadow-xl backdrop-blur-xl border ${
          theme === "dark" 
            ? "bg-slate-800/50 border-purple-500/20" 
            : "bg-white/70 border-rose-200/50"
        }`}>
          <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
            {profileTexts.profileInfo}
          </h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-lg font-semibold mb-3">{profileTexts.username}</label>
              {isEditing ? (
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`w-full px-6 py-4 rounded-2xl border-2 transition-all text-lg ${
                    theme === "dark"
                      ? "bg-slate-700/50 border-slate-600 text-white focus:border-purple-400"
                      : "bg-white/80 border-gray-300 text-gray-900 focus:border-rose-400"
                  } focus:ring-4 focus:ring-purple-500/20 outline-none`}
                />
              ) : (
                <p className="text-xl font-medium">{profile.username}</p>
              )}
            </div>

            <div>
              <label className="block text-lg font-semibold mb-4">{profileTexts.avatar}</label>
              {isEditing ? (
                <div className="grid grid-cols-8 gap-3">
                  {AVATAR_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setSelectedAvatar(emoji)}
                      className={`w-12 h-12 text-2xl rounded-2xl transition-all transform hover:scale-110 ${
                        selectedAvatar === emoji
                          ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white scale-110 shadow-lg"
                          : theme === "dark"
                          ? "bg-slate-700/50 hover:bg-slate-600/50"
                          : "bg-gray-100/50 hover:bg-gray-200/50"
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-6xl">{profile.avatar}</div>
              )}
            </div>

            <div className="flex items-center justify-between pt-6">
              <div className="text-sm text-gray-500">
                {profileTexts.memberSince} {new Date(profile.createdAt).toLocaleDateString()}
              </div>
              
              {isEditing ? (
                <div className="flex gap-4">
                  <button
                    onClick={handleCancel}
                    className={`px-6 py-3 rounded-2xl font-semibold transition-all ${
                      theme === "dark"
                        ? "bg-slate-700 hover:bg-slate-600 text-gray-300"
                        : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                    }`}
                  >
                    {profileTexts.cancel}
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl hover:from-blue-600 hover:to-purple-600 transition-all font-semibold shadow-lg"
                  >
                    {profileTexts.save}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl hover:from-blue-600 hover:to-purple-600 transition-all font-semibold shadow-lg"
                >
                  {profileTexts.edit}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Appearance Settings */}
        <div className={`p-8 rounded-3xl shadow-xl backdrop-blur-xl border ${
          theme === "dark" 
            ? "bg-slate-800/50 border-purple-500/20" 
            : "bg-white/70 border-rose-200/50"
        }`}>
          <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {profileTexts.appearance}
          </h2>
          
          <div className="space-y-8">
            {/* Theme */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold">{profileTexts.theme}</div>
                <div className="text-sm text-gray-500">{profileTexts.themeDesc}</div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setTheme("light")}
                  className={`px-6 py-3 rounded-2xl font-semibold transition-all ${
                    theme === "light"
                      ? "bg-gradient-to-r from-yellow-400 to-orange-400 text-white shadow-lg"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300"
                  }`}
                >
                  ☀️ {profileTexts.light}
                </button>
                <button
                  onClick={() => setTheme("dark")}
                  className={`px-6 py-3 rounded-2xl font-semibold transition-all ${
                    theme === "dark"
                      ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300"
                  }`}
                >
                  🌙 {profileTexts.dark}
                </button>
              </div>
            </div>

            {/* Language */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold">{profileTexts.language}</div>
                <div className="text-sm text-gray-500">{profileTexts.languageDesc}</div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setLanguage("en")}
                  className={`px-6 py-3 rounded-2xl font-semibold transition-all ${
                    language === "en"
                      ? "bg-gradient-to-r from-blue-500 to-teal-500 text-white shadow-lg"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300"
                  }`}
                >
                  🇺🇸 {profileTexts.english}
                </button>
                <button
                  onClick={() => setLanguage("ja")}
                  className={`px-6 py-3 rounded-2xl font-semibold transition-all ${
                    language === "ja"
                      ? "bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300"
                  }`}
                >
                  🇯🇵 {profileTexts.japanese}
                </button>
              </div>
            </div>

            {/* Background */}
            {isEditing && (
              <div>
                <div className="text-lg font-semibold mb-2">{profileTexts.background}</div>
                <div className="text-sm text-gray-500 mb-4">{profileTexts.backgroundDesc}</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {backgroundOptions.map((bg) => (
                    <button
                      key={bg.id}
                      onClick={() => setSelectedBackground(bg.id)}
                      className={`p-4 rounded-2xl border-2 transition-all ${
                        selectedBackground === bg.id
                          ? "border-purple-500 scale-105"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <div className={`w-full h-8 rounded-lg bg-gradient-to-r ${bg.gradient} mb-2`}></div>
                      <div className="text-xs font-medium">{bg.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Font Size */}
            {isEditing && (
              <div>
                <div className="text-lg font-semibold mb-2">{profileTexts.fontSize}</div>
                <div className="text-sm text-gray-500 mb-4">{profileTexts.fontSizeDesc}</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {FONT_SIZES.map((size) => (
                    <button
                      key={size.id}
                      onClick={() => setSelectedFontSize(size.id)}
                      className={`p-4 rounded-2xl border-2 transition-all ${
                        selectedFontSize === size.id
                          ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <div className={`${size.class} font-medium`}>Aa</div>
                      <div className="text-xs mt-1">{size.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Privacy & Data */}
        <div className={`p-8 rounded-3xl shadow-xl backdrop-blur-xl border ${
          theme === "dark" 
            ? "bg-slate-800/50 border-purple-500/20" 
            : "bg-white/70 border-rose-200/50"
        }`}>
          <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
            {profileTexts.privacy}
          </h2>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold">{profileTexts.journalEntries}</div>
                <div className="text-sm text-gray-500">{profileTexts.journalDesc}</div>
              </div>
              <span className="text-green-500 text-sm font-medium">🔒 {profileTexts.secure}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold">{profileTexts.communityPosts}</div>
                <div className="text-sm text-gray-500">{profileTexts.communityDesc}</div>
              </div>
              <span className="text-green-500 text-sm font-medium">👤 {profileTexts.anonymous}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold">{profileTexts.aiConversations}</div>
                <div className="text-sm text-gray-500">{profileTexts.aiDesc}</div>
              </div>
              <span className="text-green-500 text-sm font-medium">🔒 {profileTexts.private}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
