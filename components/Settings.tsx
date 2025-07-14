
import React, { useState } from 'react';
import { Modal } from './shared/Modal';
import type { Settings as SettingsType, Schedule, SubjectMeta, Theme, AttendanceLog } from '../types';
import { ACCENT_COLORS, PALETTE } from '../constants';
import { ScheduleEditor } from './analytics/ScheduleEditor';
import { SlidersHorizontal, Palette, Calendar, Database, Trash2, Edit, Plus, Bell } from 'lucide-react';
import { SubjectManager } from './shared/SubjectManager';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SettingsType;
  schedules: Schedule[];
  activeSchedule: Schedule | null;
  logs: AttendanceLog[];
  onSaveSettings: (newSettings: Partial<SettingsType>) => void;
  onSaveSchedule: (schedule: Schedule) => void;
  onDeleteSchedule: (scheduleId: string) => void;
  subjectMeta: SubjectMeta;
  onReplaceAllSubjectMeta: (newMeta: SubjectMeta) => void;
  replaceAllLogs: (logs: AttendanceLog[]) => void;
  replaceAllSchedules: (schedules: Schedule[]) => void;
  onShowMessage: (message: string) => void;
}

type Tab = 'general' | 'appearance' | 'schedules' | 'data';

const TabButton: React.FC<{ icon: React.ReactNode; label: string; isActive: boolean; onClick: () => void; }> = ({ icon, label, isActive, onClick }) => (
    <button onClick={onClick} className={`flex items-center gap-3 w-full p-3 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-primary/10 text-primary' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>
        {icon}
        <span>{label}</span>
    </button>
);

export const Settings: React.FC<SettingsProps> = (props) => {
    const [activeTab, setActiveTab] = useState<Tab>('general');

    const renderContent = () => {
        switch (activeTab) {
            case 'general': return <GeneralSettings {...props} />;
            case 'appearance': return <AppearanceSettings {...props} />;
            case 'schedules': return <SchedulesSettings {...props} />;
            case 'data': return <DataSettings {...props} />;
            default: return null;
        }
    };

  return (
    <Modal isOpen={props.isOpen} onClose={props.onClose} title="Settings" size="2xl">
        <div className="flex flex-col sm:flex-row gap-8">
            <nav className="w-full sm:w-48 flex-shrink-0 space-y-1">
                <TabButton icon={<SlidersHorizontal size={18}/>} label="General" isActive={activeTab === 'general'} onClick={() => setActiveTab('general')} />
                <TabButton icon={<Palette size={18}/>} label="Appearance" isActive={activeTab === 'appearance'} onClick={() => setActiveTab('appearance')} />
                <TabButton icon={<Calendar size={18}/>} label="Schedules" isActive={activeTab === 'schedules'} onClick={() => setActiveTab('schedules')} />
                <TabButton icon={<Database size={18}/>} label="Data" isActive={activeTab === 'data'} onClick={() => setActiveTab('data')} />
            </nav>
            <div className="flex-1 min-w-0">
                {renderContent()}
            </div>
        </div>
    </Modal>
  );
};

const Section: React.FC<{title: string, children: React.ReactNode, className?: string}> = ({ title, children, className = '' }) => (
    <div className={`mb-8 ${className}`}>
        <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 mb-4">{title}</h3>
        <div className="space-y-4">{children}</div>
    </div>
);

const GeneralSettings: React.FC<Omit<SettingsProps, 'isOpen' | 'onClose'>> = ({ settings, onSaveSettings, onShowMessage }) => {
    
    const handleNotificationToggle = async () => {
        const currentlyEnabled = settings.notificationsEnabled;

        if (!('Notification' in window) || !window.isSecureContext) {
            onShowMessage("Notifications require a secure (HTTPS) connection and are not supported by your browser.");
            return;
        }
        
        if (Notification.permission === 'denied') {
            onShowMessage("Notifications are blocked. Please enable them in your browser settings.");
            return;
        }

        if (Notification.permission === 'default') {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                onSaveSettings({ notificationsEnabled: true });
                onShowMessage("Notifications enabled! You'll be reminded 10 minutes before class.");
            } else {
                onShowMessage("Notifications not enabled. You can change this later.");
            }
        } else if (Notification.permission === 'granted') {
            onSaveSettings({ notificationsEnabled: !currentlyEnabled });
            onShowMessage(currentlyEnabled ? "Notifications have been disabled." : "Notifications are now enabled.");
        }
    };


    const inputClasses = "mt-1 block w-full rounded-lg border-zinc-300 dark:border-zinc-600 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm";
    const labelClasses = "block text-sm font-medium text-zinc-700 dark:text-zinc-300";
    
    return (
        <Section title="General Settings">
            <div>
                <label htmlFor="gracePeriod" className={labelClasses}>Grace Period (minutes)</label>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">How many minutes after the required time you can arrive before being marked as late.</p>
                <input
                    type="number"
                    id="gracePeriod"
                    value={settings.gracePeriod}
                    onChange={(e) => onSaveSettings({ gracePeriod: parseInt(e.target.value, 10) || 0 })}
                    className={inputClasses}
                    min="0"
                />
            </div>
             <div>
                <label htmlFor="assistantName" className={labelClasses}>Assistant Name</label>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Give your chat assistant a custom name.</p>
                <input
                    type="text"
                    id="assistantName"
                    value={settings.assistantName || ''}
                    onChange={(e) => onSaveSettings({ assistantName: e.target.value })}
                    className={inputClasses}
                    placeholder="e.g., Bros"
                />
            </div>
             <div>
                <h4 className={labelClasses}>Notifications</h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">Get notified 10 minutes before a class starts.</p>
                <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-100 dark:bg-zinc-800/50">
                    <div className="flex items-center gap-2">
                        <Bell size={18} className={settings.notificationsEnabled && Notification.permission === 'granted' ? 'text-primary' : 'text-zinc-500'}/>
                        <span className="font-medium text-zinc-800 dark:text-zinc-200">Class Reminders</span>
                    </div>
                     <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={settings.notificationsEnabled && Notification.permission === 'granted'} onChange={handleNotificationToggle} className="sr-only peer" />
                        <div className="w-11 h-6 bg-zinc-200 dark:bg-zinc-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                </div>
            </div>
        </Section>
    );
};

const AppearanceSettings: React.FC<Omit<SettingsProps, 'isOpen' | 'onClose'>> = ({ settings, onSaveSettings, subjectMeta, onReplaceAllSubjectMeta }) => {
    
    return (
        <>
        <Section title="Appearance">
            <div>
                <h4 className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Theme</h4>
                 <div className="flex gap-2">
                    {(['light', 'dark', 'system'] as Theme[]).map(theme => (
                        <button key={theme} onClick={() => onSaveSettings({ theme })} className={`px-4 py-2 rounded-lg text-sm capitalize font-semibold w-full transition-colors ${settings.theme === theme ? 'bg-primary text-white' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200'}`}>
                            {theme}
                        </button>
                    ))}
                </div>
            </div>
             <div>
                <h4 className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Accent Color</h4>
                <div className="grid grid-cols-8 gap-2">
                    {ACCENT_COLORS.map(color => (
                        <button key={color} onClick={() => onSaveSettings({ accentColor: color })} className={`w-8 h-8 rounded-full transition-transform transform hover:scale-110 ${settings.accentColor === color ? 'ring-2 ring-offset-2 ring-primary dark:ring-offset-zinc-800' : ''}`} style={{ backgroundColor: color }} aria-label={`Set accent color to ${color}`} />
                    ))}
                </div>
            </div>
        </Section>
        <SubjectManager subjectMeta={subjectMeta} onSave={onReplaceAllSubjectMeta} />
        </>
    );
};

