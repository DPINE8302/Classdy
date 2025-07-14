
import React, { useState, useEffect } from 'react';
import type { Schedule, ScheduleRule, ClassSession, SubjectMeta, DayOfWeek } from '../../types';
import { DAYS_OF_WEEK } from '../../constants';
import { Plus, Trash2 } from 'lucide-react';

interface ScheduleEditorProps {
    schedule: Schedule;
    onSave: (schedule: Schedule) => void;
    onCancel: () => void;
    subjectMeta: SubjectMeta;
}

const inputClasses = "block w-full rounded-lg border-zinc-300 dark:border-zinc-600 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm";
const labelClasses = "block text-sm font-medium text-zinc-700 dark:text-zinc-300";

export const ScheduleEditor: React.FC<ScheduleEditorProps> = ({ schedule, onSave, onCancel, subjectMeta }) => {
    const [editedSchedule, setEditedSchedule] = useState<Schedule>(JSON.parse(JSON.stringify(schedule)));
    const [allSubjects, setAllSubjects] = useState<string[]>([]);
    
    useEffect(() => {
        const subjects = new Set<string>();
        editedSchedule.rules.forEach(rule => {
            rule.classes.forEach(c => subjects.add(c.subject));
        });
        Object.keys(subjectMeta).forEach(sub => subjects.add(sub));
        setAllSubjects(Array.from(subjects).filter(Boolean));
    }, [editedSchedule.rules, subjectMeta]);


    const handleScheduleInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditedSchedule(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleRuleChange = (day: DayOfWeek, newClasses: ClassSession[]) => {
        setEditedSchedule(prev => ({
            ...prev,
            rules: prev.rules.map(rule => rule.dayOfWeek === day ? { ...rule, classes: newClasses } : rule)
        }));
    };

    const handleSave = () => {
        onSave(editedSchedule);
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{schedule.name === "New Schedule" ? "Create New Schedule" : "Edit Schedule"}</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="name" className={labelClasses}>Schedule Name</label>
                    <input type="text" name="name" id="name" value={editedSchedule.name} onChange={handleScheduleInfoChange} className={inputClasses} />
                </div>
            </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div>
                    <label htmlFor="startDate" className={labelClasses}>Start Date</label>
                    <input type="date" name="startDate" id="startDate" value={editedSchedule.startDate || ''} onChange={handleScheduleInfoChange} className={inputClasses} style={{colorScheme: 'dark'}}/>
                </div>
                 <div>
                    <label htmlFor="endDate" className={labelClasses}>End Date</label>
                    <input type="date" name="endDate" id="endDate" value={editedSchedule.endDate || ''} onChange={handleScheduleInfoChange} className={inputClasses} style={{colorScheme: 'dark'}}/>
                </div>
            </div>
            
            <div className="space-y-4">
                {DAYS_OF_WEEK.map(({ value, label }) => {
                     const rule = editedSchedule.rules.find(r => r.dayOfWeek === value);
                     return rule ? <DayEditor key={value} day={label} rule={rule} onChange={handleRuleChange} allSubjects={allSubjects} setAllSubjects={setAllSubjects} /> : null
                })}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-700">
                 <button onClick={onCancel} className="rounded-lg border-none bg-zinc-200 dark:bg-zinc-700 py-2 px-4 text-sm font-medium text-zinc-800 dark:text-zinc-200 shadow-sm hover:bg-zinc-300 dark:hover:bg-zinc-600">Cancel</button>
                 <button onClick={handleSave} className="inline-flex justify-center rounded-lg border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-hover">Save Schedule</button>
            </div>
        </div>
    );
};

interface DayEditorProps {
    day: string;
    rule: ScheduleRule;
    onChange: (day: DayOfWeek, newClasses: ClassSession[]) => void;
    allSubjects: string[];
    setAllSubjects: React.Dispatch<React.SetStateAction<string[]>>;
}

const DayEditor: React.FC<DayEditorProps> = ({ day, rule, onChange, allSubjects, setAllSubjects }) => {
    const handleClassChange = (index: number, field: keyof ClassSession, value: string | boolean) => {
        const newClasses = [...rule.classes];
        (newClasses[index] as any)[field] = value;
        onChange(rule.dayOfWeek, newClasses);

        if (field === 'subject' && typeof value === 'string' && value.trim() && !allSubjects.includes(value)) {
            setAllSubjects(prev => [...prev, value]);
        }
    };
    
    const addClass = () => {
        const newClass: ClassSession = { id: `class-${Date.now()}`, subject: '', startTime: '08:00', endTime: '09:00', tasks: [], isOnline: false };
        onChange(rule.dayOfWeek, [...rule.classes, newClass]);
    };

    const removeClass = (index: number) => {
        const newClasses = rule.classes.filter((_, i) => i !== index);
        onChange(rule.dayOfWeek, newClasses);
    };

    return (
        <div className="p-4 bg-zinc-100 dark:bg-zinc-800/50 rounded-lg">
            <h4 className="font-semibold mb-3 text-zinc-800 dark:text-zinc-200">{day}</h4>
            <div className="space-y-3">
                {rule.classes.map((cls, index) => (
                    <div key={cls.id || index} className="grid grid-cols-1 sm:grid-cols-10 gap-2 items-center">
                        <div className="sm:col-span-3">
                            <label className="text-xs sr-only">Subject</label>
                             <input 
                                type="text"
                                list="subjects-datalist"
                                value={cls.subject} 
                                onChange={(e) => handleClassChange(index, 'subject', e.target.value)} 
                                className={inputClasses}
                                placeholder="Subject Name"
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="text-xs sr-only">Start Time</label>
                            <input type="time" value={cls.startTime} onChange={(e) => handleClassChange(index, 'startTime', e.target.value)} className={inputClasses} style={{colorScheme: 'dark'}}/>
                        </div>
                         <div className="sm:col-span-2">
                             <label className="text-xs sr-only">End Time</label>
                            <input type="time" value={cls.endTime} onChange={(e) => handleClassChange(index, 'endTime', e.target.value)} className={inputClasses} style={{colorScheme: 'dark'}}/>
                        </div>
                         <div className="sm:col-span-2 flex items-center justify-start sm:justify-center">
                            <input
                                type="checkbox"
                                id={`online-${cls.id}`}
                                checked={!!cls.isOnline}
                                onChange={(e) => handleClassChange(index, 'isOnline', e.target.checked)}
                                className="h-4 w-4 rounded border-zinc-300 text-primary focus:ring-primary"
                            />
                            <label htmlFor={`online-${cls.id}`} className="ml-2 text-sm text-zinc-600 dark:text-zinc-400">Flipped</label>
                        </div>
                        <div className="sm:col-span-1 flex justify-end">
                            <button onClick={() => removeClass(index)} className="p-2 text-zinc-500 hover:text-danger rounded-md"><Trash2 size={16}/></button>
                        </div>
                    </div>
                ))}
                 <datalist id="subjects-datalist">
                    {allSubjects.map(sub => <option key={sub} value={sub} />)}
                </datalist>
                <button onClick={addClass} className="w-full text-sm flex items-center justify-center gap-1 p-2 rounded-md bg-primary/10 text-primary font-semibold hover:bg-primary/20">
                    <Plus size={16}/> Add Class
                </button>
            </div>
        </div>
    );
};
