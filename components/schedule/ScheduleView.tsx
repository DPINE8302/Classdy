
import React, { useState, useMemo } from 'react';
import type { Schedule, SubjectMeta, DayOfWeek } from '../../types';
import { DayCard } from './DayCard';
import { Timeline } from './Timeline';
import { Calendar, List } from 'lucide-react';
import { getDay } from 'date-fns';

interface ScheduleViewProps {
    schedule: Schedule;
    subjectMeta: SubjectMeta;
    onOpenTaskModal: (day: DayOfWeek, classId: string) => void;
}

type ViewMode = 'week' | 'day';

export const ScheduleView: React.FC<ScheduleViewProps> = ({ schedule, subjectMeta, onOpenTaskModal }) => {
    const [viewMode, setViewMode] = useState<ViewMode>('week');
    const [selectedDay, setSelectedDay] = useState<number>(new Date().getDay());

    const sortedRules = useMemo(() => {
        // Sorts to start with Monday (1) and end with Sunday (0)
        return [...schedule.rules].sort((a, b) => {
            const dayA = a.dayOfWeek === 0 ? 7 : a.dayOfWeek;
            const dayB = b.dayOfWeek === 0 ? 7 : b.dayOfWeek;
            return dayA - dayB;
        });
    }, [schedule]);

    const handleDayClick = (day: number) => {
        setSelectedDay(day);
        setViewMode('day');
    };
    
    const selectedDayRule = useMemo(() => {
        return schedule.rules.find(rule => rule.dayOfWeek === selectedDay);
    }, [schedule, selectedDay]);

    return (
        <div>
            <div className="flex justify-center mb-6">
                <div className="p-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg flex gap-1">
                    <button
                        onClick={() => setViewMode('week')}
                        className={`px-4 py-1.5 rounded-md text-sm font-semibold flex items-center gap-2 transition-colors ${viewMode === 'week' ? 'bg-white dark:bg-zinc-700 text-primary' : 'text-zinc-600 dark:text-zinc-300'}`}
                    >
                        <Calendar size={16} /> Week
                    </button>
                    <button
                        onClick={() => setViewMode('day')}
                        className={`px-4 py-1.5 rounded-md text-sm font-semibold flex items-center gap-2 transition-colors ${viewMode === 'day' ? 'bg-white dark:bg-zinc-700 text-primary' : 'text-zinc-600 dark:text-zinc-300'}`}
                    >
                        <List size={16} /> Day
                    </button>
                </div>
            </div>

            {viewMode === 'week' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
                    {sortedRules.map(rule => (
                        <DayCard 
                            key={rule.dayOfWeek}
                            rule={rule}
                            subjectMeta={subjectMeta}
                            onDayClick={() => handleDayClick(rule.dayOfWeek)}
                            onOpenTaskModal={onOpenTaskModal}
                            isToday={rule.dayOfWeek === getDay(new Date())}
                        />
                    ))}
                </div>
            ) : (
                <div className="max-w-3xl mx-auto animate-fade-in">
                    {selectedDayRule && (
                        <Timeline 
                            rule={selectedDayRule}
                            subjectMeta={subjectMeta}
                            onOpenTaskModal={onOpenTaskModal}
                        />
                    )}
                </div>
            )}
        </div>
    );
};
