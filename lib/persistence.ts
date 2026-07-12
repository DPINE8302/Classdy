import type { AttendanceLog, Schedule, Settings, SubjectMeta } from '../types';

export const DATA_VERSION = 2;
export interface ClassdyBackup { version: number; exportedAt: string; settings: Settings; schedules: Schedule[]; logs: AttendanceLog[]; subjectMeta: SubjectMeta }
const object = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const date = (value: unknown): value is string => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
const time = (value: unknown): value is string => typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);

export const validateSchedule = (value: unknown): value is Schedule => object(value) && typeof value.id === 'string' && typeof value.name === 'string' && Array.isArray(value.rules) && value.rules.every((rule) => object(rule) && Number.isInteger(rule.dayOfWeek) && Array.isArray(rule.classes) && rule.classes.every((item) => object(item) && typeof item.id === 'string' && typeof item.subject === 'string' && time(item.startTime) && time(item.endTime) && item.endTime > item.startTime && Array.isArray(item.tasks)));
export const parseBackup = (value: unknown): ClassdyBackup => {
  if (!object(value) || !Array.isArray(value.schedules) || !value.schedules.every(validateSchedule) || !Array.isArray(value.logs) || !object(value.settings) || !object(value.subjectMeta)) throw new Error('Invalid Classdy backup');
  const logs = value.logs.filter((log): log is unknown & AttendanceLog => object(log) && date(log.date) && (log.arrivalTime === null || time(log.arrivalTime)) && (log.departureTime === null || time(log.departureTime)));
  if (logs.length !== value.logs.length) throw new Error('Invalid attendance log');
  return { version: DATA_VERSION, exportedAt: typeof value.exportedAt === 'string' ? value.exportedAt : new Date().toISOString(), settings: value.settings as unknown as Settings, schedules: value.schedules, logs, subjectMeta: value.subjectMeta as SubjectMeta };
};
export const safeStoredValue = <T>(raw: string | null, fallback: T, validate: (value: unknown) => value is T): T => { if (!raw) return fallback; try { const parsed: unknown = JSON.parse(raw); return validate(parsed) ? parsed : fallback; } catch { return fallback; } };
