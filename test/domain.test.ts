import { describe, expect, it } from 'vitest';
import { attendanceStatus, duplicateSchedule, isTaskOverdue, localDateKey, overlaps, parseLocalDate, selectSchedule } from '../lib/domain';
import type { ClassSession, Schedule } from '../types';

const cls = (id: string, startTime: string, endTime: string): ClassSession => ({ id, subject: id, startTime, endTime, tasks: [] });
const schedule = (id: string, startDate: string, endDate: string): Schedule => ({ id, name: id, startDate, endDate, rules: [{ dayOfWeek: 1, classes: [cls('math', '08:00', '09:00')] }] });

describe('academic domain', () => {
  it('selects the most recently started schedule covering a date', () => expect(selectSchedule([schedule('old', '2026-01-01', '2026-12-31'), schedule('term', '2026-06-01', '2026-09-30')], '2026-07-01')?.id).toBe('term'));
  it('preserves a local Bangkok calendar date without UTC conversion', () => { const value = parseLocalDate('2026-07-12'); expect(localDateKey(value)).toBe('2026-07-12'); expect(value.getHours()).toBe(0); });
  it('detects overlapping classes but permits touching boundaries', () => expect(overlaps([cls('a', '08:00', '09:00'), cls('b', '08:30', '10:00'), cls('c', '10:00', '11:00')])).toEqual([['a', 'b']]));
  it('applies grace periods and manual/holiday states', () => { const first = cls('a', '08:00', '09:00'); expect(attendanceStatus({ id: 'x', date: '2026-01-01', arrivalTime: '08:05', departureTime: null }, first, 5, undefined)).toBe('ON_TIME'); expect(attendanceStatus({ id: 'x', date: '2026-01-01', arrivalTime: '08:06', departureTime: null }, first, 5, undefined)).toBe('LATE'); expect(attendanceStatus(undefined, first, 0, { date: '2026-01-01', name: 'Holiday' })).toBe('HOLIDAY'); });
  it('duplicates nested schedule data without retaining ids', () => { const copy = duplicateSchedule(schedule('a', '2026-01-01', '2026-12-31'), 'b'); expect(copy.id).toBe('b'); expect(copy.rules[0].classes[0].id).not.toBe('math'); });
  it('calculates incomplete overdue tasks', () => { expect(isTaskOverdue({ id: '1', text: 'Essay', completed: false, dueDate: '2026-01-01' }, '2026-01-02')).toBe(true); expect(isTaskOverdue({ id: '1', text: 'Essay', completed: true, dueDate: '2026-01-01' }, '2026-01-02')).toBe(false); });
});
