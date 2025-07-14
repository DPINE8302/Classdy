

import React, { useMemo, useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid, Legend, ReferenceLine } from 'recharts';
import { Card } from '../shared/Card';
import type { AttendanceLog, AttendanceStatus, Holiday, Schedule, Settings } from '../../types';
import { getStatus, getHeatmapColor, STATUS_MAP, CHART_COLORS, calculateLateness } from '../../lib/utils';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, parseISO, isWithinInterval, subDays, addMonths, isBefore, startOfWeek, endOfWeek } from 'date-fns';

type Period = 'week' | 'month' | 'all' | 'custom';

interface AnalyticsProps {
    logsWithStatus: (AttendanceLog & { status: AttendanceStatus })[];
    schedules: Schedule[];
    activeSchedule: Schedule;
    settings: Settings;
    holidays: Holiday[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const name = label || data.name;
      const value = data.value;
      const unit = data.unit || '';
      
      return (
        <div className="p-3 bg-zinc-800/80 dark:bg-black/60 backdrop-blur-sm rounded-lg shadow-lg border border-white/10">
          <p className="text-sm font-bold text-white">{name}</p>
          <p className="text-xs" style={{ color: data.color || data.payload.fill }}>
            {`${data.name}: ${value}${unit}`}
          </p>
        </div>
      );
    }
    return null;
  };

const HeatmapLegend = () => {
    const legendItems = [
        { status: 'ON_TIME', label: 'On Time/Early' },
        { status: 'LATE', label: 'Late' },
        { status: 'ABSENT', label: 'Absent' },
        { status: 'HOLIDAY', label: 'Holiday' },
        { status: 'DAY_OFF', label: 'Day Off' },
    ] as { status: AttendanceStatus, label: string }[];
    
    return (
        <div className="flex justify-center items-center gap-4 mt-4 flex-wrap">
            {legendItems.map(item => (
                <div key={item.status} className="flex items-center gap-1.5">
                    <div className={`w-3 h-3 rounded-sm ${getHeatmapColor(item.status)}`} />
                    <span className="text-xs text-zinc-600 dark:text-zinc-400">{item.label}</span>
                </div>
            ))}
        </div>
    );
};

interface CalendarHeatmapProps {
    logsWithStatus: (AttendanceLog & { status: AttendanceStatus })[];
    schedules: Schedule[];
    holidays: Holiday[];
    settings: Settings;
    period: Period;
    customRange: { start: string, end: string };
}

