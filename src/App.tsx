import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { useState, useEffect } from "react";
import { ProfileSetup } from "./components/ProfileSetup";
import { MainApp } from "./components/MainApp";
import { SafetyModal } from "./components/SafetyModal";

export type Language = "en" | "ja";

export interface AppTexts {
  appName: string;
  tagline: string;
  features: {
    privacy: string;
    aiCompanion: string;
    journaling: string;
    community: string;
  };
  security: {
    private: string;
    encrypted: string;
    hipaa: string;
    anonymous: string;
  };
  crisis: {
    needHelp: string;
  };
}

const TEXTS: Record<Language, AppTexts> = {
  en: {
    appName: "Daily Voices",
    tagline: "Your Personal Wellness Sanctuary",
    features: {
      privacy: "Complete privacy & anonymity",
      aiCompanion: "AI companion for 24/7 support",
      journaling: "Private journaling & mood tracking",
      community: "Anonymous community connection"
    },
    security: {
      private: "Private",
      encrypted: "End-to-end encrypted",
      hipaa: "HIPAA compliant",
      anonymous: "Anonymous sharing"
    },
    crisis: {
      needHelp: "Need immediate help? Call 988 (US) or your local crisis line"
    }
  },
  ja: {
    appName: "日々の声",
    tagline: "あなたの心の安らぎの場所",
    features: {
      privacy: "完全なプライバシーと匿名性",
      aiCompanion: "24時間サポートのAIコンパニオン",
      journaling: "プライベート日記と気分追跡",
      community: "匿名コミュニティ接続"
    },
    security: {
      private: "プライベート",
      encrypted: "エンドツーエンド暗号化",
      hipaa: "HIPAA準拠",
      anonymous: "匿名共有"
    },
    crisis: {
      needHelp: "緊急時のヘルプが必要ですか？988（米国）または地域の危機ホットラインにお電話ください"
    }
  }
};

