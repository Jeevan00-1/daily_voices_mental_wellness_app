import React from "react";

const tabs = [
  { id: "home", label: "Home" },
  { id: "journal", label: "Journal" },
  { id: "chat", label: "Chat" },
  { id: "profile", label: "Profile" },
];

type BottomNavProps = {
  active: number;
  onTabChange: (idx: number) => void;
};

export default function BottomNav({ active, onTabChange }: BottomNavProps) {
  return (
    <nav style={{
      position: 'fixed',
      left: 0,
      right: 0,
      bottom: 0,
      height: 56,
      background: '#fff',
      borderTop: '1px solid #eee',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      zIndex: 100,
    }}>
      {tabs.map((tab, idx) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(idx)}
          style={{
            background: 'none',
            border: 'none',
            color: active === idx ? '#5A9BD5' : '#888',
            fontWeight: active === idx ? 'bold' : 'normal',
            fontSize: 16,
            padding: 8,
            cursor: 'pointer',
          }}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
} 