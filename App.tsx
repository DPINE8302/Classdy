





import React, { useState, useMemo, useEffect } from 'react';
import { useAppData } from './hooks/useAppData';
import { Dashboard } from './components/dashboard/Dashboard';
import { Analytics } from './components/analytics/Analytics';
import { Settings } from './components/Settings';
import { AddLogModal } from './components/AddLogModal';
import { ScheduleView } from './components/schedule/ScheduleView';
import { Settings as SettingsIcon, LayoutGrid, ListChecks, AreaChart, BarChartHorizontal, MessageCircle, Plus } from 'lucide-react';
import type { AttendanceLog, Settings as SettingsType, DayOfWeek, Schedule } from './types';
import { getGreeting, applyTheme, getScheduleForDate, getStatus } from './lib/utils';
import { TaskModal } from './components/TaskModal';
import { Overview } from './components/analytics/Overview';
import { ChatWidget } from './components/ChatWidget';
import { useMediaQuery } from './hooks/useMediaQuery';
import { DesktopNav } from './components/layout/DesktopNav';
import { MobileNav } from './components/layout/MobileNav';
import { ChatView } from './components/ChatView';

type Tab = 'overview' | 'dashboard' | 'schedule' | 'reports' | 'chat';

const NAV_OPTIONS = [
    {label: 'Overview', value: 'overview' as Tab, icon: BarChartHorizontal},
    {label: 'Dashboard', value: 'dashboard' as Tab, icon: LayoutGrid},
    {label: 'Schedule', value: 'schedule' as Tab, icon: ListChecks},
    {label: 'Reports', value: 'reports' as Tab, icon: AreaChart},
    {label: 'Chat', value: 'chat' as Tab, icon: MessageCircle},
];