const SchedulesSettings: React.FC<Omit<SettingsProps, 'isOpen' | 'onClose'>> = ({ schedules, onSaveSchedule, onDeleteSchedule, subjectMeta, onReplaceAllSubjectMeta }) => {
    const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);

    const handleAddNew = () => {
        const newId = `schedule-${Date.now()}`;
        const newSchedule: Schedule = {
            id: newId,
            name: 'New Schedule',
            rules: [
                { dayOfWeek: 1, classes: [] }, { dayOfWeek: 2, classes: [] },
                { dayOfWeek: 3, classes: [] }, { dayOfWeek: 4, classes: [] },
                { dayOfWeek: 5, classes: [] }, { dayOfWeek: 6, classes: [] },
                { dayOfWeek: 0, classes: [] },
            ],
            startDate: '',
            endDate: '',
        };
        onSaveSchedule(newSchedule);
        setEditingScheduleId(newId);
    };

    const handleSaveFromEditor = (scheduleToSave: Schedule) => {
        const newSubjectMeta = { ...subjectMeta };
        let metaWasUpdated = false;
        scheduleToSave.rules.forEach(rule => {
            rule.classes.forEach(c => {
                if (c.subject && !newSubjectMeta[c.subject]) {
                    const usedColors = Object.values(newSubjectMeta).map(meta => meta.color);
                    const availableColor = PALETTE.find(p => !usedColors.includes(p)) || `#${Math.floor(Math.random()*16777215).toString(16)}`;
                    newSubjectMeta[c.subject] = { color: availableColor, icon: '📚' };
                    metaWasUpdated = true;
                }
            });
        });

        if (metaWasUpdated) {
            onReplaceAllSubjectMeta(newSubjectMeta);
        }
        
        onSaveSchedule(scheduleToSave);
        setEditingScheduleId(null);
    };

    const handleCancel = () => {
        const scheduleToCancel = schedules.find(s => s.id === editingScheduleId);
        if(scheduleToCancel && scheduleToCancel.name === 'New Schedule' && scheduleToCancel.rules.every(r => r.classes.length === 0)) {
            handleDelete(editingScheduleId!);
        }
        setEditingScheduleId(null);
    }
    
    const handleDelete = (id: string) => {
        if(schedules.length <= 1) {
            alert("You cannot delete the last schedule.");
            return;
        }
        if(window.confirm('Are you sure you want to delete this schedule? This cannot be undone.')) {
            onDeleteSchedule(id);
            if(editingScheduleId === id) {
                setEditingScheduleId(null);
            }
        }
    };

    if (editingScheduleId) {
        const scheduleToEdit = schedules.find(s => s.id === editingScheduleId);
        if (scheduleToEdit) {
            return (
                <ScheduleEditor 
                    schedule={scheduleToEdit} 
                    onSave={handleSaveFromEditor}
                    onCancel={handleCancel}
                    subjectMeta={subjectMeta}
                />
            );
        }
    }

    return (
        <Section title="Schedules">
            <div className="space-y-3">
                {schedules.map(schedule => (
                    <div key={schedule.id} className="flex items-center justify-between p-3 bg-zinc-100 dark:bg-zinc-800/50 rounded-lg">
                        <div>
                            <p className="font-semibold text-zinc-800 dark:text-zinc-200">{schedule.name}</p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                {schedule.startDate && schedule.endDate ? `${schedule.startDate} to ${schedule.endDate}` : 'No date range'}
                            </p>
                        </div>
                        <div className="flex gap-2">
                             <button onClick={() => setEditingScheduleId(schedule.id)} className="p-2 text-zinc-500 hover:text-primary rounded-md"><Edit size={16}/></button>
                             <button onClick={() => handleDelete(schedule.id)} className="p-2 text-zinc-500 hover:text-danger rounded-md"><Trash2 size={16}/></button>
                        </div>
                    </div>
                ))}
            </div>
            <button onClick={handleAddNew} className="mt-4 w-full flex items-center justify-center gap-2 p-2.5 rounded-lg bg-primary/10 text-primary font-semibold hover:bg-primary/20">
                <Plus size={18} /> Add New Schedule
            </button>
        </Section>
    );
};

