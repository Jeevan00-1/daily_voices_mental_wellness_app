import React from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ theme, setTheme }: { theme: 'light' | 'dark'; setTheme: (t: 'light' | 'dark') => void }) {
  return (
    <button
      aria-label="Toggle dark mode"
      className="flex items-center justify-center w-12 h-12 rounded-lg bg-accent-yellow dark:bg-slate-800 shadow-md transition-all duration-150 ease-in-out focus:ring-2 focus:ring-primary/60 focus:outline-none hover:scale-105"
      style={{ borderRadius: '12px' }}
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
    >
      <span className="sr-only">Toggle theme</span>
      {theme === 'dark' ? (
        <Sun size={28} className="text-primary transition-transform duration-150 ease-in-out rotate-0" />
      ) : (
        <Moon size={28} className="text-primary transition-transform duration-150 ease-in-out rotate-0" />
      )}
    </button>
  );
} 