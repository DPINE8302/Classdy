

import React, { useState, useMemo } from 'react';
import { Card } from '../shared/Card';
import type { AttendanceLog, AttendanceStatus, Holiday, Schedule, Settings } from '../../types';
import { timeToMinutes, minutesToTime } from '../../lib/utils';
import { Clock, CheckCircle, Sunrise, Sunset } from 'lucide-react';
import { ArrivalTimeChart } from './ArrivalTimeChart';
import { startOfWeek, startOfMonth, isWithinInterval, parseISO, subDays, format } from 'date-fns';

interface OverviewProps {
    logsWithStatus: (AttendanceLog & { status: AttendanceStatus })[];
    schedules: Schedule[];
    activeSchedule: Schedule;
    settings: Settings;
    holidays: Holiday[];
}

type Period = 'week' | 'month' | 'all' | 'custom';

const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: string; }> = ({ icon, title, value }) => {
    return (
        <Card className="p-4">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-zinc-100 dark:bg-zinc-700/50 rounded-lg">
                    {icon}
                </div>
                <div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">{title}</p>
                    <p className="text-2xl font-bold text-zinc-800 dark:text-zinc-200">{value}</p>
                </div>
            </div>
        </Card>
    );
};

export const Overview: React.FC<OverviewProps> = (props) => {
    const [period, setPeriod] = useState<Period>('month');
    const [customRange, setCustomRange] = useState({
        start: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
        end: format(new Date(), 'yyyy-MM-dd'),
    });

    const handleCustomRangeChange = (e: React.ChangeEvent<HTMLInputElement>, part: 'start' | 'end') => {
        setCustomRange(prev => ({...prev, [part]: e.target.value}));
    }

    const filteredLogs = useMemo(() => {
        const now = new Date();
        if (period === 'all') {
            return props.logsWithStatus;
        }
        if (period === 'custom') {
            if (!customRange.start || !customRange.end) return [];
            try {
                const start = parseISO(customRange.start);
                const end = parseISO(customRange.end);
                end.setHours(23, 59, 59, 999);
                return props.logsWithStatus.filter(log => {
                    try {
                        return isWithinInterval(parseISO(log.date), { start, end });
                    } catch { return false; }
                });
            } catch {
                return [];
            }
        }
        
        const start = period === 'week' ? startOfWeek(now, { weekStartsOn: 1 }) : startOfMonth(now);
        
        return props.logsWithStatus.filter(log => {
            try {
                 return isWithinInterval(parseISO(log.date), { start, end: now });
            } catch {
                return false;
            }
        });
    }, [props.logsWithStatus, period, customRange]);
    
    const summaryStats = useMemo(() => {
        const trackedLogs = filteredLogs.filter(log => log.arrivalTime && ['ON_TIME', 'LATE', 'EARLY'].includes(log.status));
        if (trackedLogs.length === 0) {
            return {
                avgArrivalTime: '--:--',
                onTimePercentage: 'N/A',
                earliestArrival: '--:--',
                latestArrival: '--:--',
            };
        }

        const arrivalTimesInMinutes = trackedLogs.map(log => timeToMinutes(log.arrivalTime!));
        const totalMinutes = arrivalTimesInMinutes.reduce((sum, mins) => sum + mins, 0);
        const avgMinutes = totalMinutes / arrivalTimesInMinutes.length;

        const earliest = Math.min(...arrivalTimesInMinutes);
        const latest = Math.max(...arrivalTimesInMinutes);

        const onTimeCount = filteredLogs.filter(log => log.status === 'ON_TIME' || log.status === 'EARLY').length;
        const totalDaysWithStatus = filteredLogs.filter(log => ['ON_TIME', 'LATE', 'EARLY', 'ABSENT'].includes(log.status)).length;
        
        const onTimePercentage = totalDaysWithStatus > 0 ? (onTimeCount / totalDaysWithStatus) * 100 : 0;

        return {
            avgArrivalTime: minutesToTime(avgMinutes),
            onTimePercentage: `${onTimePercentage.toFixed(0)}%`,
            earliestArrival: minutesToTime(earliest),
            latestArrival: minutesToTime(latest),
        };
    }, [filteredLogs]);


    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                 <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-200">Analytics Overview</h2>
                 <div className="flex items-center gap-2 flex-wrap">
                    <select
                        value={period}
                        onChange={(e) => setPeriod(e.target.value as Period)}
                        className="p-1.5 h-9 rounded-lg text-sm font-semibold capitalize transition-colors bg-zinc-200 dark:bg-zinc-800 border-transparent focus:border-primary focus:ring-primary"
                    >
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                        <option value="all">All Time</option>
                        <option value="custom">Custom Range</option>
                    </select>

                    {period === 'custom' && (
                        <div className="flex items-center gap-2 animate-fade-in">
                            <input type="date" value={customRange.start} onChange={(e) => handleCustomRangeChange(e, 'start')} className="p-1 h-9 rounded-lg text-sm bg-zinc-200 dark:bg-zinc-800 border-transparent focus:border-primary focus:ring-primary" style={{colorScheme: 'dark'}}/>
                            <span className="text-zinc-500">-</span>
                             <input type="date" value={customRange.end} onChange={(e) => handleCustomRangeChange(e, 'end')} className="p-1 h-9 rounded-lg text-sm bg-zinc-200 dark:bg-zinc-800 border-transparent focus:border-primary focus:ring-primary" style={{colorScheme: 'dark'}}/>
                        </div>
                    )}
                 </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={<Clock size={24} className="text-primary"/>} title="Avg. Arrival" value={summaryStats.avgArrivalTime} />
                <StatCard icon={<CheckCircle size={24} className="text-success"/>} title="On-Time Rate" value={summaryStats.onTimePercentage} />
                <StatCard icon={<Sunrise size={24} className="text-blue-500"/>} title="Earliest Arrival" value={summaryStats.earliestArrival} />
                <StatCard icon={<Sunset size={24} className="text-warning"/>} title="Latest Arrival" value={summaryStats.latestArrival} />
            </div>
            
            <ArrivalTimeChart 
                logs={filteredLogs}
                schedules={props.schedules}
                period={period}
                gracePeriod={props.settings.gracePeriod}
            />

        </div>
    );
};
