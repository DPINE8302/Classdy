

import { parse, addMinutes, isAfter, isBefore, isEqual, differenceInMinutes, getDay, format, startOfDay, subDays, parseISO, isWithinInterval } from 'date-fns';
import type { AttendanceStatus, Schedule, Holiday, Theme, AttendanceLog } from '../types';

/**
 * Combines a date string (YYYY-MM-DD) and a time string (HH:mm) into a Date object.
 */
export function combineDateTime(dateStr: string, timeStr: string): Date {
  return parse(`${dateStr}T${timeStr}`, "yyyy-MM-dd'T'HH:mm", new Date());
}


/**
 * Finds the correct schedule for a given date from a list of schedules.
 */
export function getScheduleForDate(date: Date, schedules: Schedule[]): Schedule | null {
    const referenceDate = startOfDay(date);
    const dateBasedSchedule = schedules.find(s => {
        if (!s.startDate || !s.endDate) return false;
        try {
            const startDate = parseISO(s.startDate);
            const endDate = parseISO(s.endDate);
            endDate.setHours(23, 59, 59, 999);
            return isWithinInterval(referenceDate, { start: startDate, end: endDate });
        } catch (e) {
            console.error("Invalid date format in schedule:", s);
            return false;
        }
    });
    return dateBasedSchedule || null;
}


/**
 * Calculates the attendance status based on arrival time and the correct schedule for the given date.
 */
export function getStatus(dateStr: string, arrivalTimeStr: string | null, schedules: Schedule[], gracePeriod: number, holidays: Holiday[], statusTag?: 'Absent' | 'Holiday'): AttendanceStatus {
  try {
    const date = parseISO(dateStr);
    const schedule = getScheduleForDate(date, schedules);

    if (!schedule) return 'NO_SCHEDULE';
    
    if (holidays.some(h => h.date === dateStr)) return 'HOLIDAY';

    if (statusTag === 'Absent') return 'ABSENT';
    if (statusTag === 'Holiday') return 'HOLIDAY';

    const dayOfWeek = getDay(date);

    const rule = schedule.rules.find(r => r.dayOfWeek === dayOfWeek);
    
    const firstPhysicalClass = rule?.classes?.filter(c => !c.isOnline).slice().sort((a,b) => a.startTime.localeCompare(b.startTime))[0];

    if (!rule || !firstPhysicalClass) {
      return 'DAY_OFF';
    }

    const requiredArrivalTimeStr = firstPhysicalClass.startTime;

    if (!arrivalTimeStr) {
      // If it's a past date with no entry, it's considered absent. Future date is just no entry.
      const today = startOfDay(new Date());
      return startOfDay(date) < today ? 'ABSENT' : 'NO_ENTRY';
    }

    const arrivalTime = combineDateTime(dateStr, arrivalTimeStr);
    const requiredTime = combineDateTime(dateStr, requiredArrivalTimeStr);
    const graceTime = addMinutes(requiredTime, gracePeriod);

    if (isAfter(arrivalTime, graceTime)) {
      return 'LATE';
    }

    if (isBefore(arrivalTime, requiredTime) || isEqual(arrivalTime, requiredTime)) {
      return 'EARLY';
    }

    return 'ON_TIME';
  } catch (e) {
    console.error("Error calculating status for", dateStr, e);
    return 'NO_SCHEDULE';
  }
}

export const STATUS_MAP: Record<AttendanceStatus, { text: string; color: string; bg: string }> = {
    ON_TIME: { text: 'On Time', color: 'text-success-dark dark:text-green-300', bg: 'bg-green-500/10' },
    LATE: { text: 'Late', color: 'text-warning-dark dark:text-amber-400', bg: 'bg-amber-500/10' },
    EARLY: { text: 'Early', color: 'text-primary dark:text-blue-300', bg: 'bg-blue-500/10' },
    DAY_OFF: { text: 'Day Off', color: 'text-zinc-600 dark:text-zinc-400', bg: 'bg-zinc-200 dark:bg-zinc-700' },
    ABSENT: { text: 'Absent', color: 'text-danger-dark dark:text-red-400', bg: 'bg-red-500/10' },
    HOLIDAY: { text: 'Holiday', color: 'text-holiday-dark dark:text-indigo-300', bg: 'bg-indigo-500/10' },
    NO_ENTRY: { text: 'No Entry', color: 'text-zinc-600 dark:text-zinc-400', bg: 'bg-zinc-200 dark:bg-zinc-700' },
    NO_SCHEDULE: { text: 'No Schedule', color: 'text-zinc-600 dark:text-zinc-400', bg: 'bg-zinc-200 dark:bg-zinc-700' },
};


export const CHART_COLORS = {
    onTime: '#34c759',
    late: '#ff9f0a',
    absent: '#ff453a',
    early: '#0a84ff',
    holiday: '#5e5ce6',
    actual: 'var(--color-primary)',
    target: '#8e8e93',
    dayOff: '#d1d1d6'
};


export function getHeatmapColor(status: AttendanceStatus): string {
  switch (status) {
    case 'ON_TIME': return 'bg-green-400 dark:bg-green-600';
    case 'EARLY': return 'bg-blue-400 dark:bg-blue-600';
    case 'LATE': return 'bg-yellow-400 dark:bg-yellow-500';
    case 'ABSENT': return 'bg-red-400 dark:bg-red-500';
    case 'DAY_OFF': return 'bg-zinc-200 dark:bg-zinc-700';
    case 'HOLIDAY': return 'bg-indigo-400 dark:bg-indigo-600';
    default: return 'bg-zinc-100 dark:bg-zinc-800';
  }
}

