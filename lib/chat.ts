import { getDay, parseISO } from 'date-fns';
import type { Schedule, SubjectMeta } from '../types';
import { getScheduleForDate } from './utils';

// --- CONSTANTS (Ported from ClassBuddy) ---
const DAYS_OF_WEEK_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const ENG_TO_THAI_DAY_MAP: { [key: string]: string } = { 'Monday': 'วันจันทร์', 'Tuesday': 'วันอังคาร', 'Wednesday': 'วันพุธ', 'Thursday': 'วันพฤหัสบดี', 'Friday': 'วันศุกร์', 'Saturday': 'วันเสาร์', 'Sunday': 'วันอาทิตย์' };
const THAI_REGEX = /[\u0E00-\u0E7F]/;

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

const TIME_CONTEXT_MAP: { [key: string]: { start: string, end: string, eng: string, thai: string } } = {
    'morning': { start: '00:00', end: '12:00', eng: 'morning', thai: 'ตอนเช้า' },
    'ตอนเช้า': { start: '00:00', end: '12:00', eng: 'morning', thai: 'ตอนเช้า' },
    'afternoon': { start: '12:00', end: '17:00', eng: 'afternoon', thai: 'ตอนบ่าย' },
    'ตอนบ่าย': { start: '12:00', end: '17:00', eng: 'afternoon', thai: 'ตอนบ่าย' },
    'evening': { start: '17:00', end: '24:00', eng: 'evening', thai: 'ตอนเย็น' },
    'ตอนเย็น': { start: '17:00', end: '24:00', eng: 'evening', thai: 'ตอนเย็น' },
};

