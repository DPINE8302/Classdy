
import React, { useMemo } from 'react';
import { ResponsiveContainer, ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Dot } from 'recharts';
import { Card } from '../shared/Card';
import { timeToMinutes, timeAxisFormatter, STATUS_MAP, calculateLateness, getScheduleForDate, CHART_COLORS } from '../../lib/utils';
import type { AttendanceLog, AttendanceStatus, Schedule } from '../../types';
import { format, parseISO, getDay } from 'date-fns';

interface ArrivalTimeChartProps {
  logs: (AttendanceLog & { status: AttendanceStatus })[];
  schedules: Schedule[];
  period: 'week' | 'month' | 'all' | 'custom';
  gracePeriod: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const { arrivalTime, requiredTime, graceTime, status, lateness } = payload[0].payload;
        
        let statusText = STATUS_MAP[status].text;
        let statusColor = CHART_COLORS.onTime; 
        if (status === 'LATE') {
            statusText = `Late by ${lateness} min`;
            statusColor = CHART_COLORS.late;
        }

        return (
            <div className="p-3 bg-zinc-800/80 dark:bg-black/60 backdrop-blur-sm rounded-lg shadow-lg border border-white/10 text-white">
              <p className="text-sm font-bold">{label}</p>
              <p className="text-xs mt-2">Arrival: <span className="font-semibold">{timeAxisFormatter(arrivalTime)}</span></p>
              <p className="text-xs">On-time by: <span className="font-semibold">{timeAxisFormatter(requiredTime)}</span></p>
              <p className="text-xs">Late after: <span className="font-semibold">{timeAxisFormatter(graceTime)}</span></p>
              <p className="text-xs mt-2">Status: <span className="font-semibold" style={{color: statusColor}}>{statusText}</span></p>
            </div>
        );
    }
    return null;
};

const CustomDot: React.FC<any> = (props) => {
    const { cx, cy, payload } = props;
    if (payload.status === 'LATE') {
        return <Dot cx={cx} cy={cy} r={4} fill={CHART_COLORS.late} />;
    }
    if (payload.status === 'ON_TIME' || payload.status === 'EARLY') {
        return <Dot cx={cx} cy={cy} r={4} fill={CHART_COLORS.onTime} />;
    }
    return null;
};


export const ArrivalTimeChart: React.FC<ArrivalTimeChartProps> = ({ logs, schedules, period, gracePeriod }) => {

    const chartData = useMemo(() => {
        return logs
            .filter(log => log.arrivalTime && (log.status === 'ON_TIME' || log.status === 'LATE' || log.status === 'EARLY'))
            .map(log => {
                const logDate = parseISO(log.date);
                const scheduleForLog = getScheduleForDate(logDate, schedules);
                if (!scheduleForLog) return null;

                const dayOfWeek = getDay(logDate);
                const rule = scheduleForLog.rules.find(r => r.dayOfWeek === dayOfWeek);
                const firstPhysicalClass = rule?.classes?.filter(c => !c.isOnline).slice().sort((a,b) => a.startTime.localeCompare(b.startTime))[0];
                
                if (!firstPhysicalClass) return null;

                const requiredTimeStr = firstPhysicalClass.startTime;
                const requiredTimeMins = timeToMinutes(requiredTimeStr);
                
                return {
                    date: log.date,
                    name: format(parseISO(log.date), period === 'all' ? 'MMM d, yy' : 'MMM d'),
                    arrivalTime: timeToMinutes(log.arrivalTime!),
                    requiredTime: requiredTimeMins,
                    graceTime: requiredTimeMins + gracePeriod,
                    status: log.status,
                    lateness: log.status === 'LATE' ? calculateLateness(log, schedules, gracePeriod) : 0,
                };
            })
            .filter((item): item is NonNullable<typeof item> => item !== null)
            .sort((a, b) => a.date.localeCompare(b.date));
    }, [logs, schedules, period, gracePeriod]);


    if (chartData.length === 0) {
        return (
            <Card className="p-6">
                <h3 className="font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Arrival Time Trend</h3>
                <div className="h-72 flex items-center justify-center">
                    <p className="text-zinc-500">No arrival data to display for this period.</p>
                </div>
            </Card>
        )
    }

    return (
        <Card className="p-6">
            <h3 className="font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Arrival Time Trend</h3>
             <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
                Track your arrival times against your schedule's requirements. The space between the green and orange lines is your on-time window.
            </p>
            <div className="w-full h-80">
                <ResponsiveContainer>
                    <ComposedChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                        <XAxis dataKey="name" tick={{ fill: 'rgb(113 113 122)', fontSize: 12 }} />
                        <YAxis 
                            domain={['dataMin - 15', 'dataMax + 15']}
                            tickFormatter={timeAxisFormatter}
                            tick={{ fill: 'rgb(113 113 122)', fontSize: 12 }}
                            allowDecimals={false}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend iconType="plainline" />
                        
                        <Line
                            type="monotone"
                            dataKey="requiredTime"
                            stroke={CHART_COLORS.onTime}
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            dot={false}
                            name="On-time by"
                            connectNulls
                        />
                         <Line
                            type="monotone"
                            dataKey="graceTime"
                            stroke={CHART_COLORS.late}
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            dot={false}
                            name="Late after"
                            connectNulls
                        />
                         <Line 
                            type="monotone" 
                            dataKey="arrivalTime" 
                            stroke="var(--color-primary)"
                            strokeWidth={2}
                            activeDot={{ r: 6 }}
                            dot={<CustomDot />}
                            name="Actual Arrival"
                            connectNulls
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};
