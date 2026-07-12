import { describe, expect, it } from 'vitest';
import { parseBackup, safeStoredValue, validateSchedule } from '../lib/persistence';
import { DEFAULT_SETTINGS } from '../constants';
const valid = { id: 'term', name: 'Term', startDate: '2026-01-01', endDate: '2026-12-31', rules: [{ dayOfWeek: 1, classes: [{ id: 'math', subject: 'Math', startTime: '08:00', endTime: '09:00', tasks: [] }] }] };
describe('persistence', () => {
  it('recovers from malformed local data', () => expect(safeStoredValue('{bad', [], (v): v is unknown[] => Array.isArray(v))).toEqual([]));
  it('validates imports and migrates legacy backups', () => expect(parseBackup({ settings: DEFAULT_SETTINGS, schedules: [valid], logs: [], subjectMeta: {} }).version).toBe(2));
  it('rejects invalid class times', () => expect(validateSchedule({ ...valid, rules: [{ dayOfWeek: 1, classes: [{ ...valid.rules[0].classes[0], endTime: '07:00' }] }] })).toBe(false));
});
