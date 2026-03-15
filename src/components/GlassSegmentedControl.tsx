import React, { useState, useRef, useEffect } from 'react';
import { Folder, PenLine, Users } from 'lucide-react';

interface GlassSegmentedControlProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'folder', label: 'Folder', icon: Folder },
  { id: 'write', label: 'Write', icon: PenLine },
  { id: 'meetup', label: 'Meetup', icon: Users },
];

const GlassSegmentedControl: React.FC<GlassSegmentedControlProps> = ({ activeTab, onTabChange }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const activeIndex = tabs.findIndex(t => t.id === activeTab);
    const buttons = containerRef.current.querySelectorAll<HTMLButtonElement>('[data-tab]');
    const btn = buttons[activeIndex];
    if (btn) {
      setIndicatorStyle({
        left: btn.offsetLeft,
        width: btn.offsetWidth,
      });
    }
  }, [activeTab]);

  return (
    <div className="fixed bottom-6 left-0 right-0 z-30 flex justify-center pointer-events-none">
      <div
        ref={containerRef}
        className="relative inline-flex items-center gap-0.5 p-1 rounded-[26px] pointer-events-auto"
        style={{
          background: 'rgba(0, 0, 0, 0.38)',
          backdropFilter: 'blur(24px) saturate(1.6) brightness(1.08)',
          WebkitBackdropFilter: 'blur(24px) saturate(1.6) brightness(1.08)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.22), 0 1.5px 6px rgba(0,0,0,0.12), inset 0 0.5px 0 rgba(255,255,255,0.12)',
          border: '0.5px solid rgba(255,255,255,0.12)',
        }}
      >
        {/* Inner top highlight */}
        <div
          className="absolute inset-x-2 top-[1px] h-[1px] rounded-full pointer-events-none"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 30%, rgba(255,255,255,0.22) 50%, rgba(255,255,255,0.18) 70%, transparent 100%)',
          }}
        />

        {/* Gradient sheen */}
        <div
          className="absolute inset-0 rounded-[26px] pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 40%, rgba(255,255,255,0.03) 100%)',
          }}
        />

        {/* Sliding indicator */}
        <div
          className="absolute top-1 h-[calc(100%-8px)] rounded-[22px] pointer-events-none"
          style={{
            left: indicatorStyle.left,
            width: indicatorStyle.width,
            transition: 'left 220ms cubic-bezier(0.34, 1.4, 0.64, 1), width 220ms cubic-bezier(0.34, 1.4, 0.64, 1)',
            background: 'rgba(255, 255, 255, 0.13)',
            boxShadow: '0 0 16px 2px rgba(255,255,255,0.06), inset 0 0.5px 0 rgba(255,255,255,0.1)',
          }}
        />

        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              data-tab={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="relative z-10 flex items-center gap-2 px-5 py-2.5 rounded-[22px] text-sm font-medium transition-all outline-none"
              style={{
                color: isActive ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.45)',
                transform: isActive ? 'scale(1.03)' : 'scale(1)',
                transition: 'color 220ms ease, transform 220ms cubic-bezier(0.34, 1.4, 0.64, 1)',
                textShadow: isActive ? '0 0 12px rgba(255,255,255,0.15)' : 'none',
              }}
            >
              <Icon className="w-4 h-4" strokeWidth={isActive ? 2.2 : 1.8} />
              <span className="tracking-wide">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default GlassSegmentedControl;
