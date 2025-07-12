import { useState, useCallback } from "react";

export const DEFAULT_TRIGGER_WORDS = [
  "kill", "harm", "suicide", "end it", "die", "hurt myself", "self-harm"
];

export function useSafetyTrigger(triggerWords: string[] = DEFAULT_TRIGGER_WORDS) {
  const [flaggedWords, setFlaggedWords] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  const checkText = useCallback((text: string) => {
    const found = triggerWords.filter(word =>
      text.toLowerCase().includes(word.toLowerCase())
    );
    setFlaggedWords(found);
    setModalOpen(found.length > 0);
    return found;
  }, [triggerWords]);

  const flagEntry = (text: string) => checkText(text);

  return { flaggedWords, modalOpen, setModalOpen, flagEntry };
} 