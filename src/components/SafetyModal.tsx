import React from "react";
// NOTE: You must install @headlessui/react and @types/headlessui__react for this modal to work:
// pnpm add @headlessui/react @types/headlessui__react
import { Dialog } from "@headlessui/react";

export default function SafetyModal({
  open,
  onClose,
  onCall,
  flaggedWords,
}: {
  open: boolean;
  onClose: () => void;
  onCall: () => void;
  flaggedWords: string[];
}) {
  return (
    <Dialog open={open} onClose={onClose} className="fixed z-50 inset-0 flex items-center justify-center">
      <Dialog.Overlay className="fixed inset-0 bg-black/70 backdrop-blur-md" />
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 sm:p-16 w-full h-full flex flex-col items-center justify-center border-4 border-blue-400 dark:border-blue-700 animate-pulse">
          <h2 className="text-5xl sm:text-6xl font-extrabold text-blue-600 dark:text-blue-300 mb-8 text-center">🚨 We're Here For You</h2>
          <p className="text-2xl sm:text-3xl text-gray-700 dark:text-gray-200 mb-8 text-center">
            Our system detected words like:
            <span className="font-bold text-pink-600 dark:text-pink-300 ml-2">{flaggedWords.join(", ")}</span>
          </p>
          <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-12 text-center max-w-2xl">
            If you're in crisis or need someone to talk to, you can call a helpline now or simply dismiss this message. You're not alone.
          </p>
          <div className="flex flex-col sm:flex-row gap-8 w-full max-w-2xl justify-center">
            <button
              className="flex-1 py-8 text-3xl rounded-2xl bg-blue-500 hover:bg-blue-600 text-white font-extrabold shadow-lg transition focus:ring-4 focus:ring-blue-300 focus:outline-none"
              aria-label="Call Now"
              onClick={onCall}
            >
              📞 Call Crisis Helpline
            </button>
            <button
              className="flex-1 py-8 text-3xl rounded-2xl bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold shadow-lg transition hover:bg-gray-300 dark:hover:bg-gray-600 focus:ring-4 focus:ring-blue-200 focus:outline-none"
              aria-label="Dismiss"
              onClick={onClose}
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
