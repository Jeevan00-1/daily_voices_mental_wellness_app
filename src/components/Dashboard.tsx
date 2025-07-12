import React from 'react';
import { BookOpen, Bot, Users } from 'lucide-react';

const cards = [
  {
    id: 'journal',
    icon: <BookOpen size={36} className="text-primary" aria-hidden="true" />,
    title: 'Journal',
    desc: 'Reflect, write, and track your mood in a private, safe space.',
    button: 'New Entry',
    color: 'from-primary to-accent-yellow',
  },
  {
    id: 'companion',
    icon: <Bot size={36} className="text-secondary" aria-hidden="true" />,
    title: 'AI Companion',
    desc: 'Chat with your always-available, caring AI for support and insight.',
    button: 'Talk Now',
    color: 'from-secondary to-accent-lavender',
  },
  {
    id: 'community',
    icon: <Users size={36} className="text-accent-lavender" aria-hidden="true" />,
    title: 'Community',
    desc: 'Connect anonymously with others for encouragement and shared growth.',
    button: 'Explore',
    color: 'from-accent-lavender to-accent-yellow',
  },
];

export default function Dashboard() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-primary/10 via-accent-yellow/10 to-secondary/10 flex flex-col items-center py-10 px-4">
      <h1 className="font-display text-4xl md:text-5xl font-bold text-primary mb-8 text-center leading-tight">Welcome to Daily Voices</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
        {cards.map(card => (
          <section
            key={card.id}
            tabIndex={0}
            aria-label={card.title}
            className={`group bg-white dark:bg-slate-900 rounded-lg shadow-lg p-8 flex flex-col items-center transition-transform duration-150 ease-in-out focus:ring-4 focus:ring-primary/40 focus:outline-none hover:-translate-y-1 hover:shadow-2xl`}
            style={{ borderRadius: '16px' }}
          >
            <div className="mb-4">{card.icon}</div>
            <h2 className="font-display text-2xl font-semibold mb-2 text-primary text-center">{card.title}</h2>
            <p className="text-gray-600 dark:text-gray-300 text-center mb-6">{card.desc}</p>
            <button
              className={`mt-auto px-6 py-3 rounded-md font-semibold bg-gradient-to-r ${card.color} text-text-light shadow-md transition-all duration-150 ease-in-out focus:ring-2 focus:ring-primary/60 focus:outline-none group-hover:scale-105 group-active:scale-95 group-hover:shadow-xl animate-pulse`}
              aria-label={card.button}
            >
              {card.button}
            </button>
          </section>
        ))}
      </div>
    </main>
  );
} 