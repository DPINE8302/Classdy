

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

export const SAMPLE_SCHEDULES: Schedule[] = [
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

export const M5_SEMESTER_1_2569: Schedule = {
  id: 'm5-semester-1-2569',
  name: 'M.5 Semester 1 — AY 2569 (IM)',
  startDate: '2026-06-08',
  endDate: '2026-10-06',
  rules: [
    { dayOfWeek: 1, classes: [] },
    { dayOfWeek: 2, classes: [
      { id: 'm5-tue-art', subject: 'ศิลปะ 9 / Art 9', code: 'ศ32101', startTime: '08:15', endTime: '09:45', teacher: 'อ.ชญานิศ', room: 'Flipped Classroom', notes: 'Flipped Classroom', isOnline: true, tasks: [] },
      { id: 'm5-tue-science', subject: 'วิทยาศาสตร์กายภาพ 2 / Physical Science 2', code: 'ว32103', startTime: '09:50', endTime: '11:20', teacher: 'อ.โยธิชา', room: '558', tasks: [] },
      { id: 'm5-tue-sculpting', subject: 'การปั้นโมเดล 3 มิติ / 3D Model Sculpting', code: 'ว32297', startTime: '12:55', endTime: '15:15', teacher: 'อ.คัทลียา', room: '1903', notes: 'Five-minute break from 14:25–14:30', tasks: [] },
      { id: 'm5-tue-guidance', subject: 'แนะแนว / Guidance', code: 'กน9', startTime: '15:15', endTime: '16:00', teacher: 'อ.กัญญาพัชร', room: '1903', tasks: [] },
    ] },
    { dayOfWeek: 3, classes: [
      { id: 'm5-wed-game', subject: 'การออกแบบและพัฒนาเกม / Game Design and Development', code: 'ว32274', startTime: '08:15', endTime: '09:45', teacher: 'ผศ.สุคนธ์, อ.คัทลียา', room: '1901', tasks: [] },
      { id: 'm5-wed-math', subject: 'คณิตศาสตร์ 9 / Mathematics 9', code: 'ค32101', startTime: '09:50', endTime: '11:20', teacher: 'อ.มลิธชา', room: '1810', tasks: [] },
      { id: 'm5-wed-listening', subject: 'อังกฤษฟัง-พูดเพื่อสื่อสาร 3 / English Listening–Speaking 3', code: 'อ32221', startTime: '12:55', endTime: '14:25', teacher: 'อ.Diana, อ.พาขวัญ', room: '525', tasks: [] },
      { id: 'm5-wed-industry', subject: 'การงานอาชีพ (อุตสาหกรรม) / Industrial Occupations', code: 'ง32101', startTime: '14:30', endTime: '16:00', teacher: 'อ.วัชชมา', room: 'Flipped Classroom', notes: 'Flipped Classroom', isOnline: true, tasks: [] },
    ] },
    { dayOfWeek: 4, classes: [
      { id: 'm5-thu-thai', subject: 'ภาษาไทย 9 / Thai 9', code: 'ท32101', startTime: '08:15', endTime: '09:45', teacher: 'อ.ดร.สุวิมล', room: '1209', tasks: [] },
      { id: 'm5-thu-game', subject: 'การออกแบบและพัฒนาเกม / Game Design and Development', code: 'ว32274', startTime: '09:50', endTime: '11:20', teacher: 'ผศ.สุคนธ์, อ.คัทลียา', room: '1901', tasks: [] },
      { id: 'm5-thu-programming', subject: 'การเขียนโปรแกรมคอมพิวเตอร์ 1 / Computer Programming 1', code: 'ว30254', startTime: '12:55', endTime: '14:25', teacher: 'อ.ธนภูมิ', room: '1901', tasks: [] },
      { id: 'm5-thu-addmath', subject: 'คณิตศาสตร์เพิ่มเติม (3) / Additional Mathematics 3', code: 'ค32214', startTime: '14:30', endTime: '16:00', teacher: 'อ.มลิธชา', room: '1712', tasks: [] },
    ] },
    { dayOfWeek: 5, classes: [
      { id: 'm5-fri-addmath', subject: 'คณิตศาสตร์เพิ่มเติม (3) / Additional Mathematics 3', code: 'ค32214', startTime: '08:15', endTime: '09:45', teacher: 'อ.มลิธชา', room: '555', tasks: [] },
      { id: 'm5-fri-english', subject: 'ภาษาอังกฤษ 9 / English 9', code: 'อ32101', startTime: '09:50', endTime: '11:20', teacher: 'อ.ดลพร', room: '555', tasks: [] },
      { id: 'm5-fri-social', subject: 'สังคมศึกษา ศาสนาและวัฒนธรรม 9 / Social Studies 9', code: 'ส32101', startTime: '12:55', endTime: '14:25', teacher: 'อ.กิ่งกาญจน์', room: '555', tasks: [] },
      { id: 'm5-fri-pe', subject: 'พลศึกษา 9 / Physical Education 9', code: 'พ32103', startTime: '14:30', endTime: '15:15', teacher: 'อ.คัทลียา', room: 'Self-study / assigned work', notes: 'Self-study or assigned work', tasks: [] },
      { id: 'm5-fri-health', subject: 'สุขศึกษา 9 / Health Education 9', code: 'พ32101', startTime: '15:15', endTime: '16:00', teacher: 'อ.คัทลียา', room: 'Self-study / assigned work', notes: 'Self-study or assigned work', tasks: [] },
    ] },
    { dayOfWeek: 6, classes: [] },
    { dayOfWeek: 0, classes: [] },
  ],
};

// The supplied current timetable is the first-run default; existing local data remains untouched.
export const INITIAL_SCHEDULES: Schedule[] = [M5_SEMESTER_1_2569];

export const DEFAULT_SETTINGS: Settings = {
  gracePeriod: 5,
  theme: 'system',
  accentColor: '#007AFF', // Apple Blue
  notificationsEnabled: false,
  assistantName: 'Bros',
};

export const INITIAL_SUBJECT_META: SubjectMeta = {
    'ศิลปะ 9 / Art 9': { color: '#8B5CF6', icon: '🎨' },
    'วิทยาศาสตร์กายภาพ 2 / Physical Science 2': { color: '#0EA5E9', icon: '🔬' },
    'การปั้นโมเดล 3 มิติ / 3D Model Sculpting': { color: '#F97316', icon: '🗿' },
    'แนะแนว / Guidance': { color: '#64748B', icon: '🧭' },
    'การออกแบบและพัฒนาเกม / Game Design and Development': { color: '#EC4899', icon: '🎮' },
    'คณิตศาสตร์ 9 / Mathematics 9': { color: '#2563EB', icon: '🧮' },
    'อังกฤษฟัง-พูดเพื่อสื่อสาร 3 / English Listening–Speaking 3': { color: '#14B8A6', icon: '🗣️' },
    'การงานอาชีพ (อุตสาหกรรม) / Industrial Occupations': { color: '#8B5CF6', icon: '🛠️' },
    'ภาษาไทย 9 / Thai 9': { color: '#E11D48', icon: '🇹🇭' },
    'การเขียนโปรแกรมคอมพิวเตอร์ 1 / Computer Programming 1': { color: '#6366F1', icon: '💻' },
    'คณิตศาสตร์เพิ่มเติม (3) / Additional Mathematics 3': { color: '#1D4ED8', icon: '📈' },
    'ภาษาอังกฤษ 9 / English 9': { color: '#0891B2', icon: '🇬🇧' },
    'สังคมศึกษา ศาสนาและวัฒนธรรม 9 / Social Studies 9': { color: '#D97706', icon: '🌏' },
    'พลศึกษา 9 / Physical Education 9': { color: '#22C55E', icon: '🏃' },
    'สุขศึกษา 9 / Health Education 9': { color: '#22C55E', icon: '💚' },
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


export const SAMPLE_LOGS: AttendanceLog[] = [
  { id: '2025-07-09', date: '2025-07-09', arrivalTime: '07:58', departureTime: null },
  { id: '2025-07-08', date: '2025-07-08', arrivalTime: '07:44', departureTime: null },
  { id: '2025-07-04', date: '2025-07-04', arrivalTime: '07:39', departureTime: null },
  { id: '2025-07-03', date: '2025-07-03', arrivalTime: '09:17', departureTime: null },
  { id: '2025-07-02', date: '2025-07-02', arrivalTime: '08:31', departureTime: null },
  { id: '2025-07-01', date: '2025-07-01', arrivalTime: '07:31', departureTime: null },
  { id: '2025-06-27', date: '2025-06-27', arrivalTime: '07:14', departureTime: null },
  { id: '2025-06-26', date: '2025-06-26', arrivalTime: '09:02', departureTime: null },
  { id: '2025-06-25', date: '2025-06-25', arrivalTime: '07:45', departureTime: null },
  { id: '2025-06-24', date: '2025-06-24', arrivalTime: '07:32', departureTime: null },
  { id: '2025-06-20', date: '2025-06-20', arrivalTime: '07:36', departureTime: null },
  { id: '2025-06-19', date: '2025-06-19', arrivalTime: '09:14', departureTime: null },
  { id: '2025-06-18', date: '2025-06-18', arrivalTime: '09:18', departureTime: null },
  { id: '2025-06-17', date: '2025-06-17', arrivalTime: '07:17', departureTime: null },
  { id: '2025-06-13', date: '2025-06-13', arrivalTime: '07:16', departureTime: null },
  { id: '2025-06-12', date: '2025-06-12', arrivalTime: '07:46', departureTime: null },
  { id: '2025-06-11', date: '2025-06-11', arrivalTime: '08:17', departureTime: null },
  { id: '2025-06-10', date: '2025-06-10', arrivalTime: '07:13', departureTime: null },
  { id: '2025-06-09', date: '2025-06-09', arrivalTime: '11:16', departureTime: null },
  { id: '2025-05-02', date: '2025-05-02', arrivalTime: '07:09', departureTime: null },
  { id: '2025-05-01', date: '2025-05-01', arrivalTime: '07:14', departureTime: null },
  { id: '2025-04-30', date: '2025-04-30', arrivalTime: '07:14', departureTime: null },
  { id: '2025-04-29', date: '2025-04-29', arrivalTime: '06:55', departureTime: null },
  { id: '2025-04-28', date: '2025-04-28', arrivalTime: '07:13', departureTime: null },
  { id: '2025-04-25', date: '2025-04-25', arrivalTime: '07:16', departureTime: null },
  { id: '2025-04-24', date: '2025-04-24', arrivalTime: '07:10', departureTime: null },
  { id: '2025-04-23', date: '2025-04-23', arrivalTime: '06:55', departureTime: null },
  { id: '2025-04-22', date: '2025-04-22', arrivalTime: '07:15', departureTime: null },
  { id: '2025-04-21', date: '2025-04-21', arrivalTime: '07:35', departureTime: null },
  { id: '2025-04-11', date: '2025-04-11', arrivalTime: '07:06', departureTime: null },
  { id: '2025-04-10', date: '2025-04-10', arrivalTime: '07:11', departureTime: null },
  { id: '2025-04-09', date: '2025-04-09', arrivalTime: '07:11', departureTime: null },
  { id: '2025-04-08', date: '2025-04-08', arrivalTime: '07:12', departureTime: null },
  { id: '2025-04-04', date: '2025-04-04', arrivalTime: '07:25', departureTime: null },
  { id: '2025-04-03', date: '2025-04-03', arrivalTime: '07:17', departureTime: null },
  { id: '2025-04-02', date: '2025-04-02', arrivalTime: '07:40', departureTime: null },
].sort((a, b) => b.date.localeCompare(a.date));

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