export default function App() {
  const {
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
    updateClassTasks
  } = useAppData();

  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAddLogModalOpen, setIsAddLogModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<AttendanceLog | null>(null);
  const [greeting, setGreeting] = useState('');
  const [taskModalState, setTaskModalState] = useState<{ day: DayOfWeek, classId: string } | null>(null);
  const [notificationMessage, setNotificationMessage] = useState<{id: number, message: string} | null>(null);
  
  const isDesktop = useMediaQuery('(min-width: 768px)');


  // Apply theme and check for first-time setup
  useEffect(() => {
    applyTheme(settings.theme, settings.accentColor);
    
    if (schedules.length === 0) {
      setIsSettingsOpen(true);
    }
    setGreeting(getGreeting());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Effect to re-apply theme when settings change
  useEffect(() => {
    applyTheme(settings.theme, settings.accentColor);
  }, [settings.theme, settings.accentColor]);

  // Effect for notification watcher
  useEffect(() => {
    let intervalId: number | null = null;

    const checkAndNotify = () => {
        if (!('Notification' in window) || !settings.notificationsEnabled || Notification.permission !== 'granted') {
            return;
        }

        const now = new Date();
        
        let scheduleForToday = getScheduleForDate(now, schedules);
        // If no date-specific schedule is found, use the first available one as a fallback.
        if (!scheduleForToday && schedules.length > 0) {
            scheduleForToday = schedules[0];
        }
        if (!scheduleForToday) return;

        const dayOfWeek = now.getDay();
        const todayRule = scheduleForToday.rules.find(r => r.dayOfWeek === dayOfWeek);
        if (!todayRule) return;

        const todaySchedule = todayRule.classes.filter(c => c.startTime && c.endTime);

        const notifiedClassesKey = `notified-${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
        let notifiedToday = JSON.parse(sessionStorage.getItem(notifiedClassesKey) || '[]');

        const timeToDate = (timeStr: string) => {
            const [h, m] = timeStr.split(':').map(Number);
            const d = new Date();
            d.setHours(h, m, 0, 0);
            return d;
        };

        for (const cls of todaySchedule) {
            const classTime = timeToDate(cls.startTime);
            const diffMinutes = (classTime.getTime() - now.getTime()) / 60000;
            
            const notificationId = `${scheduleForToday.name}-${dayOfWeek}-${cls.startTime}-${cls.subject}`;
            if (diffMinutes > 0 && diffMinutes <= 10 && !notifiedToday.includes(notificationId)) {
                const icon = subjectMeta[cls.subject]?.icon || '📚';
                new Notification(`${icon} Upcoming Class`, {
                    body: `${cls.subject} is starting at ${cls.startTime}.`,
                    tag: notificationId,
                });
                notifiedToday.push(notificationId);
            }
        }
        sessionStorage.setItem(notifiedClassesKey, JSON.stringify(notifiedToday));
    };

    if (settings.notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
        checkAndNotify();
        intervalId = window.setInterval(checkAndNotify, 60000); // Check every minute
    }

    return () => {
        if (intervalId) clearInterval(intervalId);
    };
  }, [settings.notificationsEnabled, schedules, subjectMeta]);

  const handleShowNotification = (message: string) => {
    const id = Date.now();
    setNotificationMessage({ id, message });
    setTimeout(() => {
      setNotificationMessage(prev => (prev?.id === id ? null : prev));
    }, 3000);
  };

  const handleOpenAddLog = (log?: AttendanceLog) => {
    setEditingLog(log || null);
    setIsAddLogModalOpen(true);
  };

  const handleOpenTaskModal = (day: DayOfWeek, classId: string) => {
    setTaskModalState({ day, classId });
  };

  const handleSaveSettings = (newSettings: Partial<SettingsType>) => {
    if(newSettings.theme || newSettings.accentColor) {
        const themeToApply = newSettings.theme || settings.theme;
        const accentToApply = newSettings.accentColor || settings.accentColor;
        applyTheme(themeToApply, accentToApply);
    }
    updateSettings(newSettings);
  };

  const logsWithStatus = useMemo(() => {
    return logs.map(log => {
      const status = getStatus(log.date, log.arrivalTime, schedules, settings.gracePeriod, holidays, log.statusTag);
      return { ...log, status };
    });
  }, [logs, schedules, settings.gracePeriod, holidays]);

  const todayLog = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return logsWithStatus.find(l => l.date === todayStr) || null;
  }, [logsWithStatus]);

  const todayStatus = todayLog?.status || getStatus(new Date().toISOString().split('T')[0], null, schedules, settings.gracePeriod, holidays);

  const renderContent = () => (
    schedules.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-zinc-800/50 rounded-2xl shadow-soft">
          <h2 className="text-2xl font-semibold mb-2 text-zinc-800 dark:text-zinc-200">Welcome to Classdy!</h2>
          <p className="text-zinc-600 dark:text-zinc-400 mb-8">To get started, please create your first schedule in the settings.</p>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="bg-primary text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-primary-hover transition-transform transform hover:scale-105"
          >
            Create Schedule
          </button>
        </div>
      ) : (
        <div className="animate-fade-in h-full">
          <div role="tabpanel" id="panel-overview" hidden={activeTab !== 'overview'}>
            {activeSchedule && <Overview logsWithStatus={logsWithStatus} schedules={schedules} activeSchedule={activeSchedule} settings={settings} holidays={holidays} />}
          </div>
          <div role="tabpanel" id="panel-dashboard" hidden={activeTab !== 'dashboard'}>
            <Dashboard
              logsWithStatus={logsWithStatus}
              todayLog={todayLog}
              todayStatus={todayStatus}
              onEditLog={handleOpenAddLog}
              schedules={schedules}
              activeSchedule={activeSchedule}
              settings={settings}
              holidays={holidays}
              onOpenTaskModal={handleOpenTaskModal}
              subjectMeta={subjectMeta}
            />
          </div>
          <div role="tabpanel" id="panel-schedule" hidden={activeTab !== 'schedule'}>
            {activeSchedule && (
              <ScheduleView
                schedule={activeSchedule}
                subjectMeta={subjectMeta}
                onOpenTaskModal={handleOpenTaskModal}
              />
            )}
          </div>
          <div role="tabpanel" id="panel-reports" hidden={activeTab !== 'reports'}>
             {activeSchedule && <Analytics logsWithStatus={logsWithStatus} schedules={schedules} activeSchedule={activeSchedule} settings={settings} holidays={holidays} />}
          </div>
          <div role="tabpanel" id="panel-chat" hidden={activeTab !== 'chat'} className="h-full">
              {isDesktop ? (
                <ChatView
                  schedules={schedules}
                  subjectMeta={subjectMeta}
                  settings={settings}
                />
              ) : (
                <ChatWidget 
                  schedules={schedules} 
                  subjectMeta={subjectMeta}
                  settings={settings}
                />
              )}
          </div>
        </div>
    )
  );
  
  const renderModals = () => (
    <>
      {notificationMessage && (
            <div className="fixed bottom-5 right-5 bg-zinc-800 text-white p-4 rounded-lg shadow-lg animate-fade-in">
                {notificationMessage.message}
            </div>
      )}

      {isSettingsOpen && (
        <Settings
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          settings={settings}
          schedules={schedules}
          activeSchedule={activeSchedule}
          onSaveSettings={handleSaveSettings}
          onSaveSchedule={saveSchedule}
          onDeleteSchedule={deleteSchedule}
          subjectMeta={subjectMeta}
          onReplaceAllSubjectMeta={replaceAllSubjectMeta}
          logs={logs}
          replaceAllLogs={replaceAllLogs}
          replaceAllSchedules={replaceAllSchedules}
          onShowMessage={handleShowNotification}
        />
      )}
      
      {isAddLogModalOpen && (
        <AddLogModal
          isOpen={isAddLogModalOpen}
          onClose={() => setIsAddLogModalOpen(false)}
          onSave={addOrUpdateLog}
          onDelete={deleteLog}
          log={editingLog}
        />
      )}
      
      {taskModalState && activeSchedule && (
          <TaskModal
              isOpen={!!taskModalState}
              onClose={() => setTaskModalState(null)}
              schedule={activeSchedule}
              dayOfWeek={taskModalState.day}
              classId={taskModalState.classId}
              onUpdateTasks={updateClassTasks}
              subjectMeta={subjectMeta}
          />
      )}
    </>
  );

  if (isDesktop) {
      return (
          <div className="h-screen w-screen flex bg-zinc-100 dark:bg-zinc-900 transition-colors duration-300 font-sans text-zinc-900 dark:text-zinc-50 antialiased">
              <DesktopNav 
                  options={NAV_OPTIONS}
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  onAddLog={() => handleOpenAddLog()}
                  onOpenSettings={() => setIsSettingsOpen(true)}
              />
              <div className="flex-1 flex flex-col overflow-hidden">
                  <header className="h-20 flex-shrink-0 flex items-center px-8 border-b border-zinc-200 dark:border-zinc-700/50">
                      <div>
                          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{greeting}</h1>
                          <p className="text-zinc-500 dark:text-zinc-400">Here is your academic command center.</p>
                      </div>
                  </header>
                  <main className="flex-1 overflow-y-auto p-8">
                      {renderContent()}
                  </main>
              </div>
              {renderModals()}
          </div>
      )
  }

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-900 transition-colors duration-300 flex flex-col">
      <header className="sticky top-0 z-30 bg-zinc-100/80 dark:bg-zinc-900/80 backdrop-blur-lg border-b border-zinc-900/10 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100">{greeting}</h1>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm">Welcome to Classdy</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleOpenAddLog()}
                className="w-9 h-9 flex items-center justify-center rounded-full text-zinc-600 bg-zinc-200/70 hover:bg-zinc-200 dark:text-zinc-300 dark:bg-zinc-700/80 dark:hover:bg-zinc-700 transition-colors"
                aria-label="Add new log"
              >
                <Plus size={22} />
              </button>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="w-9 h-9 flex items-center justify-center rounded-full text-zinc-600 bg-zinc-200/70 hover:bg-zinc-200 dark:text-zinc-300 dark:bg-zinc-700/80 dark:hover:bg-zinc-700 transition-colors"
                aria-label="Open settings"
              >
                <SettingsIcon size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full mb-16">
          {renderContent()}
      </main>
      
      <MobileNav 
          options={NAV_OPTIONS}
          activeTab={activeTab}
          onTabChange={setActiveTab}
      />
      
      {renderModals()}
    </div>
  );
}