const CalendarHeatmap: React.FC<CalendarHeatmapProps> = ({ logsWithStatus, schedules, holidays, settings, period, customRange }) => {
    const logsByDate = useMemo(() => {
        return logsWithStatus.reduce((acc, log) => {
            acc[log.date] = log;
            return acc;
        }, {} as Record<string, (AttendanceLog & { status: AttendanceStatus })>)
    }, [logsWithStatus]);

    const monthsToDisplay = useMemo(() => {
        const today = new Date();
        let rangeStart: Date, rangeEnd: Date;
        try {
            switch(period) {
                case 'week':
                    rangeStart = startOfWeek(today, { weekStartsOn: 1 });
                    rangeEnd = endOfWeek(today, { weekStartsOn: 1 });
                    break;
                case 'month':
                    rangeStart = startOfMonth(today);
                    rangeEnd = endOfMonth(today);
                    break;
                case 'custom':
                    rangeStart = parseISO(customRange.start);
                    rangeEnd = parseISO(customRange.end);
                    break;
                case 'all':
                default:
                    rangeStart = logsWithStatus.length > 0 ? parseISO(logsWithStatus[logsWithStatus.length - 1].date) : subDays(today, 90);
                    rangeEnd = today;
            }
        } catch {
            rangeStart = startOfMonth(today);
            rangeEnd = endOfMonth(today);
        }

        const months = [];
        let currentMonth = startOfMonth(rangeStart);
        const lastMonth = startOfMonth(rangeEnd);

        while (isBefore(currentMonth, addMonths(lastMonth, 1))) {
            months.push(currentMonth);
            currentMonth = addMonths(currentMonth, 1);
        }
        return months;

    }, [period, customRange, logsWithStatus]);
    
    if (monthsToDisplay.length === 0) {
        return <Card className="p-6 text-center text-zinc-500">No data for this period</Card>
    }

    return (
        <Card className="p-6">
            <div className="space-y-8">
                {monthsToDisplay.map(monthDate => {
                    const monthKey = format(monthDate, 'yyyy-MM');
                    const firstDayOfMonth = monthDate;
                    const lastDayOfMonth = endOfMonth(monthDate);
                    const daysInMonth = eachDayOfInterval({ start: firstDayOfMonth, end: lastDayOfMonth });
                    
                    let startingDayIndex = getDay(firstDayOfMonth); // Sunday is 0
                    if (startingDayIndex === 0) startingDayIndex = 7; // Sunday at the end
                    startingDayIndex -= 1; // Monday starts at 0

                    const paddingDays = Array.from({ length: startingDayIndex }, (_, i) => i);

                    return (
                        <div key={monthKey}>
                            <h4 className="font-semibold text-lg mb-4 text-zinc-800 dark:text-zinc-200">{format(monthDate, 'MMMM yyyy')}</h4>
                            <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2">
                                <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                            </div>
                            <div className="grid grid-cols-7 gap-1 sm:gap-2">
                                {paddingDays.map(i => <div key={`pad-${i}`} />)}
                                {daysInMonth.map(day => {
                                    const dateStr = format(day, 'yyyy-MM-dd');
                                    const log = logsByDate[dateStr];
                                    const status = getStatus(dateStr, log?.arrivalTime || null, schedules, settings.gracePeriod, holidays, log?.statusTag);
                                    const tooltipText = `${format(day, 'MMM d')}: ${STATUS_MAP[status].text}`;

                                    return (
                                        <div key={dateStr} className="group relative">
                                            <div className={`aspect-square rounded-lg flex items-center justify-center ${getHeatmapColor(status)}`}>
                                                <span className={`text-xs ${status === 'DAY_OFF' || status === 'NO_ENTRY' ? 'text-zinc-400 dark:text-zinc-500' : 'text-white/80'}`}>{format(day, 'd')}</span>
                                            </div>
                                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max px-2 py-1 bg-zinc-800 text-white text-xs rounded-md opacity-0 pointer-events-none transition-opacity group-hover:opacity-100 z-10">
                                               {tooltipText}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
            <HeatmapLegend />
        </Card>
    );
};

const PunctualityPieChart: React.FC<{ data: any[] }> = ({ data }) => {
    const COLORS = [CHART_COLORS.onTime, CHART_COLORS.late, CHART_COLORS.absent, CHART_COLORS.early];
    const total = useMemo(() => data.reduce((sum, entry) => sum + entry.value, 0), [data]);
    
    return (
        <Card className="p-6 relative">
            <h3 className="font-semibold text-zinc-700 dark:text-zinc-300 mb-4">Punctuality Breakdown</h3>
            {total === 0 ? (
                 <div className="h-64 flex items-center justify-center text-zinc-500">No data for this period</div>
            ) : (
                <div className="w-full h-64">
                    <ResponsiveContainer>
                        <PieChart>
                            <Pie 
                                data={data} 
                                dataKey="value" 
                                nameKey="name" 
                                cx="50%" 
                                cy="50%" 
                                innerRadius={65} 
                                outerRadius={90} 
                                fill="#8884d8" 
                                paddingAngle={5}
                                labelLine={false} 
                                label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                                     const radius = outerRadius + 15;
                                     const x  = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                                     const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                                     return (percent > 0.05) ? <text x={x} y={y} fill="currentColor" className="text-zinc-600 dark:text-zinc-400 text-xs" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">{`${(percent * 100).toFixed(0)}%`}</text> : null;
                                }}>
                                {data.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="transparent" />)}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            )}
            {total > 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-4xl font-bold text-zinc-800 dark:text-zinc-200">{total}</span>
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">Tracked Days</span>
                </div>
            )}
        </Card>
    );
};

const LatenessTrendChart: React.FC<{ data: any[], overallAverage: number }> = ({ data, overallAverage }) => {
    return (
        <Card className="p-6">
            <h3 className="font-semibold text-zinc-700 dark:text-zinc-300 mb-4">Lateness by Week</h3>
            {data.length === 0 ? (
                 <div className="h-64 flex items-center justify-center text-zinc-500">No late entries for this period</div>
            ) : (
                <div className="w-full h-64">
                    <ResponsiveContainer>
                         <AreaChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <defs>
                                <linearGradient id="colorLateness" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={CHART_COLORS.late} stopOpacity={0.7}/>
                                    <stop offset="95%" stopColor={CHART_COLORS.late} stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                            <XAxis dataKey="name" tick={{fill: 'rgb(113 113 122)', fontSize: 12}} />
                            <YAxis unit="m" tick={{fill: 'rgb(113 113 122)', fontSize: 12}}/>
                            <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(161, 161, 170, 0.1)'}}/>
                            <Legend iconType="circle" verticalAlign="top" wrapperStyle={{paddingBottom: '15px'}}/>
                            <ReferenceLine y={overallAverage} label={{ value: 'Avg', position: 'insideTopRight', fill: CHART_COLORS.absent, fontSize: 10 }} stroke={CHART_COLORS.absent} strokeDasharray="3 3" />
                            <Area type="monotone" dataKey="avgLateness" stroke={CHART_COLORS.late} fill="url(#colorLateness)" name="Avg Lateness" unit="m" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}
        </Card>
    )
}

const SegmentedControl: React.FC<{
    options: {label: string, value: Period}[],
    value: Period,
    onChange: (value: Period) => void
}> = ({ options, value, onChange }) => (
    <div className="flex bg-zinc-200/80 dark:bg-zinc-800 rounded-lg p-1">
        {options.map(opt => (
            <button
                key={opt.value}
                onClick={() => onChange(opt.value)}
                className={`px-3 py-1.5 rounded-md text-sm font-semibold flex items-center justify-center transition-colors w-full ${value === opt.value ? 'bg-white dark:bg-zinc-700 text-primary' : 'text-zinc-600 dark:text-zinc-300 hover:bg-white/50 dark:hover:bg-zinc-700/50'}`}
            >
                {opt.label}
            </button>
        ))}
    </div>
);


export const Analytics: React.FC<AnalyticsProps> = (props) => {
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

    const pieChartData = useMemo(() => {
        const counts = filteredLogs.reduce((acc, log) => {
            if (log.status === 'ON_TIME' || log.status === 'EARLY' || log.status === 'LATE' || log.status === 'ABSENT') {
                const key = log.status === 'EARLY' ? 'ON_TIME' : log.status;
                acc[key] = (acc[key] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);
        
        return [
            { name: 'On Time & Early', value: counts.ON_TIME || 0 },
            { name: 'Late', value: counts.LATE || 0 },
            { name: 'Absent', value: counts.ABSENT || 0 },
        ].filter(d => d.value > 0);
    }, [filteredLogs]);

    const latenessData = useMemo(() => {
        const lateLogs = filteredLogs.filter(log => log.status === 'LATE');
        
        const weeks: Record<string, { totalLateness: number, count: number }> = {};
        
        lateLogs.forEach(log => {
            try {
                const weekStartDate = format(startOfWeek(parseISO(log.date), { weekStartsOn: 1 }), 'yyyy-MM-dd');
                const lateness = calculateLateness(log, props.schedules, props.settings.gracePeriod);
                if (!weeks[weekStartDate]) {
                    weeks[weekStartDate] = { totalLateness: 0, count: 0 };
                }
                weeks[weekStartDate].totalLateness += lateness;
                weeks[weekStartDate].count++;
            } catch (e) {
                console.error("Error parsing date for lateness trend:", log.date, e);
            }
        });
        
        const trendData = Object.keys(weeks).sort().map(weekStartDate => ({
            name: format(parseISO(weekStartDate), 'MMM d'),
            avgLateness: Math.round(weeks[weekStartDate].totalLateness / weeks[weekStartDate].count)
        }));

        const totalLateness = lateLogs.reduce((sum, log) => sum + calculateLateness(log, props.schedules, props.settings.gracePeriod), 0);
        const overallAverage = lateLogs.length > 0 ? Math.round(totalLateness / lateLogs.length) : 0;

        return { trendData, overallAverage };

    }, [filteredLogs, props.schedules, props.settings.gracePeriod]);

  return (
    <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                 <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-200">Detailed Reports</h2>
                 <div className="flex items-center gap-2 flex-wrap">
                    <div className="w-full sm:w-auto">
                        <SegmentedControl
                            options={[
                                { label: 'Week', value: 'week' },
                                { label: 'Month', value: 'month' },
                                { label: 'All', value: 'all' },
                                { label: 'Custom', value: 'custom' },
                            ]}
                            value={period}
                            onChange={setPeriod}
                        />
                    </div>

                    {period === 'custom' && (
                        <div className="flex items-center gap-2 animate-fade-in w-full sm:w-auto">
                            <input type="date" value={customRange.start} onChange={(e) => handleCustomRangeChange(e, 'start')} className="p-1.5 h-9 rounded-lg text-sm bg-zinc-200 dark:bg-zinc-800 border-transparent focus:border-primary focus:ring-primary w-full" style={{colorScheme: 'dark'}}/>
                            <span className="text-zinc-500">-</span>
                             <input type="date" value={customRange.end} onChange={(e) => handleCustomRangeChange(e, 'end')} className="p-1.5 h-9 rounded-lg text-sm bg-zinc-200 dark:bg-zinc-800 border-transparent focus:border-primary focus:ring-primary w-full" style={{colorScheme: 'dark'}}/>
                        </div>
                    )}
                 </div>
            </div>

        <CalendarHeatmap 
            logsWithStatus={props.logsWithStatus} 
            schedules={props.schedules}
            settings={props.settings} 
            holidays={props.holidays} 
            period={period}
            customRange={customRange}
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PunctualityPieChart data={pieChartData} />
            <LatenessTrendChart data={latenessData.trendData} overallAverage={latenessData.overallAverage} />
        </div>
    </div>
  );
};