
import React from 'react';
import type { ScheduleRule, SubjectMeta, DayOfWeek } from '../../types';
import { DAYS_OF_WEEK } from '../../constants';
import { formatTime } from '../../lib/utils';
import { ChevronRight, NotebookText } from 'lucide-react';
import { Card } from '../shared/Card';

interface DayCardProps {
    rule: ScheduleRule;
    subjectMeta: SubjectMeta;
    isToday: boolean;
    onDayClick: () => void;
    onOpenTaskModal: (day: DayOfWeek, classId: string) => void;
}

export const DayCard: React.FC<DayCardProps> = ({ rule, subjectMeta, isToday, onDayClick, onOpenTaskModal }) => {
    const dayLabel = DAYS_OF_WEEK.find(d => d.value === rule.dayOfWeek)?.label || 'Unknown Day';
    const sortedClasses = [...rule.classes].sort((a,b) => a.startTime.localeCompare(b.startTime));

    return (
        <Card className={`flex flex-col ${isToday ? 'ring-2 ring-primary' : ''}`}>
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-700/50 flex justify-between items-center">
                <h3 className="font-bold text-lg text-zinc-800 dark:text-zinc-200">{dayLabel}</h3>
                <button onClick={onDayClick} className="text-sm text-primary font-semibold flex items-center">
                    View <ChevronRight size={16} />
                </button>
            </div>
            <div className="flex-1 p-4 space-y-3">
                {sortedClasses.length > 0 ? sortedClasses.map(cls => {
                    const meta = subjectMeta[cls.subject] || { color: '#cccccc', icon: '📚' };
                    const pendingTasks = cls.tasks.filter(t => !t.completed).length;
                    return (
                        <div key={cls.id} className="text-sm">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 truncate">
                                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{backgroundColor: meta.color}}></span>
                                    <span className="font-semibold text-zinc-700 dark:text-zinc-300 truncate">{cls.subject}</span>
                                    {cls.isOnline && <span className="text-xs text-primary font-medium">(Flipped)</span>}
                                </div>
                                <span className="text-xs text-zinc-500 dark:text-zinc-400">{formatTime(cls.startTime)}</span>
                            </div>
                            {pendingTasks > 0 && (
                                <button onClick={(e) => { e.stopPropagation(); onOpenTaskModal(rule.dayOfWeek, cls.id); }} className="text-xs text-danger dark:text-red-400 font-semibold mt-1 flex items-center gap-1 pl-4">
                                   <NotebookText size={12}/> {pendingTasks} pending task{pendingTasks > 1 ? 's' : ''}
                                </button>
                            )}
                        </div>
                    )
                }) : (
                    <p className="text-center text-zinc-500 dark:text-zinc-400 py-8">Day Off</p>
                )}
            </div>
        </Card>
    );
};