export default function App() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [language, setLanguage] = useState<Language>("en");
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [userCountry, setUserCountry] = useState<string>("US");

  useEffect(() => {
    // Apply theme to document
    document.documentElement.classList.toggle("dark", theme === "dark");
    
    // Detect user's country and language
    fetch('https://ipapi.co/json/')
      .then(response => response.json())
      .then(data => {
        if (data.country_code) {
          setUserCountry(data.country_code);
          // Set Japanese if in Japan
          if (data.country_code === "JP") {
            setLanguage("ja");
          }
        }
      })
      .catch(() => {
        setUserCountry("US");
      });
  }, [theme]);

  // Global safety word detection
  useEffect(() => {
    const handleSafetyTrigger = (event: CustomEvent) => {
      setShowSafetyModal(true);
    };

    window.addEventListener('safetyTrigger', handleSafetyTrigger as EventListener);
    return () => {
      window.removeEventListener('safetyTrigger', handleSafetyTrigger as EventListener);
    };
  }, []);

  const texts = TEXTS[language];

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      theme === "dark" 
        ? "bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white" 
        : "bg-gradient-to-br from-rose-50 via-teal-50 to-blue-50 text-gray-900"
    }`}>
      <Authenticated>
        <AuthenticatedApp 
          theme={theme} 
          setTheme={setTheme} 
          language={language}
          setLanguage={setLanguage}
          texts={texts}
        />
      </Authenticated>
      <Unauthenticated>
        <UnauthenticatedApp 
          theme={theme} 
          language={language}
          setLanguage={setLanguage}
          texts={texts}
        />
      </Unauthenticated>
      
      <SafetyModal 
        isOpen={showSafetyModal}
        onClose={() => setShowSafetyModal(false)}
        theme={theme}
        country={userCountry}
        language={language}
      />
      
      <Toaster 
        theme={theme}
        position="top-right"
        toastOptions={{
          style: {
            background: theme === "dark" ? "rgba(30, 41, 59, 0.95)" : "rgba(255, 255, 255, 0.95)",
            color: theme === "dark" ? "#f1f5f9" : "#1e293b",
            border: theme === "dark" ? "1px solid rgba(148, 163, 184, 0.2)" : "1px solid rgba(203, 213, 225, 0.5)",
            backdropFilter: "blur(12px)",
            borderRadius: "16px",
          },
        }}
      />
    </div>
  );
}

function AuthenticatedApp({ theme, setTheme, language, setLanguage, texts }: { 
  theme: "light" | "dark"; 
  setTheme: (theme: "light" | "dark") => void; 
  language: Language;
  setLanguage: (language: Language) => void;
  texts: AppTexts;
}) {
  const profile = useQuery(api.profiles.getProfile);

  // Update theme and language from profile
  useEffect(() => {
    if (profile) {
      if (profile.theme !== theme) {
        setTheme(profile.theme);
      }
      if (profile.language && profile.language !== language) {
        setLanguage(profile.language as Language);
      }
    }
  }, [profile?.theme, profile?.language, theme, language, setTheme, setLanguage]);

  if (profile === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-pink-400 rounded-full animate-spin animation-delay-150"></div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return <ProfileSetup theme={theme} setTheme={setTheme} language={language} setLanguage={setLanguage} texts={texts} />;
  }

  return <MainApp theme={theme} setTheme={setTheme} profile={profile} language={language} setLanguage={setLanguage} texts={texts} />;
}

function UnauthenticatedApp({ theme, language, setLanguage, texts }: { 
  theme: "light" | "dark";
  language: Language;
  setLanguage: (language: Language) => void;
  texts: AppTexts;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className={`sticky top-0 z-10 backdrop-blur-xl h-20 flex justify-between items-center border-b shadow-lg px-6 ${
        theme === "dark" 
          ? "bg-slate-900/80 border-purple-500/20" 
          : "bg-white/80 border-rose-200/50"
      }`}>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="text-3xl animate-pulse">🌸</div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full animate-ping"></div>
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-rose-500 via-purple-500 to-teal-500 bg-clip-text text-transparent">
              {texts.appName}
            </h2>
            <p className="text-sm text-gray-500 font-medium">Your Safe Haven</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {/* Language Toggle */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setLanguage("en")}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                language === "en"
                  ? "bg-purple-500 text-white"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage("ja")}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                language === "ja"
                  ? "bg-purple-500 text-white"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              日本語
            </button>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span className="hidden sm:inline">🔒 {texts.security.private}</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">🤝 Supportive</span>
            <span className="hidden sm:inline">•</span>
            <span>✨ Safe</span>
          </div>
        </div>
      </header>
      
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-lg mx-auto">
          <div className="text-center mb-12">
            <div className="relative mb-8">
              <div className="text-8xl mb-4 animate-bounce">🌸</div>
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-20 h-20 bg-gradient-to-r from-pink-300 to-purple-300 rounded-full opacity-30 animate-pulse"></div>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-rose-500 via-purple-500 to-teal-500 bg-clip-text text-transparent mb-4">
              {texts.appName}
            </h1>
            <p className="text-xl text-gray-600 mb-4 font-medium">{texts.tagline}</p>
            <div className="max-w-md mx-auto space-y-3 text-gray-500">
              <p className="flex items-center justify-center space-x-2">
                <span>🛡️</span>
                <span>{texts.features.privacy}</span>
              </p>
              <p className="flex items-center justify-center space-x-2">
                <span>🤖</span>
                <span>{texts.features.aiCompanion}</span>
              </p>
              <p className="flex items-center justify-center space-x-2">
                <span>📝</span>
                <span>{texts.features.journaling}</span>
              </p>
              <p className="flex items-center justify-center space-x-2">
                <span>🌍</span>
                <span>{texts.features.community}</span>
              </p>
            </div>
          </div>
          
          <div className={`p-8 rounded-3xl shadow-2xl backdrop-blur-xl border ${
            theme === "dark" 
              ? "bg-slate-800/50 border-purple-500/20" 
              : "bg-white/70 border-rose-200/50"
          }`}>
            <SignInForm />
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 mb-4">
              🔒 Your mental health journey is completely private and secure
            </p>
            <div className="flex justify-center space-x-6 text-xs text-gray-400">
              <span>{texts.security.encrypted}</span>
              <span>•</span>
              <span>{texts.security.hipaa}</span>
              <span>•</span>
              <span>{texts.security.anonymous}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