const DataSettings: React.FC<Omit<SettingsProps, 'isOpen'|'onClose'>> = (props) => {

    const exportData = () => {
        try {
            const data = {
                settings: props.settings,
                schedules: props.schedules,
                logs: props.logs,
                subjectMeta: props.subjectMeta
            };
            const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
            const link = document.createElement('a');
            link.href = jsonString;
            link.download = `classdy_backup_${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            props.onShowMessage("Data exported successfully!");
        } catch(e) {
            props.onShowMessage("Error exporting data.");
        }
    };

    const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') throw new Error("File could not be read");
                const data = JSON.parse(text);

                if (window.confirm("This will overwrite ALL current application data (schedules, logs, and settings). This cannot be undone. Are you sure?")) {
                    if (data.settings) props.onSaveSettings(data.settings);
                    if (data.schedules && Array.isArray(data.schedules)) {
                       props.replaceAllSchedules(data.schedules);
                    }
                    if (data.subjectMeta) props.onReplaceAllSubjectMeta(data.subjectMeta);
                    if (data.logs && Array.isArray(data.logs)) {
                        props.replaceAllLogs(data.logs);
                    }
                    props.onShowMessage("Data imported successfully!");
                }
            } catch (error) {
                console.error("Failed to import data:", error);
                props.onShowMessage("Failed to import data. Please check the file format.");
            }
        };
        reader.readAsText(file);
        event.target.value = ''; // Reset input to allow re-importing the same file
    };

    return (
        <Section title="Data Management">
            <div>
                 <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">Backup or restore your application data. This includes all schedules, logs, and settings.</p>
                <div className="flex flex-col gap-3">
                    <button onClick={exportData} className="w-full text-center p-2.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold hover:bg-blue-500/20">
                        Export Data
                    </button>
                    <label className="w-full text-center p-2.5 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400 font-semibold hover:bg-green-500/20 cursor-pointer">
                        Import Data
                        <input type="file" accept=".json" className="hidden" onChange={importData} />
                    </label>
                </div>
            </div>
        </Section>
    );
};