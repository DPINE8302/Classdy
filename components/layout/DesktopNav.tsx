
import React from 'react';
import { Plus, Settings } from 'lucide-react';

type Tab = 'overview' | 'dashboard' | 'schedule' | 'reports' | 'chat';

type NavOption = {
  label: string;
  value: Tab;
  icon: React.ElementType;
};

interface DesktopNavProps {
    options: NavOption[];
    activeTab: Tab;
    onTabChange: (tab: Tab) => void;
    onAddLog: () => void;
    onOpenSettings: () => void;
}

const NavLink: React.FC<{ option: NavOption; isActive: boolean; onClick: () => void; }> = ({ option, isActive, onClick }) => {
    const Icon = option.icon;
    return (
        <li>
            <button
                onClick={onClick}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors
                ${isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200/60 dark:hover:bg-zinc-800'
                }`}
            >
                <Icon size={20} />
                <span>{option.label}</span>
            </button>
        </li>
    );
};

export const DesktopNav: React.FC<DesktopNavProps> = ({ options, activeTab, onTabChange, onAddLog, onOpenSettings }) => {
    return (
        <aside className="w-64 flex-shrink-0 bg-white/50 dark:bg-zinc-900/50 border-r border-zinc-200 dark:border-zinc-700/50 flex flex-col">
            <div className="h-20 flex items-center px-6 border-b border-zinc-200 dark:border-zinc-700/50">
                <h1 className="text-xl font-bold text-zinc-800 dark:text-zinc-200">Classdy</h1>
            </div>
            <nav className="flex-1 p-4 space-y-2">
                <ul>
                    {options.map(option => (
                        <NavLink key={option.value} option={option} isActive={activeTab === option.value} onClick={() => onTabChange(option.value)} />
                    ))}
                </ul>
            </nav>
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-700/50 space-y-2">
                 <button onClick={onAddLog} className="w-full flex items-center justify-center gap-2 p-2.5 rounded-lg bg-primary text-white font-semibold hover:bg-primary-hover transition-colors">
                    <Plus size={18} /> Add Log
                </button>
                <button onClick={onOpenSettings} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors">
                    <Settings size={20} />
                    <span>Settings</span>
                </button>
            </div>
        </aside>
    );
}