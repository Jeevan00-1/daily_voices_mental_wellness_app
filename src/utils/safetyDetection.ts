// Comprehensive safety word detection system
export const SAFETY_WORDS = {
  en: [
    'kill', 'suicide', 'die', 'death', 'harm', 'hurt', 'end it', 'give up', 
    'worthless', 'hopeless', 'can\'t go on', 'want to die', 'better off dead',
    'self harm', 'cut myself', 'overdose', 'jump', 'hang', 'gun', 'knife',
    'pills', 'poison', 'bridge', 'rope', 'blade', 'razor', 'cutting',
    'no point', 'pointless', 'useless', 'burden', 'hate myself', 'kill myself',
    'end my life', 'take my life', 'don\'t want to live', 'tired of living',
    'can\'t take it', 'too much pain', 'nobody cares', 'alone forever',
    'never get better', 'no hope', 'no future', 'waste of space'
  ],
  ja: [
    '死にたい', '自殺', '死ぬ', '殺す', '害', '傷つける', '終わりにしたい', 'あきらめる',
    '価値がない', '絶望', '続けられない', '死にたい', '死んだ方がまし',
    '自傷', '自分を切る', '薬物過剰摂取', '飛び降り', '首吊り', '銃', 'ナイフ',
    '薬', '毒', '橋', 'ロープ', '刃', 'カミソリ', '切る',
    '意味がない', '無意味', '役に立たない', '負担', '自分が嫌い', '自殺したい',
    '命を終わらせる', '命を奪う', '生きたくない', '生きるのに疲れた',
    '耐えられない', '痛みが多すぎる', '誰も気にしない', '永遠に一人',
    '良くならない', '希望がない', '未来がない', '場所の無駄'
  ]
};

export function detectSafetyWords(text: string, language: 'en' | 'ja' = 'en'): boolean {
  if (!text) return false;
  
  const lowerText = text.toLowerCase();
  const wordsToCheck = SAFETY_WORDS[language];
  
  return wordsToCheck.some(word => lowerText.includes(word.toLowerCase()));
}

export function triggerSafetyModal(): void {
  window.dispatchEvent(new CustomEvent('safetyTrigger'));
}

// Hook for components to use safety detection
export function useSafetyDetection(language: 'en' | 'ja' = 'en') {
  return {
    detectSafetyWords: (text: string) => detectSafetyWords(text, language),
    triggerSafetyModal
  };
}
