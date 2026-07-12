

import type { Schedule, SubjectMeta, ChatResponse } from '../types';
import { getScheduleForDate, formatTime } from './utils';

type Language = 'en' | 'th';

const THAI_REGEX = /[\u0E00-\u0E7F]/;
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

export const translations = {
    en: {
        dayNames: { 'Monday': 'Monday', 'Tuesday': 'Tuesday', 'Wednesday': 'Wednesday', 'Thursday': 'Thursday', 'Friday': 'Friday', 'Saturday': 'Saturday', 'Sunday': 'Sunday' },
        welcomeMessage: "Hi! I'm {{name}}. How can I help you with your schedule today?",
        welcomeTitle: "Chat with {{name}}",
        welcomeSubtitle: "I'm here to help you stay organized. Ask me anything about your schedule or tasks.",
        inputPlaceholder: "Message {{name}}...",
        quickQuestions: [
            { title: "Today's Schedule", prompt: "What is my schedule for today?" },
            { title: "Pending Homework", prompt: "Do I have any unfinished homework?" },
            { title: "Next Class", prompt: "When is my next class?" },
            { title: "Weekly Schedule", prompt: "Show me the full weekly schedule." },
        ],
        quickQuestionsHeader: "Quick Questions",
        scheduleHeader: "Schedule for {{day}}",
        taskHeader: "Here are your tasks:",
        pendingTaskHeader: "Here are your pending tasks:",
        responses: {
            noTasksFound: "No tasks found for {{subject}} on {{day}}.",
            noPendingTasks: "You have no pending tasks for {{subject}} on {{day}}.",
            allTasksDone: "You're all caught up!",
            noClassesOnDay: "You have no classes scheduled for {{day}}. Enjoy your free day! 🎉",
            fullScheduleHeader: "Here's your weekly schedule:",
            noClasses: "No classes!",
            flipped: "(Flipped)",
            cantFindSchedule: "I can't find a schedule for this week.",
            inClassNow: "You are currently in **{{subject}}**, which ends at {{endTime}}.",
            onBreak: "You're on a break. Your next class is **{{subject}}** at {{startTime}}.",
            doneForToday: "You're done for today! No more classes scheduled right now.",
            nextClassIs: "Your next class is **{{subject}}** at {{startTime}}.",
            noMoreClasses: "You have no more classes scheduled for today.",
            classTime: "Yes, you have **{{subject}}** on {{day}} from {{times}}.",
            noClass: "Nope, you do not have **{{subject}}** on {{day}}.",
            defaultFallback: "Sorry, I couldn't understand that. You can ask for a day's schedule (e.g., 'What's on Monday?'), ask about a class (e.g., 'Do I have Math today?'), or ask 'what's next?'.",
            timeContextError: "I can only tell you what's happening 'now' or 'next' for today. For other days, please ask about the schedule in general.",
        }
    },
    th: {
        dayNames: { 'Monday': 'วันจันทร์', 'Tuesday': 'วันอังคาร', 'Wednesday': 'วันพุธ', 'Thursday': 'วันพฤหัสบดี', 'Friday': 'วันศุกร์', 'Saturday': 'วันเสาร์', 'Sunday': 'วันอาทิตย์' },
        welcomeMessage: "สวัสดี! ฉัน {{name}} มีอะไรให้ช่วยเกี่ยวกับตารางเรียนบ้าง?",
        welcomeTitle: "คุยกับ {{name}}",
        welcomeSubtitle: "ให้ฉันช่วยจัดการตารางเรียนและงานต่างๆให้เป็นระเบียบนะ ถามได้ทุกเรื่องเลย",
        inputPlaceholder: "ส่งข้อความถึง {{name}}...",
        quickQuestions: [
            { title: "ตารางเรียนวันนี้", prompt: "วันนี้เรียนอะไรบ้าง" },
            { title: "การบ้านที่ค้าง", prompt: "มีงานอะไรที่ยังไม่เสร็จบ้าง" },
            { title: "คาบต่อไป", prompt: "คาบต่อไปเรียนอะไร" },
            { title: "ตารางเรียนทั้งสัปดาห์", prompt: "ขอดูตารางเรียนทั้งสัปดาห์หน่อย" },
        ],
        quickQuestionsHeader: "คำถามด่วน",
        scheduleHeader: "ตารางเรียนสำหรับ{{day}}",
        taskHeader: "นี่คือรายการงานของเธอ:",
        pendingTaskHeader: "นี่คืองานที่ยังไม่เสร็จ:",
        responses: {
            noTasksFound: "ไม่พบงานสำหรับวิชา {{subject}} ใน{{day}}นะ",
            noPendingTasks: "ไม่มีงานค้างสำหรับวิชา {{subject}} ใน{{day}}",
            allTasksDone: "เยี่ยม! ทำงานเสร็จหมดแล้ว",
            noClassesOnDay: "{{day}}ไม่มีเรียนนะ พักผ่อนได้เลย! 🎉",
            fullScheduleHeader: "นี่คือตารางสอนทั้งสัปดาห์ของเธอ:",
            noClasses: "ไม่มีเรียน!",
            flipped: "(ห้องเรียนกลับด้าน)",
            cantFindSchedule: "หาตารางเรียนของสัปดาห์นี้ไม่เจอ",
            inClassNow: "ตอนนี้กำลังเรียนวิชา **{{subject}}** อยู่ เลิกตอน {{endTime}}",
            onBreak: "ตอนนี้พักอยู่ คาบต่อไปเรียน **{{subject}}** ตอน {{startTime}}",
            doneForToday: "วันนี้เรียนเสร็จแล้ว! ไม่มีคาบเรียนแล้วจ้า",
            nextClassIs: "คาบต่อไปคือ **{{subject}}** ตอน {{startTime}}",
            noMoreClasses: "วันนี้ไม่มีเรียนแล้ว",
            classTime: "ใช่ มีเรียน **{{subject}}** ใน{{day}} ตอน {{times}}",
            noClass: "ไม่มีเรียน **{{subject}}** ใน{{day}}",
            defaultFallback: "ขอโทษนะ ไม่เข้าใจที่ถามเลย ลองถามเกี่ยวกับตารางเรียนดูสิ เช่น 'วันจันทร์เรียนอะไร?', 'มีเรียนคณิตไหม?', หรือ 'คาบต่อไปเรียนอะไร?'",
            timeContextError: "บอกได้แค่ว่า 'ตอนนี้' หรือ 'คาบต่อไป' เรียนอะไรสำหรับวันนี้เท่านั้นนะ ถ้าอยากรู้วันอื่น ให้ถามตารางเรียนโดยรวมมาเลย",
        }
    }
};

