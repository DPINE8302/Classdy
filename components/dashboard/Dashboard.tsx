
import React, { useMemo } from 'react';
import type { AttendanceLog, AttendanceStatus, Schedule, Settings, Holiday, SubjectMeta, DayOfWeek } from '../../types';
import { STATUS_MAP, formatTime, calculateLateness, calculateOnTimeStreak, getContrastingTextColor, CHART_COLORS, getScheduleForDate } from '../../lib/utils';
import { Card } from '../shared/Card';
import { format, startOfWeek, endOfWeek, isWithinInterval, parseISO, getDay, eachDayOfInterval, startOfDay } from 'date-fns';
import { Edit, Award, Coffee, Meh, CheckCircle, AlertCircle, XCircle, CalendarDays, TrendingUp, ChevronRight, NotebookText } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, Cell } from 'recharts';


interface DashboardProps {
  logsWithStatus: (AttendanceLog & { status: AttendanceStatus })[];
  todayLog: (AttendanceLog & { status: AttendanceStatus }) | null;
  todayStatus: AttendanceStatus;
  onEditLog: (log: AttendanceLog) => void;
  schedules: Schedule[];
  activeSchedule: Schedule | null;
  settings: Settings;
  holidays: Holiday[];
  onOpenTaskModal: (day: DayOfWeek, classId: string) => void;
  subjectMeta: SubjectMeta;
}

const TodayStatusCard: React.FC<{
    todayStatus: AttendanceStatus;
    todayLog: (AttendanceLog & { status: AttendanceStatus }) | null;
    activeSchedule: Schedule | null;
    onEditLog: () => void;
    lateness: number;
}> = ({ todayStatus, todayLog, activeSchedule, onEditLog, lateness }) => {
    const { text, color, bg } = STATUS_MAP[todayStatus];
    
    const todayDayOfWeek = new Date().getDay();
    const todaySchedule = getScheduleForDate(new Date(), [activeSchedule!]);
    const todayRule = todaySchedule?.rules.find(r => r.dayOfWeek === todayDayOfWeek);
    const requiredTime = todayRule?.classes?.filter(c => !c.isOnline).slice()?.sort((a,b) => a.startTime.localeCompare(b.startTime))[0]?.startTime;

    const Icon = useMemo(() => {
        switch (todayStatus) {
            case 'ON_TIME': return CheckCircle;
            case 'EARLY': return Award;
            case 'LATE': return AlertCircle;
            case 'ABSENT': return XCircle;
            case 'DAY_OFF': return Coffee;
            case 'HOLIDAY': return CalendarDays;
            default:
                return Meh;
        }
    }, [todayStatus]);

    const getSubtitle = () => {
        if (todayStatus === 'LATE') return `You arrived ${lateness} minutes late.`;
        if (todayStatus === 'EARLY') return 'Great job, you were early!';
        if (todayStatus === 'ON_TIME') return 'Punctual and ready to go!';
        if (todayStatus === 'HOLIDAY') {
            const holiday = todayLog?.status === 'HOLIDAY' ? ' (Marked)' : '';
            return `It's a public holiday${holiday}.`;
        }
        if (todayStatus === 'DAY_OFF') return `No physical classes scheduled for today.`;
        return 'No entry recorded for today.';
    }

    return (
        <Card className={`p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 ${bg}`}>
            <Icon size={48} className={`${color} flex-shrink-0`} />
            <div className="flex-grow">
                 <p className={`text-2xl font-bold ${color}`}>{text}</p>
                 <p className={`text-sm ${color} opacity-80 font-medium`}>{getSubtitle()}</p>
            </div>
            <div className="text-left sm:text-right w-full sm:w-auto mt-2 sm:mt-0 flex-shrink-0">
                <p className="font-semibold text-3xl text-zinc-800 dark:text-zinc-200">{formatTime(todayLog?.arrivalTime || null)}</p>
                <div className="flex items-center justify-start sm:justify-end gap-4">
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Required: {formatTime(requiredTime || null)}</p>
                  {todayLog && (
                    <button onClick={onEditLog} className="text-xs font-semibold text-primary/80 hover:text-primary flex items-center gap-1">
                        <Edit size={12} /> Edit
                    </button>
                  )}
                </div>
            </div>
        </Card>
    )
}