// --- MAIN PROCESSING FUNCTION ---
export const processQuestion = (query: string, schedules: Schedule[], subjectMeta: SubjectMeta): string => {
    const lowerQuery = query.toLowerCase().trim().replace(/[?.,]/g, '');
    const isThaiQuery = THAI_REGEX.test(lowerQuery);
    const now = new Date();
    const todayName = DAYS_OF_WEEK_NAMES[now.getDay()];
    const nowTime = now.toTimeString().substring(0, 5);

    const getResponse = (eng: string, thai: string) => isThaiQuery ? thai : eng;

    const buildSubjectKeywordMap = () => {
        const map: { [key: string]: string } = {};
        for (const subject of Object.keys(subjectMeta)) {
            map[subject.toLowerCase()] = subject;
            // Add common Thai/English variations if possible (this is a simplification)
            if (subject.includes('(')) {
                 map[subject.split('(')[0].trim().toLowerCase()] = subject;
            }
        }
        return map;
    };
    const SUBJECT_KEYWORD_MAP = buildSubjectKeywordMap();

    // --- NLP HELPER FUNCTIONS ---
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
                if (day === 'tomorrow') return DAYS_OF_WEEK_NAMES[(now.getDay() + 1) % 7];
                if (day === 'yesterday') return DAYS_OF_WEEK_NAMES[(now.getDay() + 6) % 7];
                return day;
            }
        }
        return null;
    };

    const extractSubject = () => {
        // Iterate in reverse to match longer names first
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
        let tasksFound: { day: string, subject: string, text: string, completed: boolean }[] = [];

        const daysToSearch = targetDayName ? [targetDayName] : DAYS_OF_WEEK_NAMES.slice(1, 6); // Mon-Fri if no day specified

        schedules.forEach(schedule => {
            schedule.rules.forEach(rule => {
                const dayName = DAYS_OF_WEEK_NAMES[rule.dayOfWeek];
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
            let responseEng = isUnfinishedQuery ? "You have no pending tasks" : "No tasks found";
            let responseThai = isUnfinishedQuery ? "ไม่มีงานค้างเลย" : "ไม่พบงาน";
            if (targetSubject) {
                responseEng += ` for ${targetSubject}`;
                responseThai += `สำหรับวิชา ${targetSubject}`;
            }
            if (targetDayName) {
                responseEng += ` on ${targetDayName}`;
                responseThai += `ใน${ENG_TO_THAI_DAY_MAP[targetDayName] || targetDayName}`;
            }
            return getResponse(responseEng + ".", responseThai + "นะ");
        }

        let response = getResponse("Here are your tasks:", "นี่คือรายการงานของเธอ:");
        const groupedTasks = tasksFound.reduce((acc, task) => {
            const key = `${task.day} - ${task.subject}`;
            if (!acc[key]) {
                acc[key] = { day: task.day, subject: task.subject, tasks: [] };
            }
            acc[key].tasks.push(task);
            return acc;
        }, {} as any);

        for (const groupKey in groupedTasks) {
            const group = groupedTasks[groupKey];
            const dayDisplay = getResponse(group.day, ENG_TO_THAI_DAY_MAP[group.day]);
            const icon = subjectMeta[group.subject]?.icon || '📚';
            const iconHtml = `${icon} `;
            response += `\n\n**${iconHtml}${group.subject} (${dayDisplay})**`;
            group.tasks.forEach((task: any) => {
                const status = task.completed ? getResponse(' (Done)', ' (เสร็จแล้ว)') : '';
                response += `\n- ${task.text}${isUnfinishedQuery ? '' : status}`;
            });
        }
        return response;
    }

    // --- SCHEDULE INTENT ---
    const targetDayName = extractDay();
    const targetSubject = extractSubject();
    const timeContext = extractTimeContext();
    const dayToQueryName = targetDayName || todayName;
    const dayToQueryIndex = DAYS_OF_WEEK_NAMES.indexOf(dayToQueryName);
    const dayDisplay = isThaiQuery ? ENG_TO_THAI_DAY_MAP[dayToQueryName] : dayToQueryName;

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
            return getResponse(`You have no classes in the ${timeContext.eng} on ${dayToQueryName}.`, `ไม่มีเรียน${timeContext.thai}ใน${dayDisplay}`);
        }
    }

    if (lowerQuery.includes('full schedule') || lowerQuery.includes('weekly schedule') || lowerQuery.includes('all week') || lowerQuery.includes('ทั้งสัปดาห์') || lowerQuery.includes('ทั้งอาทิตย์')) {
        let fullScheduleStr = getResponse("Here's your weekly schedule:", "นี่คือตารางสอนทั้งสัปดาห์ของเธอ:");
        const scheduleToUse = getScheduleForDate(new Date(), schedules);
        if (!scheduleToUse) return "I can't find a schedule for this week.";

        for (const dayName of DAYS_OF_WEEK_NAMES.slice(1, 6)) {
            const dayIndex = DAYS_OF_WEEK_NAMES.indexOf(dayName);
            const classes = scheduleToUse.rules.find(r => r.dayOfWeek === dayIndex)?.classes || [];
            fullScheduleStr += `\n\n**${getResponse(dayName, ENG_TO_THAI_DAY_MAP[dayName])}**`;
            if (classes.length === 0) {
                fullScheduleStr += getResponse(`\n- No classes!`, `\n- ไม่มีเรียน!`);
            } else {
                classes.forEach(c => {
                    const icon = subjectMeta[c.subject]?.icon || '📚';
                    fullScheduleStr += `\n- ${icon} ${c.subject} (${c.startTime} - ${c.endTime})${c.isOnline ? ' (Flipped)' : ''}`;
                });
            }
        }
        return fullScheduleStr;
    }

    if (lowerQuery.includes('now') || lowerQuery.includes('ตอนนี้')) {
        if(dayToQueryName !== todayName) return getResponse(`I can only tell you what's happening 'now' for today. For ${dayToQueryName}, please ask about a specific time.`, `บอกได้แค่ว่า 'ตอนนี้' เรียนอะไรสำหรับวันนี้เท่านั้นนะ ถ้าอยากรู้วันอื่น ให้ถามเวลาเจาะจงมาเลย`);
        const currentClass = dayClasses.find(c => nowTime >= c.startTime && nowTime < c.endTime);
        if(currentClass) return getResponse(`You are currently in **${currentClass.subject}**, which ends at ${currentClass.endTime}.`, `ตอนนี้กำลังเรียนวิชา **${currentClass.subject}** อยู่ เลิกตอน ${currentClass.endTime}`);
        const nextClass = dayClasses.find(c => c.startTime > nowTime);
        if(nextClass) return getResponse(`You're on a break. Your next class is **${nextClass.subject}** at ${nextClass.startTime}.`, `ตอนนี้พักอยู่ คาบต่อไปเรียน **${nextClass.subject}** ตอน ${nextClass.startTime}`);
        return getResponse(`You're done for today! No more classes scheduled right now.`, `วันนี้เรียนเสร็จแล้ว! ไม่มีคาบเรียนแล้วจ้า`);
    }

    if ((lowerQuery.includes('next') || lowerQuery.includes('ถัดไป') || lowerQuery.includes('ต่อไป')) && !targetSubject) {
        if(dayToQueryName !== todayName) return getResponse(`I can only tell you the 'next' class for today.`, `บอก 'คาบต่อไป' ได้สำหรับวันนี้เท่านั้นนะ`);
        const nextClass = dayClasses.find(c => c.startTime > nowTime);
        return nextClass ? getResponse(`Your next class is **${nextClass.subject}** at ${nextClass.startTime}.`, `คาบต่อไปคือ **${nextClass.subject}** ตอน ${nextClass.startTime}`) : getResponse(`You have no more classes scheduled for today.`, `วันนี้ไม่มีเรียนแล้ว`);
    }

    if (targetSubject) {
        const classesOnDay = dayClasses.filter(c => c.subject === targetSubject);
        if (classesOnDay.length > 0) {
            const times = classesOnDay.map(c => `${c.startTime} - ${c.endTime}`).join(' and ');
            return getResponse(`Yes, you have **${targetSubject}** on ${dayToQueryName} from ${times}.`, `ใช่ มีเรียน **${targetSubject}** ใน${dayDisplay} ตอน ${times}`);
        }
        return getResponse(`Nope, you do not have **${targetSubject}** on ${dayToQueryName}.`, `ไม่มีเรียน **${targetSubject}** ใน${dayDisplay}`);
    }

    if (targetDayName) {
        if (dayClasses.length === 0) return getResponse(`You have no classes scheduled for ${targetDayName}. Enjoy your free day! 🎉`, `${dayDisplay}ไม่มีเรียนนะ พักผ่อนได้เลย! 🎉`);
        const classList = dayClasses.map(c => {
            const icon = subjectMeta[c.subject]?.icon || '📚';
            return `\n- ${icon} **${c.subject}** (${c.startTime} - ${c.endTime})`
        }).join('');
        return getResponse(`On ${targetDayName}, your schedule is:${classList}`, `ตารางเรียน${dayDisplay}คือ:${classList}`);
    }

    return getResponse(
        "Sorry, I couldn't understand that. You can ask for a day's schedule (e.g., 'What's on Monday?'), ask about a class (e.g., 'Do I have Math today?'), or ask 'what's next?'.",
        "ขอโทษนะ ไม่เข้าใจที่ถามเลย ลองถามเกี่ยวกับตารางเรียนดูสิ เช่น 'วันจันทร์เรียนอะไร?', 'มีเรียนคณิตไหม?', หรือ 'คาบต่อไปเรียนอะไร?'"
    );
};