const DAY_KEYWORD_MAP: { [key: string]: string } = {
    'monday': 'Monday', 'mon': 'Monday', 'วันจันทร์': 'Monday', 'จันทร์': 'Monday',
    'tuesday': 'Tuesday', 'tue': 'Tuesday', 'tues': 'Tuesday', 'วันอังคาร': 'Tuesday', 'อังคาร': 'Tuesday',
    'wednesday': 'Wednesday', 'wed': 'Wednesday', 'วันพุธ': 'Wednesday', 'พุธ': 'Wednesday',
    'thursday': 'Thursday', 'thu': 'Thursday', 'thurs': 'Thursday', 'วันพฤหัสบดี': 'Thursday', 'พฤหัส': 'Thursday',
    'friday': 'Friday', 'fri': 'Friday', 'วันศุกร์': 'Friday', 'ศุกร์': 'Friday',
    'saturday': 'Saturday', 'sat': 'Saturday', 'วันเสาร์': 'Saturday', 'เสาร์': 'Saturday',
    'sunday': 'Sunday', 'sun': 'Sunday', 'วันอาทิตย์': 'Sunday', 'อาทิตย์': 'Sunday',
    'today': 'today', 'วันนี้': 'today',
    'tomorrow': 'tomorrow', 'พรุ่งนี้': 'tomorrow',
    'yesterday': 'yesterday', 'เมื่อวาน': 'yesterday',
};

const TIME_CONTEXT_MAP: { [key: string]: { start: string, end: string } } = {
    'morning': { start: '00:00', end: '12:00' }, 'ตอนเช้า': { start: '00:00', end: '12:00' },
    'afternoon': { start: '12:00', end: '17:00' }, 'ตอนบ่าย': { start: '12:00', end: '17:00' },
    'evening': { start: '17:00', end: '24:00' }, 'ตอนเย็น': { start: '17:00', end: '24:00' },
};

