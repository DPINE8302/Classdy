

import type { DayOfWeek, Schedule, Settings, AttendanceLog, SubjectMeta } from './types';

export const DAYS_OF_WEEK: { value: DayOfWeek; label: string }[] = [
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
  { value: 0, label: 'Sunday' },
];

const scheduleYear = 2025;

export const INITIAL_SCHEDULES: Schedule[] = [
  {
    id: `semester-1-${scheduleYear}`,
    name: 'Semester 1',
    startDate: `${scheduleYear}-06-09`,
    endDate: `${scheduleYear}-10-10`,
    rules: [
      { dayOfWeek: 1, classes: [
          // This class is Flipped, so no physical attendance is required.
          { id: 'sem1-mon-1', subject: 'ประวัติศาสตร์(7)', startTime: '08:15', endTime: '09:45', tasks: [], isOnline: true },
          // "กิจกรรมพัฒนาผู้เรียน" is removed as it's an optional, off-site activity not requiring on-campus presence.
      ]},
      { dayOfWeek: 2, classes: [
          // Required arrival: 07:45
          { id: 'sem1-tue-1', subject: 'Homeroom', startTime: '07:45', endTime: '08:15', tasks: [] },
          { id: 'sem1-tue-2', subject: 'สุขศึกษา7', startTime: '08:15', endTime: '09:00', tasks: [] },
          { id: 'sem1-tue-3', subject: 'พลศึกษา7', startTime: '09:00', endTime: '09:45', tasks: [] },
          { id: 'sem1-tue-4', subject: 'การออกแบบสื่อมัลติมีเดีย', startTime: '09:50', endTime: '11:20', tasks: [] },
          { id: 'sem1-tue-5', subject: 'อังกฤษฟัง-พูดเพื่อสื่อสาร 1', startTime: '12:55', endTime: '14:25', tasks: [] },
          { id: 'sem1-tue-6', subject: 'ภาษาอังกฤษ 7', startTime: '14:30', endTime: '16:00', tasks: [] },
      ]},
      { dayOfWeek: 3, classes: [
          // Required arrival: 09:30
          { id: 'sem1-wed-1', subject: 'การงานอาชีพ(4) (คอมพิวเตอร์)', startTime: '08:15', endTime: '09:25', tasks: [], isOnline: true },
          { id: 'sem1-wed-2', subject: 'คณิตศาสตร์ 7', startTime: '09:30', endTime: '11:20', tasks: [] },
          { id: 'sem1-wed-3', subject: 'วิทยาศาสตร์กายภาพ 1', startTime: '12:55', endTime: '14:25', tasks: [] },
          { id: 'sem1-wed-4', subject: 'การออกแบบกราฟิกคอมพิวเตอร์ 1', startTime: '14:30', endTime: '16:00', tasks: [] },
      ]},
      { dayOfWeek: 4, classes: [
          // Required arrival: 09:30
          { id: 'sem1-thu-1', subject: 'ศิลปะ 7 (ดนตรี)', startTime: '08:15', endTime: '09:25', tasks: [], isOnline: true },
          { id: 'sem1-thu-2', subject: 'คณิตศาสตร์เพิ่มเติม(1)', startTime: '09:30', endTime: '11:20', tasks: [] },
          { id: 'sem1-thu-3', subject: 'กิจกรรมพัฒนาความคิดและจิตใจ', startTime: '12:55', endTime: '13:40', tasks: [] },
          { id: 'sem1-thu-4', subject: 'พื้นฐานการเขียนโปรแกรมคอมพิวเตอร์', startTime: '13:40', endTime: '16:00', tasks: [] },
      ]},
      { dayOfWeek: 5, classes: [
          // Required arrival: 07:45
          { id: 'sem1-fri-0', subject: 'Homeroom', startTime: '07:45', endTime: '08:15', tasks: [] },
          { id: 'sem1-fri-1', subject: 'ภาษาไทย 7', startTime: '08:15', endTime: '09:45', tasks: [] },
          { id: 'sem1-fri-2', subject: 'สังคมศึกษา ศาสนาและวัฒนธรรม 7', startTime: '09:50', endTime: '11:20', tasks: [] },
          { id: 'sem1-fri-3', subject: 'การออกแบบกราฟิกคอมพิวเตอร์ 1', startTime: '12:55', endTime: '14:25', tasks: [] },
          { id: 'sem1-fri-4', subject: 'คณิตศาสตร์เพิ่มเติม(1)', startTime: '14:30', endTime: '16:00', tasks: [] },
      ]},
      { dayOfWeek: 6, classes: [] },
      { dayOfWeek: 0, classes: [] },
    ]
  },
  {
    id: `semester-2-${scheduleYear}`,
    name: 'Semester 2',
    startDate: `2025-10-14`,
    endDate: `2026-03-03`,
    rules: [
      { dayOfWeek: 1, classes: [
          { id: 's2-mon-1', subject: 'ประวัติศาสตร์(7)', startTime: '08:15', endTime: '09:45', tasks: [] },
          { id: 's2-mon-2', subject: 'กิจกรรมพัฒนาผู้เรียน', startTime: '09:50', endTime: '16:00', tasks: [] },
      ]},
      { dayOfWeek: 2, classes: [
          { id: 's2-tue-1', subject: 'Homeroom', startTime: '07:45', endTime: '08:15', tasks: [] },
          { id: 's2-tue-2', subject: 'สุขศึกษา7', startTime: '08:15', endTime: '09:00', tasks: [] },
          { id: 's2-tue-3', subject: 'พลศึกษา7', startTime: '09:00', endTime: '09:45', tasks: [] },
          { id: 's2-tue-4', subject: 'การออกแบบสื่อมัลติมีเดีย', startTime: '09:50', endTime: '11:20', tasks: [] },
      ]},
      { dayOfWeek: 3, classes: [
          { id: 's2-wed-1', subject: 'การงานอาชีพ(4) (คอมพิวเตอร์)', startTime: '08:15', endTime: '09:45', tasks: [] },
          { id: 's2-wed-2', subject: 'คณิตศาสตร์ 7', startTime: '09:50', endTime: '11:20', tasks: [] },
          { id: 's2-wed-3', subject: 'วิทยาศาสตร์กายภาพ 1', startTime: '12:55', endTime: '14:25', tasks: [] },
      ]},
      { dayOfWeek: 4, classes: [
          { id: 's2-thu-1', subject: 'ศิลปะ 7 (ดนตรี)', startTime: '08:15', endTime: '09:45', tasks: [] },
          { id: 's2-thu-2', subject: 'คณิตศาสตร์เพิ่มเติม(1)', startTime: '09:50', endTime: '11:20', tasks: [] },
          { id: 's2-thu-3', subject: 'พื้นฐานการเขียนโปรแกรมคอมพิวเตอร์', startTime: '13:40', endTime: '16:00', tasks: [] },
      ]},
      { dayOfWeek: 5, classes: [
          { id: 's2-fri-1', subject: 'ภาษาไทย 7', startTime: '08:15', endTime: '09:45', tasks: [] },
          { id: 's2-fri-2', subject: 'สังคมศึกษา ศาสนาและวัฒนธรรม 7', startTime: '09:50', endTime: '11:20', tasks: [] },
          { id: 's2-fri-3', subject: 'อังกฤษฟัง-พูดเพื่อสื่อสาร 1', startTime: '12:55', endTime: '14:25', tasks: [] },
      ]},
      { dayOfWeek: 6, classes: [] },
      { dayOfWeek: 0, classes: [] },
    ]
  },
  {
    id: `summer-break-${scheduleYear}`,
    name: 'Summer Break',
    startDate: `${scheduleYear}-04-02`, 
    endDate: `${scheduleYear}-05-02`,
    rules: [
        { dayOfWeek: 1, classes: [{ id: 'sum-mon', subject: 'Summer Session', startTime: '07:45', endTime: '15:00', tasks: [] }] },
        { dayOfWeek: 2, classes: [{ id: 'sum-tue', subject: 'Summer Session', startTime: '07:45', endTime: '15:00', tasks: [] }] },
        { dayOfWeek: 3, classes: [{ id: 'sum-wed', subject: 'Summer Session', startTime: '07:45', endTime: '15:00', tasks: [] }] },
        { dayOfWeek: 4, classes: [{ id: 'sum-thu', subject: 'Summer Session', startTime: '07:45', endTime: '15:00', tasks: [] }] },
        { dayOfWeek: 5, classes: [{ id: 'sum-fri', subject: 'Summer Session', startTime: '07:45', endTime: '15:00', tasks: [] }] },
        { dayOfWeek: 6, classes: [] },
        { dayOfWeek: 0, classes: [] },
    ]
  },
];