const WeeklyOverviewWidget: React.FC<{ weeklyLogs: (AttendanceLog & { status: AttendanceStatus })[], schedules: Schedule[], holidays: Holiday[] }> = ({ weeklyLogs, schedules, holidays }) => {
    
    const weekData = useMemo(() => {
        const now = new Date();
        const start = startOfWeek(now, { weekStartsOn: 1 }); // Monday
        const end = endOfWeek(now, { weekStartsOn: 1 });
        const days = eachDayOfInterval({start, end});

        const logsByDate = weeklyLogs.reduce((acc, log) => {
            acc[log.date] = log.status;
            return acc;
        }, {} as Record<string, AttendanceStatus>);
        
        return days.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const dayOfWeek = getDay(day);
            const isHoliday = holidays.some(h => h.date === dateStr);
            let status: AttendanceStatus;

            if (isHoliday) {
                status = 'HOLIDAY';
            } else if (logsByDate[dateStr]) {
                status = logsByDate[dateStr];
            } else {
                const scheduleForDay = getScheduleForDate(day, schedules);
                const rule = scheduleForDay?.rules.find(r => r.dayOfWeek === dayOfWeek);
                if (!scheduleForDay) {
                    status = 'NO_SCHEDULE';
                } else if (!rule || rule.classes.filter(c => !c.isOnline).length === 0) {
                    status = 'DAY_OFF';
                } else {
                     const today = startOfDay(new Date());
                     status = day < today ? 'ABSENT' : 'NO_ENTRY';
                }
            }
            
            return {
                name: format(day, 'E'),
                status: status,
                value: (status === 'NO_ENTRY' || status === 'DAY_OFF' || status === 'NO_SCHEDULE') ? 10 : 100
            };
        })
    }, [weeklyLogs, schedules, holidays]);

    const getBarFillColor = (status: AttendanceStatus) => {
        switch (status) {
            case 'ON_TIME':
            case 'EARLY': return CHART_COLORS.onTime;
            case 'LATE': return CHART_COLORS.late;
            case 'ABSENT': return CHART_COLORS.absent;
            case 'HOLIDAY': return CHART_COLORS.holiday;
            default: return CHART_COLORS.dayOff;
        }
    }

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
          const { status, name } = payload[0].payload;
          const statusText = STATUS_MAP[status as AttendanceStatus].text;
          return (
            <div className="p-2 bg-zinc-800 text-white rounded-md text-xs shadow-lg">
              {name}: {statusText}
            </div>
          );
        }
        return null;
      };

    return (
        <Card className="p-6">
            <h3 className="font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-2"><CalendarDays size={18} className="text-zinc-400 dark:text-zinc-500"/>Weekly Overview</h3>
            <div className="h-28 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weekData} margin={{ top: 5, right: 0, left: 0, bottom: 5 }} barCategoryGap="20%">
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(161, 161, 170, 0.1)' }} />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                            {weekData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={getBarFillColor(entry.status)} />
                            ))}
                        </Bar>
                        <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: 'rgb(113 113 122)', fontSize: 12 }} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};

const StreakCard: React.FC<{ logs: (AttendanceLog & { status: AttendanceStatus })[], schedules: Schedule[], holidays: Holiday[] }> = ({ logs, schedules, holidays }) => {
    const streak = useMemo(() => {
        return calculateOnTimeStreak(logs, schedules, holidays);
    }, [logs, schedules, holidays]);

     return (
        <Card className="p-6">
            <h3 className="font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-2"><TrendingUp size={18} className="text-zinc-400 dark:text-zinc-500"/>On-Time Streak</h3>
            <div className="flex items-baseline justify-center gap-2 mt-4">
                <span className="text-6xl font-bold text-primary">{streak}</span>
                <span className="text-2xl font-semibold text-zinc-400 dark:text-zinc-500">Days</span>
            </div>
             <p className="text-center text-zinc-500 dark:text-zinc-400 text-sm mt-2">{streak > 1 ? "Keep up the great work!" : "Let's build a new streak!"}</p>
        </Card>
    );
}

