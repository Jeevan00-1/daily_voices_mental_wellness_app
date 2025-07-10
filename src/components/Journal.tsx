import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Language, AppTexts } from "../App";
import { useSafetyDetection } from "../utils/safetyDetection";

interface JournalProps {
  theme: "light" | "dark";
  language: Language;
  texts: AppTexts;
}

const MOODS = [
  { id: "very_happy", label: { en: "Joyful", ja: "喜び" }, emoji: "😄", score: 9, color: "from-yellow-400 to-orange-400" },
  { id: "happy", label: { en: "Happy", ja: "幸せ" }, emoji: "😊", score: 7, color: "from-green-400 to-teal-400" },
  { id: "excited", label: { en: "Excited", ja: "興奮" }, emoji: "🤩", score: 8, color: "from-purple-400 to-pink-400" },
  { id: "grateful", label: { en: "Grateful", ja: "感謝" }, emoji: "🙏", score: 8, color: "from-blue-400 to-indigo-400" },
  { id: "neutral", label: { en: "Neutral", ja: "普通" }, emoji: "😐", score: 5, color: "from-gray-400 to-slate-400" },
  { id: "anxious", label: { en: "Anxious", ja: "不安" }, emoji: "😰", score: 3, color: "from-orange-400 to-red-400" },
  { id: "sad", label: { en: "Sad", ja: "悲しい" }, emoji: "😢", score: 2, color: "from-blue-500 to-purple-500" },
  { id: "angry", label: { en: "Angry", ja: "怒り" }, emoji: "😠", score: 3, color: "from-red-500 to-pink-500" },
  { id: "very_sad", label: { en: "Very Sad", ja: "とても悲しい" }, emoji: "😭", score: 1, color: "from-indigo-500 to-purple-600" },
] as const;

const JOURNAL_TEXTS = {
  en: {
    title: "Your Journal",
    subtitle: "Your private space for reflection and growth",
    newEntry: "New Entry",
    newEntryTitle: "New Journal Entry",
    newEntrySubtitle: "Express your thoughts in your safe space",
    cancel: "Cancel",
    titleLabel: "Title",
    titlePlaceholder: "How are you feeling today?",
    moodLabel: "How are you feeling?",
    contentLabel: "Content",
    contentPlaceholder: "Write about your thoughts, feelings, experiences... This is your safe space.",
    tagsLabel: "Tags",
    addTag: "Add",
    tagPlaceholder: "Add a tag...",
    privateLabel: "Keep this entry private (recommended)",
    saveEntry: "Save Entry Safely",
    moodOverview: "Mood Overview (Last 30 Days)",
    totalEntries: "Total Entries",
    avgMood: "Avg Mood",
    mostCommon: "Most Common",
    entriesPerDay: "Entries/Day",
    startJourney: "Start Your Journey",
    startJourneyDesc: "Begin documenting your thoughts and feelings in your private, secure journal.",
    writeFirst: "Write Your First Entry",
    private: "Private",
    entrySaved: "Journal entry saved safely! 💙",
    fillAllFields: "Please fill in all fields and select a mood",
    saveFailed: "Failed to save entry"
  },
  ja: {
    title: "あなたの日記",
    subtitle: "反省と成長のためのプライベートスペース",
    newEntry: "新しいエントリー",
    newEntryTitle: "新しい日記エントリー",
    newEntrySubtitle: "安全な場所で思いを表現してください",
    cancel: "キャンセル",
    titleLabel: "タイトル",
    titlePlaceholder: "今日はどんな気分ですか？",
    moodLabel: "気分はいかがですか？",
    contentLabel: "内容",
    contentPlaceholder: "思考、感情、体験について書いてください...ここはあなたの安全な場所です。",
    tagsLabel: "タグ",
    addTag: "追加",
    tagPlaceholder: "タグを追加...",
    privateLabel: "このエントリーをプライベートに保つ（推奨）",
    saveEntry: "エントリーを安全に保存",
    moodOverview: "気分の概要（過去30日間）",
    totalEntries: "総エントリー数",
    avgMood: "平均気分",
    mostCommon: "最も一般的",
    entriesPerDay: "1日あたりのエントリー",
    startJourney: "あなたの旅を始めましょう",
    startJourneyDesc: "プライベートで安全な日記で、思考や感情を記録し始めましょう。",
    writeFirst: "最初のエントリーを書く",
    private: "プライベート",
    entrySaved: "日記エントリーが安全に保存されました！💙",
    fillAllFields: "すべてのフィールドを入力し、気分を選択してください",
    saveFailed: "エントリーの保存に失敗しました"
  }
};