export const processQuestion = (query: string, schedules: Schedule[], subjectMeta: SubjectMeta, _uiLang: Language): ChatResponse => {
    const lowerQuery = query.toLowerCase().trim().replace(/[?.,]/g, '');
    const isThaiQuery = THAI_REGEX.test(lowerQuery);
    const responseLang = isThaiQuery ? 'th' : _uiLang;
    const t = translations[responseLang];
    
    const now = new Date();
    const todayName = DAYS[now.getDay()];
    const nowTime = now.toTimeString().substring(0, 5);

    const getResponseText = (key: keyof typeof t.responses, replacements: Record<string, string> = {}): ChatResponse => {
        let text = t.responses[key] || translations.en.responses[key as keyof typeof translations.en.responses];
        for (const [k, v] of Object.entries(replacements)) {
            text = text.replace(`{{${k}}}`, v);
        }
        return { type: 'text', payload: text };
    };

    const buildSubjectKeywordMap = () => {
        const map: { [key: string]: string } = {};
        for (const subject of Object.keys(subjectMeta)) {
            map[subject.toLowerCase()] = subject;
            if (subject.includes('(')) {
                 map[subject.split('(')[0].trim().toLowerCase()] = subject;
            }
        }
        return map;
    };
    const SUBJECT_KEYWORD_MAP = buildSubjectKeywordMap();

    const extractTimeContext = () => {
        for (const [keyword, context] of Object.entries(TIME_CONTEXT_MAP)) {
            if (lowerQuery.includes(keyword)) return context;
        }
        return null;
    };

    const extractDay = () => {
        for (const [keyword, day] of Object.entries(DAY_KEYWORD_MAP)) {
            if (lowerQuery.includes(keyword)) {
                if (day === 'today') return todayName;
                if (day === 'tomorrow') return DAYS[(now.getDay() + 1) % 7];
                if (day === 'yesterday') return DAYS[(now.getDay() + 6) % 7];
                return day;
            }
        }
        return null;
    };

    const extractSubject = () => {
        const sortedKeywords = Object.keys(SUBJECT_KEYWORD_MAP).sort((a,b) => b.length - a.length);
        for (const keyword of sortedKeywords) {
            if (lowerQuery.includes(keyword)) return SUBJECT_KEYWORD_MAP[keyword];
        }
        return null;
    };

    // --- TASK/HOMEWORK INTENT ---
    const taskKeywords = ['homework', 'task', 'assignment', 'due', 'การบ้าน', 'งาน', 'ต้องทำ', 'ต้องส่ง'];
    if (taskKeywords.some(k => lowerQuery.includes(k))) {
        const targetDayName = extractDay();
        const targetSubject = extractSubject();
        const isUnfinishedQuery = lowerQuery.includes('unfinished') || lowerQuery.includes('pending') || lowerQuery.includes('ยังไม่เสร็จ');
        const tasksFound: { day: string, subject: string, text: string, completed: boolean }[] = [];

        const daysToSearch = targetDayName ? [targetDayName] : DAYS.slice(1, 6);

        schedules.forEach(schedule => {
            schedule.rules.forEach(rule => {
                const dayName = DAYS[rule.dayOfWeek];
                if (!daysToSearch.includes(dayName)) return;

                rule.classes.forEach(cls => {
                    if (targetSubject && cls.subject !== targetSubject) return;
                    if (!cls.tasks || cls.tasks.length === 0) return;

                    cls.tasks.forEach(task => {
                        if (isUnfinishedQuery && task.completed) return;
                        tasksFound.push({ day: dayName, subject: cls.subject, text: task.text, completed: task.completed });
                    });
                });
            });
        });

        if (tasksFound.length === 0) {
            const replacements = { subject: targetSubject || 'any subject', day: targetDayName || 'any day' };
            return getResponseText(isUnfinishedQuery ? 'noPendingTasks' : 'noTasksFound', replacements);
        }
        
        return {
            type: 'tasks',
            payload: {
                title: isUnfinishedQuery ? t.pendingTaskHeader : t.taskHeader,
                tasks: tasksFound,
            }
        };
    }

    // --- SCHEDULE INTENT ---
    const targetDayName = extractDay();
    const targetSubject = extractSubject();
    const timeContext = extractTimeContext();
    const dayToQueryName = targetDayName || todayName;
    const dayToQueryIndex = DAYS.indexOf(dayToQueryName as typeof DAYS[number]);
    const dayDisplay = t.dayNames[dayToQueryName as keyof typeof t.dayNames];

    const referenceDate = new Date();
    if (targetDayName) {
        const todayIndex = now.getDay();
        const diff = dayToQueryIndex - todayIndex;
        referenceDate.setDate(now.getDate() + diff);
    }
    const scheduleForDay = getScheduleForDate(referenceDate, schedules);
    
    let dayClasses = scheduleForDay?.rules.find(r => r.dayOfWeek === dayToQueryIndex)?.classes.slice().sort((a, b) => a.startTime.localeCompare(b.startTime)) || [];

    if (timeContext) {
        dayClasses = dayClasses.filter(c => c.startTime >= timeContext.start && c.startTime < timeContext.end);
        if (dayClasses.length === 0) {
            return getResponseText('noClassesOnDay', { day: dayDisplay });
        }
    }

    if (lowerQuery.includes('full schedule') || lowerQuery.includes('weekly schedule') || lowerQuery.includes('all week') || lowerQuery.includes('ทั้งสัปดาห์') || lowerQuery.includes('ทั้งอาทิตย์')) {
        let fullScheduleStr = `<strong>${t.responses.fullScheduleHeader}</strong><br/>`;
        const scheduleToUse = getScheduleForDate(new Date(), schedules);
        if (!scheduleToUse) return getResponseText('cantFindSchedule');

        for (const dayName of DAYS.slice(1, 6)) {
            const dayIndex = DAYS.indexOf(dayName);
            const classes = scheduleToUse.rules.find(r => r.dayOfWeek === dayIndex)?.classes || [];
            fullScheduleStr += `<br/><strong>${t.dayNames[dayName as keyof typeof t.dayNames]}</strong>`;
            if (classes.length === 0) {
                fullScheduleStr += `<br/>- ${t.responses.noClasses}`;
            } else {
                classes.forEach(c => {
                    const icon = subjectMeta[c.subject]?.icon || '📚';
                    fullScheduleStr += `<br/>- ${icon} ${c.subject} (${formatTime(c.startTime)} - ${formatTime(c.endTime)})${c.isOnline ? ` ${t.responses.flipped}` : ''}`;
                });
            }
        }
        return { type: 'text', payload: fullScheduleStr };
    }

    if (lowerQuery.includes('now') || lowerQuery.includes('ตอนนี้')) {
        if(dayToQueryName !== todayName) return getResponseText('timeContextError');
        const currentClass = dayClasses.find(c => nowTime >= c.startTime && nowTime < c.endTime);
        if(currentClass) return getResponseText('inClassNow', {subject: currentClass.subject, endTime: formatTime(currentClass.endTime)});
        const nextClass = dayClasses.find(c => c.startTime > nowTime);
        if(nextClass) return getResponseText('onBreak', {subject: nextClass.subject, startTime: formatTime(nextClass.startTime)});
        return getResponseText('doneForToday');
    }

    if ((lowerQuery.includes('next') || lowerQuery.includes('ถัดไป') || lowerQuery.includes('ต่อไป')) && !targetSubject) {
        if(dayToQueryName !== todayName) return getResponseText('timeContextError');
        const nextClass = dayClasses.find(c => c.startTime > nowTime);
        return nextClass ? getResponseText('nextClassIs', {subject: nextClass.subject, startTime: formatTime(nextClass.startTime)}) : getResponseText('noMoreClasses');
    }

    if (targetSubject) {
        const classesOnDay = dayClasses.filter(c => c.subject === targetSubject);
        if (classesOnDay.length > 0) {
            const times = classesOnDay.map(c => `${formatTime(c.startTime)} - ${formatTime(c.endTime)}`).join(' and ');
            return getResponseText('classTime', {subject: targetSubject, day: dayDisplay, times});
        }
        return getResponseText('noClass', {subject: targetSubject, day: dayDisplay});
    }

    if (targetDayName) {
        if (dayClasses.length === 0) return getResponseText('noClassesOnDay', { day: dayDisplay });
        return {
            type: 'schedule',
            payload: {
                dayName: dayDisplay,
                classes: dayClasses,
            }
        };
    }

    return getResponseText('defaultFallback');
};
