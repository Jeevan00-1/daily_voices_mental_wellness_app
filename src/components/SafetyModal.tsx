import { useState, useEffect } from "react";
import { Language } from "../App";

interface SafetyModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: "light" | "dark";
  country: string;
  language: Language;
}

const CRISIS_RESOURCES = {
  US: {
    name: "United States",
    hotline: "988",
    text: "Text HOME to 741741",
    chat: "suicidepreventionlifeline.org",
    description: "National Suicide Prevention Lifeline"
  },
  CA: {
    name: "Canada",
    hotline: "1-833-456-4566",
    text: "Text 45645",
    chat: "talksuicide.ca",
    description: "Talk Suicide Canada"
  },
  GB: {
    name: "United Kingdom",
    hotline: "116 123",
    text: "Text SHOUT to 85258",
    chat: "samaritans.org",
    description: "Samaritans"
  },
  AU: {
    name: "Australia",
    hotline: "13 11 14",
    text: "Text 0477 13 11 14",
    chat: "lifeline.org.au",
    description: "Lifeline Australia"
  },
  DE: {
    name: "Germany",
    hotline: "0800 111 0 111",
    text: "Online chat available",
    chat: "telefonseelsorge.de",
    description: "Telefonseelsorge"
  },
  FR: {
    name: "France",
    hotline: "3114",
    text: "Online chat available",
    chat: "suicide-ecoute.fr",
    description: "Suicide Écoute"
  },
  JP: {
    name: "Japan",
    hotline: "0570-783-556",
    text: "Online support available",
    chat: "tell-jp.org",
    description: "TELL Japan"
  },
  IN: {
    name: "India",
    hotline: "91-9152987821",
    text: "Online chat available",
    chat: "aasra.info",
    description: "AASRA"
  }
};

const SAFETY_TEXTS = {
  en: {
    title: "We're Here for You",
    subtitle: "You're not alone. Help is available right now.",
    immediateHelp: "Immediate Help",
    additionalSupport: "Additional Support Options",
    rightNow: "Right Now, You Can:",
    callNow: "Call",
    imSafe: "I'm Safe - Continue to App",
    footer: "Your life has value. You matter. Help is always available.",
    crisisText: "Crisis text support",
    onlineChat: "Online chat support",
    additionalOptions: [
      "Visit your nearest emergency room",
      "Call emergency services (911, 112, etc.)",
      "Reach out to a trusted friend or family member",
      "Contact your healthcare provider"
    ],
    copingStrategies: [
      "Take 5 deep breaths slowly",
      "Name 5 things you can see around you",
      "Hold an ice cube or splash cold water on your face",
      "Listen to calming music or sounds",
      "Remember: This feeling will pass"
    ]
  },
  ja: {
    title: "私たちがあなたのそばにいます",
    subtitle: "あなたは一人ではありません。今すぐヘルプが利用できます。",
    immediateHelp: "緊急時のヘルプ",
    additionalSupport: "追加のサポートオプション",
    rightNow: "今すぐできること：",
    callNow: "電話する",
    imSafe: "安全です - アプリを続ける",
    footer: "あなたの命には価値があります。あなたは大切な存在です。ヘルプは常に利用できます。",
    crisisText: "危機テキストサポート",
    onlineChat: "オンラインチャットサポート",
    additionalOptions: [
      "最寄りの救急外来を訪問する",
      "緊急サービスに電話する（119など）",
      "信頼できる友人や家族に連絡する",
      "医療提供者に連絡する"
    ],
    copingStrategies: [
      "ゆっくりと5回深呼吸する",
      "周りに見える5つのものを名前を言う",
      "氷を持つか冷たい水を顔にかける",
      "落ち着く音楽や音を聞く",
      "覚えておいて：この気持ちは過ぎ去ります"
    ]
  }
};

export function SafetyModal({ isOpen, onClose, theme, country, language }: SafetyModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentResource, setCurrentResource] = useState(CRISIS_RESOURCES.US);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Set appropriate crisis resource based on country
      const resource = CRISIS_RESOURCES[country as keyof typeof CRISIS_RESOURCES] || CRISIS_RESOURCES.US;
      setCurrentResource(resource);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, country]);

  if (!isVisible) return null;

  const texts = SAFETY_TEXTS[language];

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
      isOpen ? 'opacity-100' : 'opacity-0'
    } transition-opacity duration-300`}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`relative w-full max-w-lg transform transition-all duration-300 ${
        isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
      }`}>
        <div className={`rounded-3xl shadow-2xl border-2 p-8 ${
          theme === "dark"
            ? "bg-slate-800 border-red-400/30"
            : "bg-white border-red-300/50"
        }`}>
          {/* Header */}
          <div className="text-center mb-6">
            <div className="text-6xl mb-4 animate-pulse">🆘</div>
            <h2 className="text-2xl font-bold text-red-500 mb-2">
              {texts.title}
            </h2>
            <p className={`text-lg ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
              {texts.subtitle}
            </p>
          </div>

          {/* Crisis Resources */}
          <div className={`p-6 rounded-2xl mb-6 ${
            theme === "dark" ? "bg-slate-700/50" : "bg-red-50"
          }`}>
            <h3 className="text-lg font-semibold mb-4 text-red-600">
              🌍 {currentResource.name} - {texts.immediateHelp}
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">📞</span>
                <div>
                  <p className="font-semibold text-lg">{currentResource.hotline}</p>
                  <p className="text-sm text-gray-500">{currentResource.description}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <span className="text-2xl">💬</span>
                <div>
                  <p className="font-semibold">{currentResource.text}</p>
                  <p className="text-sm text-gray-500">{texts.crisisText}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🌐</span>
                <div>
                  <p className="font-semibold">{currentResource.chat}</p>
                  <p className="text-sm text-gray-500">{texts.onlineChat}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Resources */}
          <div className={`p-4 rounded-xl mb-6 ${
            theme === "dark" ? "bg-blue-900/30" : "bg-blue-50"
          }`}>
            <h4 className="font-semibold mb-3 text-blue-600">
              🏥 {texts.additionalSupport}
            </h4>
            <ul className="space-y-2 text-sm">
              {texts.additionalOptions.map((option, index) => (
                <li key={index}>• {option}</li>
              ))}
            </ul>
          </div>

          {/* Coping Strategies */}
          <div className={`p-4 rounded-xl mb-6 ${
            theme === "dark" ? "bg-green-900/30" : "bg-green-50"
          }`}>
            <h4 className="font-semibold mb-3 text-green-600">
              🌱 {texts.rightNow}
            </h4>
            <ul className="space-y-2 text-sm">
              {texts.copingStrategies.map((strategy, index) => (
                <li key={index}>• {strategy}</li>
              ))}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col space-y-3">
            <a
              href={`tel:${currentResource.hotline}`}
              className="w-full py-4 bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold rounded-xl text-center text-lg hover:from-red-600 hover:to-pink-600 transition-all transform hover:scale-105"
            >
              📞 {texts.callNow} {currentResource.hotline}
            </a>
            
            <button
              onClick={onClose}
              className={`w-full py-3 rounded-xl font-semibold transition-colors ${
                theme === "dark"
                  ? "bg-slate-600 hover:bg-slate-500 text-white"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-800"
              }`}
            >
              {texts.imSafe}
            </button>
          </div>

          {/* Footer Message */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              💙 {texts.footer}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
