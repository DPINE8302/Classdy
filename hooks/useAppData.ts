
import { useMemo, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { Settings, Schedule, AttendanceLog, Holiday, SubjectMeta, Task, DayOfWeek } from '../types';
import { DEFAULT_SETTINGS, INITIAL_SCHEDULES, INITIAL_LOGS, INITIAL_SUBJECT_META } from '../constants';
import { THAI_HOLIDAYS_2025 } from '../holidays';
import { parseISO } from 'date-fns';
import { getScheduleForDate } from '../lib/utils';

export function useAppData() {
  const [settings, setSettings] = useLocalStorage<Settings>('classdy-settings', DEFAULT_SETTINGS);
  const [schedules, setSchedules] = useLocalStorage<Schedule[]>('classdy-schedules', INITIAL_SCHEDULES);
  const [logs, setLogs] = useLocalStorage<AttendanceLog[]>('classdy-logs', INITIAL_LOGS);
  const [subjectMeta, setSubjectMeta] = useLocalStorage<SubjectMeta>('classdy-subject-meta', INITIAL_SUBJECT_META);
  
  const holidays = useMemo(() => THAI_HOLIDAYS_2025, []);

  const activeSchedule = useMemo(() => {
    // This schedule is for the "current" context (today or the latest log date),
    // used for UI elements like "Today's Schedule".
    let referenceDate: Date;
    if (logs && logs.length > 0) {
      try {
        // The logs are pre-sorted, so logs[0] is the latest.
        referenceDate = parseISO(logs[0].date);
      } catch {
        // Fallback in case of invalid date format in logs.
        referenceDate = new Date();
      }
    } else {
      referenceDate = new Date();
    }
    
    const scheduleForDate = getScheduleForDate(referenceDate, schedules);
    
    // Fallback to the first schedule if no date-based one is active
    return scheduleForDate || schedules[0] || null;
  }, [schedules, logs]);

  const updateSettings = useCallback((newSettings: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, [setSettings]);

  const saveSchedule = useCallback((scheduleToSave: Schedule) => {
    setSchedules(prev => {
      const index = prev.findIndex(s => s.id === scheduleToSave.id);
      if (index > -1) {
        const newSchedules = [...prev];
        newSchedules[index] = scheduleToSave;
        return newSchedules;
      }
      return [...prev, scheduleToSave];
    });
  }, [setSchedules]);
  
  const replaceAllSchedules = useCallback((newSchedules: Schedule[]) => {
      setSchedules(newSchedules);
  }, [setSchedules]);

  const deleteSchedule = useCallback((scheduleId: string) => {
    setSchedules(prev => prev.filter(s => s.id !== scheduleId));
  }, [setSchedules]);

  const addOrUpdateLog = useCallback((logToAdd: Omit<AttendanceLog, 'id'>) => {
    const logId = logToAdd.date;
    const newLog = { ...logToAdd, id: logId };
    
    setLogs(prev => {
      const index = prev.findIndex(l => l.id === logId);
      if (index > -1) {
        const newLogs = [...prev];
        newLogs[index] = newLog;
        return newLogs.sort((a, b) => b.date.localeCompare(a.date));
      }
      return [...prev, newLog].sort((a, b) => b.date.localeCompare(a.date));
    });
  }, [setLogs]);
  
  const replaceAllLogs = useCallback((newLogs: AttendanceLog[]) => {
      // Create a copy before sorting to avoid mutating a constant array, which throws an error in strict mode.
      setLogs([...newLogs].sort((a, b) => b.date.localeCompare(a.date)));
  }, [setLogs]);

  const deleteLog = useCallback((logId: string) => {
    setLogs(prev => prev.filter(l => l.id !== logId));
  }, [setLogs]);

  const replaceAllSubjectMeta = useCallback((newMeta: SubjectMeta) => {
    setSubjectMeta(newMeta);
  }, [setSubjectMeta]);

  const updateClassTasks = useCallback((scheduleId: string, dayOfWeek: DayOfWeek, classId: string, newTasks: Task[]) => {
      setSchedules(prevSchedules => {
          return prevSchedules.map(schedule => {
              if (schedule.id !== scheduleId) return schedule;

              const newRules = schedule.rules.map(rule => {
                  if (rule.dayOfWeek !== dayOfWeek) return rule;

                  const newClasses = rule.classes.map(c => {
                      if (c.id !== classId) return c;
                      return { ...c, tasks: newTasks };
                  });
                  return { ...rule, classes: newClasses };
              });
              return { ...schedule, rules: newRules };
          });
      });
  }, [setSchedules]);
  
  return {
    settings,
    schedules,
    activeSchedule,
    logs,
    holidays,
    subjectMeta,
    updateSettings,
    saveSchedule,
    deleteSchedule,
    addOrUpdateLog,
    deleteLog,
    replaceAllLogs,
    replaceAllSchedules,
    replaceAllSubjectMeta,
    updateClassTasks,
  };
}