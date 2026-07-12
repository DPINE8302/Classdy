
import React, { useState } from 'react';
import type { SubjectMeta } from '../../types';

interface SubjectManagerProps {
    subjectMeta: SubjectMeta;
    onSave: (newMeta: SubjectMeta) => void;
}

const Section: React.FC<{title: string, children: React.ReactNode, className?: string}> = ({ title, children, className = '' }) => (
    <div className={`mb-8 ${className}`}>
        <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 mb-4">{title}</h3>
        <div className="space-y-4">{children}</div>
    </div>
);

export const SubjectManager: React.FC<SubjectManagerProps> = ({ subjectMeta, onSave }) => {
    const [meta, setMeta] = useState<SubjectMeta>(subjectMeta);

    const handleMetaChange = (subject: string, field: 'color' | 'icon', value: string) => {
        const newMeta = {
            ...meta,
            [subject]: {
                ...(meta[subject] || { color: '#cccccc', icon: '📚' }), // Ensure object exists
                [field]: value
            }
        };
        setMeta(newMeta);
        onSave(newMeta); // Save on every change for real-time updates
    };

    const sortedSubjects = Object.keys(meta).sort();

    return (
        <Section title="Subject Appearance">
            <p className="text-sm text-zinc-600 dark:text-zinc-400 -mt-2 mb-4">Customize the color and icon for each subject.</p>
            <div className="space-y-2 max-h-96 overflow-y-auto pr-2 -mr-2">
                {sortedSubjects.map(subject => (
                    <div key={subject} className="flex items-center gap-3 p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800/50">
                        <input
                            type="color"
                            value={meta[subject].color}
                            onChange={(e) => handleMetaChange(subject, 'color', e.target.value)}
                            className="w-8 h-8 p-0 border-none rounded-md cursor-pointer bg-transparent"
                            aria-label={`Color for ${subject}`}
                        />
                        <input
                            type="text"
                            value={meta[subject].icon || ''}
                            onChange={(e) => handleMetaChange(subject, 'icon', e.target.value)}
                            maxLength={2}
                            placeholder="✏️"
                            className="w-10 h-8 text-center bg-zinc-200 dark:bg-zinc-700 rounded-md text-lg p-0"
                            aria-label={`Icon for ${subject}`}
                        />
                        <span className="flex-1 font-medium text-sm text-zinc-800 dark:text-zinc-200 truncate">{subject}</span>
                    </div>
                ))}
            </div>
        </Section>
    );
};
