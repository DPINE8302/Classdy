import type { AttendanceLog, AttendanceStatus, ClassSession, Holiday, Schedule, Task } from '../types';

export const localDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const parseLocalDate = (value: string): Date => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) throw new Error('Invalid local date');
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  if (localDateKey(date) !== value) throw new Error('Invalid local date');
  return date;
};

export const selectSchedule = (schedules: Schedule[], dateKey: string): Schedule | null => {
  const matches = schedules.filter((schedule) => (!schedule.startDate || schedule.startDate <= dateKey) && (!schedule.endDate || schedule.endDate >= dateKey));
  return matches.sort((a, b) => (b.startDate ?? '').localeCompare(a.startDate ?? '') || a.name.localeCompare(b.name))[0] ?? null;
};

export const overlaps = (classes: ClassSession[]): [string, string][] => {
  const sorted = [...classes].sort((a, b) => a.startTime.localeCompare(b.startTime));
  const result: [string, string][] = [];
  for (let i = 1; i < sorted.length; i += 1) if (sorted[i].startTime < sorted[i - 1].endTime) result.push([sorted[i - 1].id, sorted[i].id]);
  return result;
};

export const attendanceStatus = (log: AttendanceLog | undefined, firstClass: ClassSession | undefined, grace: number, holiday: Holiday | undefined): AttendanceStatus => {
  if (holiday || log?.statusTag === 'Holiday') return 'HOLIDAY';
  if (!firstClass) return 'DAY_OFF';
  if (log?.manualStatus) return log.manualStatus;
  if (log?.statusTag === 'Absent') return 'ABSENT';
  if (!log?.arrivalTime) return 'NO_ENTRY';
  const toMinutes = (time: string) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3));
  const delta = toMinutes(log.arrivalTime) - toMinutes(firstClass.startTime);
  if (delta < 0) return 'EARLY';
  return delta <= Math.max(0, grace) ? 'ON_TIME' : 'LATE';
};

export const isTaskOverdue = (task: Task, today = localDateKey(new Date())): boolean => !task.completed && Boolean(task.dueDate && task.dueDate < today);

export const duplicateSchedule = (schedule: Schedule, id: string): Schedule => ({ ...structuredClone(schedule), id, name: `${schedule.name} copy`, rules: schedule.rules.map((rule) => ({ ...rule, classes: rule.classes.map((item) => ({ ...item, id: `${id}-${item.id}`, tasks: item.tasks.map((task) => ({ ...task, id: `${id}-${task.id}` })) })) })) });
