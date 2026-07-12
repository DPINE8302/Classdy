
import React from 'react';

type Tab = 'overview' | 'dashboard' | 'schedule' | 'reports' | 'chat';

type NavOption = {
  label: string;
  value: Tab;
  icon: React.ElementType;
};

interface MobileNavProps {
    options: NavOption[];
    activeTab: Tab;
    onTabChange: (tab: Tab) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ options, activeTab, onTabChange }) => {
    return (
        <footer className="fixed bottom-0 left-0 right-0 h-16 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-lg border-t border-zinc-200 dark:border-zinc-800 z-40">
            <nav className="max-w-md mx-auto h-full flex justify-around items-center">
                {options.map(option => {
                    const Icon = option.icon;
                    return (
                        <button
                            key={option.value}
                            onClick={() => onTabChange(option.value)}
                            className={`flex flex-col items-center justify-center w-16 h-16 transition-colors rounded-lg ${activeTab === option.value ? 'text-primary' : 'text-zinc-500 dark:text-zinc-400'}`}
                            aria-label={option.label}
                        >
                            <Icon
                                size={24}
                                strokeWidth={activeTab === option.value ? 2.5 : 2}
                            />
                            <span className="text-[11px] font-semibold mt-1">{option.label}</span>
                        </button>
                    );
                })}
            </nav>
        </footer>
    );
};