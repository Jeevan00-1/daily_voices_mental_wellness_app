import { useState } from "react";
import { Journal } from "./Journal";
import { AICompanion } from "./AICompanion";
import { Community } from "./Community";
import { Profile } from "./Profile";
import Dashboard from "./Dashboard";
import BottomNav from "./BottomNav";
import { Language, AppTexts } from "../App";

interface MainAppProps {
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
  profile: any;
  language: Language;
  setLanguage: (language: Language) => void;
  texts: AppTexts;
}

export function MainApp({ theme, setTheme, profile, language, setLanguage, texts }: MainAppProps) {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="relative min-h-screen pb-16">
      {activeTab === "dashboard" && <Dashboard />}
      {activeTab === "journal" && profile && <Journal theme={theme} language={language} texts={texts} userId={profile._id} />}
      {activeTab === "companion" && <AICompanion theme={theme} language={language} texts={texts} />}
      {activeTab === "community" && <Community theme={theme} language={language} texts={texts} />}
      {activeTab === "profile" && <Profile theme={theme} setTheme={setTheme} profile={profile} language={language} setLanguage={setLanguage} texts={texts} />}
      <BottomNav active={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
