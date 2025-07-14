
import React, { useMemo, useEffect, useState } from 'react';
import type { ScheduleRule, SubjectMeta, DayOfWeek } from '../../types';
import { Card } from '../shared/Card';
import { DAYS_OF_WEEK } from '../../constants';
import { formatTime, getContrastingTextColor, timeToMinutes } from '../../lib/utils';
import { NotebookText } from 'lucide-react';

interface TimelineProps {
    rule: ScheduleRule;
    subjectMeta: SubjectMeta;
    onOpenTaskModal: (day: DayOfWeek, classId: string) => void;
}

export const Timeline: React.FC<TimelineProps> = ({ rule, subjectMeta, onOpenTaskModal }) => {
    const dayLabel = DAYS_OF_WEEK.find(d => d.value === rule.dayOfWeek)?.label || 'Unknown Day';
    const [currentTimePosition, setCurrentTimePosition] = useState<number | null>(null);
    
    const sortedClasses = useMemo(() => {
        return [...rule.classes].sort((a, b) => a.startTime.localeCompare(b.startTime));
    }, [rule.classes]);

    const { hours, timelineStartHour, timelineTotalHours } = useMemo(() => {
        if (sortedClasses.length === 0) return { hours: [], timelineStartHour: 6, timelineTotalHours: 17 };
        
        const firstClassStart = timeToMinutes(sortedClasses[0].startTime);
        const lastClassEnd = timeToMinutes(sortedClasses[sortedClasses.length-1].endTime);

        const startHour = Math.max(0, Math.floor(firstClassStart / 60) - 1);
        const endHour = Math.min(23, Math.ceil(lastClassEnd / 60) + 1);
        
        const totalHours = endHour - startHour;
        const hourArray = Array.from({ length: totalHours + 1 }, (_, i) => i + startHour);

        return { hours: hourArray, timelineStartHour: startHour, timelineTotalHours: totalHours };

    }, [sortedClasses]);
    
    const hourHeightRem = 4; // h-16

    const updateCurrentTimeIndicator = () => {
        const now = new Date();
        const dayOfWeekNow = now.getDay();
        
        if (rule.dayOfWeek !== dayOfWeekNow) {
            setCurrentTimePosition(null);
            return;
        }

        const nowInMinutes = now.getHours() * 60 + now.getMinutes();
        const timelineStartMinutes = timelineStartHour * 60;

        if (nowInMinutes >= timelineStartMinutes && nowInMinutes <= (timelineStartHour + timelineTotalHours) * 60) {
            const minutesFromStart = nowInMinutes - timelineStartMinutes;
            const position = (minutesFromStart / (timelineTotalHours * 60)) * 100;
            setCurrentTimePosition(position);
        } else {
            setCurrentTimePosition(null);
        }
    };
    
    useEffect(() => {
        updateCurrentTimeIndicator();
        const interval = setInterval(updateCurrentTimeIndicator, 60000); // Update every minute
        return () => clearInterval(interval);
    }, [rule.dayOfWeek, timelineStartHour, timelineTotalHours]);


    return (
        <Card className="p-4 sm:p-6">
            <h3 className="text-xl font-bold mb-6 text-zinc-800 dark:text-zinc-200">{dayLabel}'s Schedule</h3>
            {sortedClasses.length > 0 ? (
                 <div className="relative flex">
                     {/* Hour markers */}
                     <div className="w-16 flex-shrink-0 text-right pr-4">
                        {hours.map(hour => (
                             <div key={`time-${hour}`} className="text-xs font-mono text-zinc-500 dark:text-zinc-400 relative -top-2" style={{ height: `${hourHeightRem}rem` }}>
                                {hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                            </div>
                        ))}
                     </div>

                     {/* Grid and Events */}
                     <div className="relative flex-1 border-l border-zinc-200 dark:border-zinc-700">
                         {/* Grid Lines */}
                        {hours.map((hour, index) => (
                             <div key={`line-${hour}`} className={`${index > 0 ? 'border-t border-dashed border-zinc-200 dark:border-zinc-700' : ''}`} style={{ height: `${hourHeightRem}rem` }}></div>
                         ))}
                         
                         {/* Current Time Indicator */}
                         {currentTimePosition !== null && (
                             <div className="absolute w-full z-10" style={{ top: `${currentTimePosition}%` }}>
                                 <div className="relative h-0">
                                     <div className="absolute -top-[5px] left-[-5px] w-2.5 h-2.5 rounded-full bg-danger ring-2 ring-white dark:ring-zinc-800"></div>
                                     <div className="h-px bg-danger w-full"></div>
                                 </div>
                             </div>
                         )}
                         
                         {/* Events */}
                        {sortedClasses.map(cls => {
                            const meta = subjectMeta[cls.subject] || { color: '#cccccc', icon: '📚' };
                            const startMinutes = timeToMinutes(cls.startTime);
                            const endMinutes = timeToMinutes(cls.endTime);

                            const minutesFromStart = startMinutes - (timelineStartHour * 60);
                            const durationMinutes = endMinutes - startMinutes;
                            
                            if (durationMinutes <= 0) return null;

                            const topPercent = (minutesFromStart / (timelineTotalHours * 60)) * 100;
                            const heightPercent = (durationMinutes / (timelineTotalHours * 60)) * 100;
                            
                            const pendingTasks = cls.tasks.filter(t => !t.completed).length;

                            return (
                                <div
                                    key={cls.id}
                                    className="absolute w-full pr-2"
                                    style={{ top: `${topPercent}%`, height: `${heightPercent}%` }}
                                >
                                    <div className="h-full ml-2 p-2 rounded-lg flex flex-col" style={{backgroundColor: `${meta.color}20`, borderLeft: `3px solid ${meta.color}`}}>
                                        <p className="font-bold text-sm" style={{color: meta.color}}>
                                            <span className="mr-2">{meta.icon}</span>
                                            {cls.subject}
                                            {cls.isOnline && <span className="font-medium text-xs"> (Flipped)</span>}
                                        </p>
                                        <p className="text-xs" style={{color: `${meta.color}B3`}}>{formatTime(cls.startTime)} - {formatTime(cls.endTime)}</p>
                                        {pendingTasks > 0 && (
                                            <button 
                                                onClick={() => onOpenTaskModal(rule.dayOfWeek, cls.id)} 
                                                className="mt-auto text-xs flex items-center gap-1 self-start px-1.5 py-0.5 rounded" 
                                                style={{color: getContrastingTextColor(meta.color), backgroundColor: meta.color}}
                                            >
                                                <NotebookText size={12}/>
                                                <span>{pendingTasks} Task{pendingTasks > 1 ? 's' : ''}</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                     </div>
                 </div>
            ) : (
                 <p className="text-center text-zinc-500 dark:text-zinc-400 py-16">No classes scheduled for {dayLabel}.</p>
            )}
        </Card>
    );
};