export const DEFAULT_SETTINGS: Settings = {
  gracePeriod: 5,
  theme: 'system',
  accentColor: '#007AFF', // Apple Blue
  notificationsEnabled: false,
  assistantName: 'Bros',
};

export const INITIAL_SUBJECT_META: SubjectMeta = {
    // General
    'Homeroom': { color: '#778899', icon: '🏠' },
    'Summer Session': { color: '#FF9500', icon: '☀️' },
    'กิจกรรมพัฒนาผู้เรียน': { color: '#829494', icon: '🌱' }, // Student Dev
    'กิจกรรมพัฒนาความคิดและจิตใจ': { color: '#c9b19e', icon: '🧠' }, // Thought and Mind Dev

    // --- Thai Language Subjects ---
    'ภาษาไทย 7': { color: '#D2B48C', icon: '🇹🇭' },

    // --- English Language Subjects ---
    'อังกฤษฟัง-พูดเพื่อสื่อสาร 1': { color: '#BC8F8F', icon: '🗣️' },
    'ภาษาอังกฤษ 7': { color: '#C7A27E', icon: '🇬🇧' },
    
    // --- Math Subjects ---
    'คณิตศาสตร์ 7': { color: '#6e8eac', icon: '🧮' },
    'คณิตศาสตร์เพิ่มเติม(1)': { color: '#6e8eac', icon: '📈' },

    // --- Science Subjects ---
    'วิทยาศาสตร์กายภาพ 1': { color: '#456882', icon: '🔬' },
    
    // --- Social Studies / History ---
    'ประวัติศาสตร์(7)': { color: '#D2B48C', icon: '📜' },
    'สังคมศึกษา ศาสนาและวัฒนธรรม 7': { color: '#C7A27E', icon: '🌍' },

    // --- Arts & Music ---
    'ศิลปะ 7 (ดนตรี)': { color: '#d2c1b6', icon: '🎵' },
    
    // --- Health & PE ---
    'สุขศึกษา7': { color: '#e0c1b6', icon: '❤️' },
    'พลศึกษา7': { color: '#a9c0a6', icon: '🏀' },
    
    // --- Technology & Computer ---
    'การงานอาชีพ(4) (คอมพิวเตอร์)': { color: '#9E7E76', icon: '💼' },
    'การออกแบบสื่อมัลติมีเดีย': { color: '#c9b19e', icon: '🎨' },
    'การออกแบบกราฟิกคอมพิวเตอร์ 1': { color: '#b6d2d6', icon: '🖌️' }, // New color
    'พื้นฐานการเขียนโปรแกรมคอมพิวเตอร์': { color: '#9E7E76', icon: '💡' },

    // --- Fallback English names for other schedules ---
    'History': { color: '#D2B48C', icon: '📜' },
    'Student Development': { color: '#829494', icon: '🌱' },
    'Health': { color: '#e0c1b6', icon: '❤️' },
    'Physical Education': { color: '#a9c0a6', icon: '🏀' },
    'Multimedia Design': { color: '#c9b19e', icon: '🎨' },
    'English Communication': { color: '#BC8F8F', icon: '🗣️' },
    'English': { color: '#C7A27E', icon: '🇬🇧' },
    'Computer Science': { color: '#9E7E76', icon: '💻' },
    'Mathematics': { color: '#6e8eac', icon: '🧮' },
    'Physical Science': { color: '#456882', icon: '🔬' },
    'Music': { color: '#d2c1b6', icon: '🎵' },
    'Advanced Mathematics': { color: '#6e8eac', icon: '📈' },
    'Programming': { color: '#9E7E76', 'icon': '💡' },
    'Thai Language': { color: '#D2B48C', icon: '🇹🇭' },
    'Social Studies': { color: '#C7A27E', icon: '🌍' },
};


export const INITIAL_LOGS: AttendanceLog[] = [];

export const PALETTE = ["#778899", "#D2B48C", "#BC8F8F", "#829494", "#C7A27E", "#9E7E76", "#6e8eac", "#e0c1b6", "#a9c0a6", "#c9b19e", "#456882", "#d2c1b6"];

export const ACCENT_COLORS = [
    '#007AFF', // Blue
    '#34C759', // Green
    '#FF9500', // Orange
    '#FF3B30', // Red
    '#AF52DE', // Purple
    '#5856D6', // Indigo
    '#FF2D55', // Pink
    '#0A84FF', // Teal
];