const TodaySchedule: React.FC<{ schedule: Schedule | null; subjectMeta: SubjectMeta; onOpenTaskModal: (day: DayOfWeek, classId: string) => void; }> = ({ schedule, subjectMeta, onOpenTaskModal }) => {
    const today = new Date();
    const dayOfWeek = getDay(today) as DayOfWeek;
    
    const todayClasses = useMemo(() => {
        if (!schedule) return [];
        const rule = schedule.rules.find(r => r.dayOfWeek === dayOfWeek);
        return rule ? rule.classes.slice().sort((a, b) => a.startTime.localeCompare(b.startTime)) : [];
    }, [schedule, dayOfWeek]);

    if (!schedule || todayClasses.length === 0) {
        return (
             <Card className="p-6">
                <h3 className="font-semibold text-zinc-700 dark:text-zinc-300 mb-4">Today's Schedule</h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-center py-8">No classes scheduled for today. Enjoy your day! 🎉</p>
             </Card>
        )
    }

    return (
        <Card>
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800">
                <h3 className="font-semibold text-zinc-700 dark:text-zinc-300">Today's Schedule</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">{format(today, 'EEEE, MMMM d')}</p>
            </div>
            <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {todayClasses.map(cls => {
                    const meta = subjectMeta[cls.subject] || { color: '#cccccc', icon: '📚' };
                    const pendingTasks = cls.tasks.filter(t => !t.completed).length;
                    return (
                        <li key={cls.id} className="p-4 flex justify-between items-center hover:bg-zinc-50/50 dark:hover:bg-white/5 transition-colors duration-150">
                            <div className="flex items-center gap-4">
                               <div className="flex flex-col items-center">
                                 <span 
                                   className="text-2xl w-12 h-12 flex items-center justify-center rounded-full" 
                                   style={{backgroundColor: meta.color, color: getContrastingTextColor(meta.color)}}
                                 >
                                     {meta.icon}
                                 </span>
                               </div>
                               <div>
                                   <p className="font-semibold text-zinc-800 dark:text-zinc-200">
                                       {cls.subject}
                                       {cls.isOnline && <span className="text-xs ml-2 text-primary font-medium">(Flipped)</span>}
                                    </p>
                                   <p className="text-sm text-zinc-500 dark:text-zinc-400">{formatTime(cls.startTime)} - {formatTime(cls.endTime)}</p>
                               </div>
                            </div>
                            <button
                                onClick={() => onOpenTaskModal(dayOfWeek, cls.id)}
                                className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 hover:text-primary dark:hover:text-blue-400 p-2 rounded-lg"
                            >
                                {pendingTasks > 0 && <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-danger text-white">{pendingTasks}</span>}
                                <span className="hidden sm:inline text-sm">{pendingTasks > 0 ? 'Tasks' : 'View Tasks'}</span>
                                <ChevronRight size={18} />
                            </button>
                        </li>
                    )
                })}
            </ul>
        </Card>
    );
};

export const Dashboard: React.FC<DashboardProps> = ({ logsWithStatus, todayLog, todayStatus, onEditLog, schedules, activeSchedule, settings, holidays, onOpenTaskModal, subjectMeta }) => {
    
    const weeklyLogs = useMemo(() => {
        const now = new Date();
        const start = startOfWeek(now, { weekStartsOn: 1 });
        const end = endOfWeek(now, { weekStartsOn: 1 });
        return logsWithStatus.filter(log => {
            try {
                return isWithinInterval(parseISO(log.date), { start, end });
            } catch {
                return false;
            }
        });
    }, [logsWithStatus]);

    const lateness = useMemo(() => {
      if(todayLog && todayStatus === 'LATE') {
        return calculateLateness(todayLog, schedules, settings.gracePeriod);
      }
      return 0;
    }, [todayLog, todayStatus, schedules, settings.gracePeriod]);

  return (
    <div className="space-y-6">
      <TodayStatusCard 
        todayStatus={todayStatus} 
        todayLog={todayLog} 
        onEditLog={() => todayLog && onEditLog(todayLog)} 
        activeSchedule={activeSchedule} 
        lateness={lateness}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TodaySchedule schedule={activeSchedule} subjectMeta={subjectMeta} onOpenTaskModal={onOpenTaskModal} />
          <div className="flex flex-col gap-6">
            <WeeklyOverviewWidget weeklyLogs={weeklyLogs} schedules={schedules} holidays={holidays} />
            <StreakCard logs={logsWithStatus} schedules={schedules} holidays={holidays} />
          </div>
      </div>

       <div>
        <h3 className="text-xl font-semibold mb-4 ml-1">Recent Activity</h3>
        <Card className="overflow-hidden">
            <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {logsWithStatus.slice(0, 5).map(log => {
                    const {text, color, bg} = STATUS_MAP[log.status];
                    return (
                        <li key={log.id} className="p-4 flex justify-between items-center hover:bg-zinc-50/50 dark:hover:bg-white/5 transition-colors duration-150 group">
                            <div>
                                <p className="font-semibold text-zinc-800 dark:text-zinc-200">{format(parseISO(log.date), 'EEEE, MMM d')}</p>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">Arrival: {formatTime(log.arrivalTime)}</p>
                            </div>
                           <div className="flex items-center gap-4">
                             <span className={`px-3 py-1 text-xs font-bold rounded-full ${color} ${bg}`}>{text}</span>
                             <button onClick={() => onEditLog(log)} className="text-zinc-400 hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg -m-2">
                                <Edit size={18} />
                             </button>
                           </div>
                        </li>
                    )
                })}
                 {logsWithStatus.length === 0 && (
                    <li className="p-8 text-center text-zinc-500 dark:text-zinc-400">
                        No recent activity to show. Add a log to get started!
                    </li>
                )}
            </ul>
        </Card>
       </div>
    </div>
  );
};
