import { useState } from "react";
import { SignOutButton } from "../SignOutButton";
import { Journal } from "./Journal";
import { AICompanion } from "./AICompanion";
import { Community } from "./Community";
import { Profile } from "./Profile";
import { Language, AppTexts } from "../App";

interface MainAppProps {
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
  profile: any;
  language: Language;
  setLanguage: (language: Language) => void;
  texts: AppTexts;
}

const NAVIGATION_ITEMS = [
  { id: "journal", label: "Journal", icon: "📝", gradient: "from-purple-500 to-pink-500" },
  { id: "companion", label: "Companion", icon: "🤖", gradient: "from-blue-500 to-teal-500" },
  { id: "community", label: "Community", icon: "🌍", gradient: "from-green-500 to-emerald-500" },
  { id: "profile", label: "Profile", icon: "👤", gradient: "from-orange-500 to-red-500" },
];

export function MainApp({ theme, setTheme, profile, language, setLanguage, texts }: MainAppProps) {
  const [activeTab, setActiveTab] = useState("journal");

  const renderContent = () => {
    switch (activeTab) {
      case "journal":
        return <Journal theme={theme} language={language} texts={texts} />;
      case "companion":
        return <AICompanion theme={theme} language={language} texts={texts} />;
      case "community":
        return <Community theme={theme} language={language} texts={texts} />;
      case "profile":
        return <Profile theme={theme} setTheme={setTheme} profile={profile} language={language} setLanguage={setLanguage} texts={texts} />;
      default:
        return <Journal theme={theme} language={language} texts={texts} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className={`sticky top-0 z-40 backdrop-blur-xl border-b shadow-lg ${
        theme === "dark" 
          ? "bg-slate-900/80 border-purple-500/20" 
          : "bg-white/80 border-rose-200/50"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="text-3xl animate-pulse">🌸</div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full animate-ping"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-rose-500 via-purple-500 to-teal-500 bg-clip-text text-transparent">
                  {texts.appName}
                </h1>
                <p className="text-sm text-gray-500">Welcome back, {profile.username}</p>
              </div>
            </div>

            {/* User Info & Sign Out */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{profile.avatar}</span>
                <div className="hidden sm:block">
                  <p className="font-medium">{profile.username}</p>
                  <p className="text-xs text-gray-500">Safe Space Active</p>
                </div>
              </div>
              <SignOutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className={`sticky top-20 z-30 backdrop-blur-xl border-b ${
        theme === "dark" 
          ? "bg-slate-800/80 border-purple-500/20" 
          : "bg-white/80 border-rose-200/50"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 py-4 overflow-x-auto">
            {NAVIGATION_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-3 px-6 py-3 rounded-2xl font-semibold transition-all duration-300 whitespace-nowrap ${
                  activeTab === item.id
                    ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg transform scale-105`
                    : theme === "dark"
                    ? "bg-slate-700/50 hover:bg-slate-600/50 text-gray-300 hover:text-white"
                    : "bg-gray-100/50 hover:bg-gray-200/50 text-gray-700 hover:text-gray-900"
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {renderContent()}
        </div>
      </main>

      {/* Footer */}
      <footer className={`border-t ${
        theme === "dark" ? "border-purple-500/20 bg-slate-900/50" : "border-rose-200/50 bg-white/50"
      } backdrop-blur-xl`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <span className="flex items-center space-x-2">
                <span>🔒</span>
                <span>Private & Secure</span>
              </span>
              <span className="flex items-center space-x-2">
                <span>🛡️</span>
                <span>HIPAA Compliant</span>
              </span>
              <span className="flex items-center space-x-2">
                <span>💙</span>
                <span>Always Here for You</span>
              </span>
            </div>
            <div className="text-sm text-gray-500">
              {texts.crisis.needHelp}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