export function Journal({ theme, language, texts }: JournalProps) {
  const [isWriting, setIsWriting] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedMood, setSelectedMood] = useState<any>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isPrivate, setIsPrivate] = useState(true);

  const entries = useQuery(api.journal.getEntries, { limit: 10 });
  const moodStats = useQuery(api.journal.getMoodStats, { days: 30 });
  const createEntry = useMutation(api.journal.createEntry);

  const { detectSafetyWords, triggerSafetyModal } = useSafetyDetection(language);
  const journalTexts = JOURNAL_TEXTS[language];

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !selectedMood) {
      toast.error(journalTexts.fillAllFields);
      return;
    }

    // Check for safety words before saving
    if (detectSafetyWords(content) || detectSafetyWords(title)) {
      triggerSafetyModal();
      return;
    }

    try {
      await createEntry({
        title: title.trim(),
        content: content.trim(),
        mood: selectedMood.id as any,
        moodScore: selectedMood.score,
        tags,
        isPrivate,
      });

      toast.success(journalTexts.entrySaved);
      setTitle("");
      setContent("");
      setSelectedMood(null);
      setTags([]);
      setIsWriting(false);
    } catch (error) {
      toast.error(journalTexts.saveFailed);
      console.error(error);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(language === "ja" ? "ja-JP" : "en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString(language === "ja" ? "ja-JP" : "en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isWriting) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {journalTexts.newEntryTitle}
            </h1>
            <p className="text-gray-500 mt-2">{journalTexts.newEntrySubtitle}</p>
          </div>
          <button
            onClick={() => setIsWriting(false)}
            className={`px-6 py-3 rounded-2xl font-semibold transition-all ${
              theme === "dark"
                ? "bg-slate-700 hover:bg-slate-600 text-gray-300"
                : "bg-gray-200 hover:bg-gray-300 text-gray-700"
            }`}
          >
            {journalTexts.cancel}
          </button>
        </div>

        <div className={`p-8 rounded-3xl shadow-xl backdrop-blur-xl border ${
          theme === "dark" 
            ? "bg-slate-800/50 border-purple-500/20" 
            : "bg-white/70 border-rose-200/50"
        }`}>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block text-lg font-semibold mb-3">{journalTexts.titleLabel}</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={journalTexts.titlePlaceholder}
                className={`w-full px-6 py-4 rounded-2xl border-2 transition-all text-lg ${
                  theme === "dark"
                    ? "bg-slate-700/50 border-slate-600 text-white placeholder-gray-400 focus:border-purple-400"
                    : "bg-white/80 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-rose-400"
                } focus:ring-4 focus:ring-purple-500/20 outline-none`}
              />
            </div>

            <div>
              <label className="block text-lg font-semibold mb-4">{journalTexts.moodLabel}</label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
                {MOODS.map((mood) => (
                  <button
                    key={mood.id}
                    type="button"
                    onClick={() => setSelectedMood(mood)}
                    className={`p-4 rounded-2xl text-center transition-all transform hover:scale-105 ${
                      selectedMood?.id === mood.id
                        ? `bg-gradient-to-r ${mood.color} text-white shadow-lg scale-105`
                        : theme === "dark"
                        ? "bg-slate-700/50 hover:bg-slate-600/50 text-gray-300"
                        : "bg-gray-100/50 hover:bg-gray-200/50 text-gray-700"
                    }`}
                  >
                    <div className="text-3xl mb-2">{mood.emoji}</div>
                    <div className="text-sm font-medium">{mood.label[language]}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-lg font-semibold mb-3">{journalTexts.contentLabel}</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={journalTexts.contentPlaceholder}
                rows={10}
                className={`w-full px-6 py-4 rounded-2xl border-2 transition-all resize-none text-lg ${
                  theme === "dark"
                    ? "bg-slate-700/50 border-slate-600 text-white placeholder-gray-400 focus:border-purple-400"
                    : "bg-white/80 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-rose-400"
                } focus:ring-4 focus:ring-purple-500/20 outline-none`}
              />
            </div>

            <div>
              <label className="block text-lg font-semibold mb-3">{journalTexts.tagsLabel}</label>
              <div className="flex flex-wrap gap-3 mb-4">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-4 py-2 rounded-full text-sm bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 text-white/80 hover:text-white"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  placeholder={journalTexts.tagPlaceholder}
                  className={`flex-1 px-4 py-3 rounded-xl border text-sm ${
                    theme === "dark"
                      ? "bg-slate-700/50 border-slate-600 text-white placeholder-gray-400"
                      : "bg-white/80 border-gray-300 text-gray-900 placeholder-gray-500"
                  } focus:border-purple-400 outline-none`}
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all font-semibold"
                >
                  {journalTexts.addTag}
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="private"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
              />
              <label htmlFor="private" className="text-lg font-medium">
                🔒 {journalTexts.privateLabel}
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 text-white font-bold rounded-2xl hover:from-purple-600 hover:via-pink-600 hover:to-rose-600 transition-all transform hover:scale-105 text-lg shadow-lg"
            >
              ✨ {journalTexts.saveEntry}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {journalTexts.title}
          </h1>
          <p className="text-gray-500 mt-2 text-lg">{journalTexts.subtitle}</p>
        </div>
        <button
          onClick={() => setIsWriting(true)}
          className="px-8 py-4 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 text-white font-bold rounded-2xl hover:from-purple-600 hover:via-pink-600 hover:to-rose-600 transition-all transform hover:scale-105 shadow-lg text-lg"
        >
          ✏️ {journalTexts.newEntry}
        </button>
      </div>

      {moodStats && (
        <div className={`p-8 rounded-3xl mb-8 shadow-xl backdrop-blur-xl border ${
          theme === "dark" 
            ? "bg-slate-800/50 border-purple-500/20" 
            : "bg-white/70 border-rose-200/50"
        }`}>
          <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
            {journalTexts.moodOverview}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div className="text-center p-4 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 text-white">
              <div className="text-3xl font-bold">
                {moodStats.totalEntries}
              </div>
              <div className="text-sm opacity-90">{journalTexts.totalEntries}</div>
            </div>
            <div className="text-center p-4 rounded-2xl bg-gradient-to-r from-green-500 to-teal-500 text-white">
              <div className="text-3xl font-bold">
                {moodStats.averageMoodScore.toFixed(1)}
              </div>
              <div className="text-sm opacity-90">{journalTexts.avgMood}</div>
            </div>
            <div className="text-center p-4 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              <div className="text-3xl">
                {Object.entries(moodStats.moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] 
                  ? MOODS.find(m => m.id === Object.entries(moodStats.moodCounts).sort((a, b) => b[1] - a[1])[0][0])?.emoji 
                  : "😐"}
              </div>
              <div className="text-sm opacity-90">{journalTexts.mostCommon}</div>
            </div>
            <div className="text-center p-4 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 text-white">
              <div className="text-3xl font-bold">
                {Math.round(moodStats.totalEntries / 30 * 10) / 10}
              </div>
              <div className="text-sm opacity-90">{journalTexts.entriesPerDay}</div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {entries?.map((entry) => {
          const mood = MOODS.find(m => m.id === entry.mood);
          return (
            <div
              key={entry._id}
              className={`p-8 rounded-3xl shadow-xl backdrop-blur-xl border transition-all hover:scale-[1.02] ${
                theme === "dark" 
                  ? "bg-slate-800/50 border-purple-500/20 hover:bg-slate-700/50" 
                  : "bg-white/70 border-rose-200/50 hover:bg-white/80"
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-2xl bg-gradient-to-r ${mood?.color} text-white`}>
                    <span className="text-2xl">{mood?.emoji}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-xl">{entry.title}</h3>
                    <p className="text-gray-500">
                      {formatDate(entry.createdAt)} at {formatTime(entry.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {entry.isPrivate && (
                    <span className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                      🔒 {journalTexts.private}
                    </span>
                  )}
                </div>
              </div>
              
              <p className="text-gray-700 dark:text-gray-300 mb-4 text-lg leading-relaxed">
                {entry.content}
              </p>
              
              {entry.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {entry.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-sm px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {entries?.length === 0 && (
          <div className="text-center py-16">
            <div className="text-8xl mb-6 animate-bounce">📝</div>
            <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {journalTexts.startJourney}
            </h3>
            <p className="text-gray-500 mb-8 text-lg max-w-md mx-auto">
              {journalTexts.startJourneyDesc}
            </p>
            <button
              onClick={() => setIsWriting(true)}
              className="px-8 py-4 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 text-white font-bold rounded-2xl hover:from-purple-600 hover:via-pink-600 hover:to-rose-600 transition-all transform hover:scale-105 shadow-lg text-lg"
            >
              ✨ {journalTexts.writeFirst}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
