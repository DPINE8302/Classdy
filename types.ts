export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // Sunday - Saturday
export type Theme = 'light' | 'dark' | 'system';

export interface Task {
  id: string;
  text: string;
  completed: boolean;
}

export interface ClassSession {
  id: string;
  subject: string;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  tasks: Task[];
  isOnline?: boolean;
}

export interface ScheduleRule {
  dayOfWeek: DayOfWeek;
  classes: ClassSession[];
}

export interface Schedule {
  id:string;
  name: string;
  rules: ScheduleRule[];
  startDate?: string; // YYYY-MM-DD format
  endDate?: string; // YYYY-MM-DD format
}

export interface Settings {
  gracePeriod: number; // in minutes
  theme: Theme;
  accentColor: string;
  notificationsEnabled: boolean;
  assistantName?: string;
}

export interface Holiday {
  date: string; // YYYY-MM-DD
  name: string;
}

export interface AttendanceLog {
  id: string; // YYYY-MM-DD
  date: string; // YYYY-MM-DD
  arrivalTime: string | null; // HH:mm
  departureTime: string | null; // HH:mm
  statusTag?: 'Absent' | 'Holiday';
}

export type AttendanceStatus = 'ON_TIME' | 'LATE' | 'EARLY' | 'DAY_OFF' | 'ABSENT' | 'HOLIDAY' | 'NO_ENTRY' | 'NO_SCHEDULE';

export type SubjectMeta = Record<string, {
    color: string;
    icon?: string;
}>;

// --- Chat Types ---

export interface InteractiveSchedulePayload {
  dayName: string;
  classes: ClassSession[];
}

export interface InteractiveTask {
    day: string;
    subject: string;
    text: string;
    completed: boolean;
}

export interface InteractiveTasksPayload {
    title: string;
    tasks: InteractiveTask[];
}

export type ChatResponse =
    | { type: 'text'; payload: string }
    | { type: 'schedule'; payload: InteractiveSchedulePayload }
    | { type: 'tasks'; payload: InteractiveTasksPayload };