export function formatTime(timeStr: string | null): string {
    if (!timeStr) return '--:--';
    try {
        const date = parse(timeStr, 'HH:mm', new Date());
        return format(date, 'p');
    } catch {
        return '--:--'
    }
}

export function timeToMinutes(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
}

export function minutesToTime(minutes: number): string {
    if (isNaN(minutes) || minutes === null) return '--:--';
    const date = new Date(1970, 0, 1, 0, Math.round(minutes));
    return format(date, 'p');
}

export const timeAxisFormatter = (value: number): string => {
    const hours = Math.floor(value / 60);
    const minutes = value % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

/**
 * Calculates how many minutes late an arrival is compared to the required time.
 * Returns 0 if on-time or early.
 */
export function calculateLateness(log: AttendanceLog, schedules: Schedule[], gracePeriod: number = 0): number {
  if (!log.arrivalTime) return 0;
  
  try {
    const date = parseISO(log.date);
    const schedule = getScheduleForDate(date, schedules);
    if (!schedule) return 0;

    const dayOfWeek = getDay(date);
    const rule = schedule.rules.find(r => r.dayOfWeek === dayOfWeek);
    
    const firstPhysicalClass = rule?.classes?.filter(c => !c.isOnline).slice().sort((a,b) => a.startTime.localeCompare(b.startTime))[0];
    if (!rule || !firstPhysicalClass) return 0;
    
    const requiredArrivalTime = firstPhysicalClass.startTime;

    const arrivalTime = combineDateTime(log.date, log.arrivalTime);
    const requiredTimeWithGrace = addMinutes(combineDateTime(log.date, requiredArrivalTime), gracePeriod);
    
    const diff = differenceInMinutes(arrivalTime, requiredTimeWithGrace);
    
    return diff > 0 ? diff : 0;
  } catch (e) {
    console.error("Error calculating lateness for", log, e);
    return 0;
  }
}

export function calculateOnTimeStreak(logsWithStatus: (AttendanceLog & { status: AttendanceStatus })[], schedules: Schedule[], holidays: Holiday[]): number {
    let streak = 0;
    const logsByDate = logsWithStatus.reduce((acc, log) => {
        acc[log.date] = log;
        return acc;
    }, {} as Record<string, (AttendanceLog & { status: AttendanceStatus })>);
    
    let currentDate = startOfDay(new Date());

    for (let i = 0; i < 365; i++) { // Check up to a year back
        const dateStr = format(currentDate, 'yyyy-MM-dd');
        
        const isHoliday = holidays.some(h => h.date === dateStr);
        const schedule = getScheduleForDate(currentDate, schedules);
        const dayOfWeek = getDay(currentDate);
        const rule = schedule?.rules.find(r => r.dayOfWeek === dayOfWeek);
        const firstPhysicalClass = rule?.classes?.filter(c => !c.isOnline).slice().sort((a,b) => a.startTime.localeCompare(b.startTime))[0];
        const isDayOff = !schedule || !rule || !firstPhysicalClass;

        if (isHoliday || isDayOff) {
            currentDate = subDays(currentDate, 1);
            continue;
        }

        const log = logsByDate[dateStr];
        
        if (!log) {
            if (isBefore(currentDate, startOfDay(new Date()))) {
                return streak; // Past workday with no log, streak is broken.
            } else {
                // Today with no log yet, don't break streak, just end count.
                return streak; 
            }
        }
        
        if (log.status === 'ON_TIME' || log.status === 'EARLY') {
            streak++;
        } else if (log.status === 'LATE' || log.status === 'ABSENT') {
            return streak; // Streak broken
        }
        
        currentDate = subDays(currentDate, 1);
    }
    
    return streak;
}


export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
}

const adjustColor = (hex: string, amount: number) => {
    let color = parseInt(hex.slice(1), 16);
    let r = Math.min(255, Math.max(0, (color >> 16) + amount));
    let g = Math.min(255, Math.max(0, ((color >> 8) & 0x00FF) + amount));
    let b = Math.min(255, Math.max(0, (color & 0x0000FF) + amount));
    return `#${(b | (g << 8) | (r << 16)).toString(16).padStart(6, '0')}`;
};

export function applyTheme(theme: Theme, accentColor: string) {
    const root = document.documentElement;
    if (theme === 'system') {
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.classList.toggle('dark', prefersDark);
    } else {
        root.classList.toggle('dark', theme === 'dark');
    }

    if (!/^#[0-9a-f]{6}$/i.test(accentColor)) return;
    const r = parseInt(accentColor.slice(1, 3), 16);
    const g = parseInt(accentColor.slice(3, 5), 16);
    const b = parseInt(accentColor.slice(5, 7), 16);

    root.style.setProperty('--color-primary', accentColor);
    root.style.setProperty('--color-primary-hover', adjustColor(accentColor, -20));
    root.style.setProperty('--color-primary-rgb', `${r}, ${g}, ${b}`);
}

export function getContrastingTextColor(hex: string | undefined): string {
    if (!hex) return '#ffffff';
    try {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      return luminance > 0.5 ? '#000000' : '#ffffff';
    } catch (e) {
      return '#ffffff';
    }
}