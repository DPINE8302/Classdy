
import React, { useState, useEffect, useRef } from 'react';
import type { Schedule, SubjectMeta, Settings as SettingsType, ChatResponse, InteractiveSchedulePayload, InteractiveTasksPayload } from '../types';
import { processQuestion, translations } from '../lib/chat';
import { Bot, User, Send } from 'lucide-react';
import { formatTime } from '../lib/utils';

type Language = 'en' | 'th';

interface ChatWidgetProps {
    schedules: Schedule[];
    subjectMeta: SubjectMeta;
    settings: SettingsType;
    lang: Language;
}

interface Message {
    sender: 'user' | 'bot';
    text: string;
}

const TypingIndicator = () => (
    <div className="flex items-end gap-2 p-4">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <Bot size={18} className="text-white" />
        </div>
        <div className="px-4 py-3 rounded-t-2xl rounded-br-2xl bg-zinc-200 dark:bg-zinc-700 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce " style={{animationDelay: '0s'}}></span>
            <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce " style={{animationDelay: '0.2s'}}></span>
            <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce " style={{animationDelay: '0.4s'}}></span>
        </div>
    </div>
);


export const ChatWidget: React.FC<ChatWidgetProps> = ({ schedules, subjectMeta, settings, lang }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const assistantName = settings.assistantName || 'Bros';
    const t = translations[lang];

    useEffect(() => {
        setMessages([{
            sender: 'bot',
            text: t.welcomeMessage.replace('{{name}}', assistantName)
        }]);
    }, [assistantName, lang, t.welcomeMessage]);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSend = (query: string) => {
        if (query.trim() === '' || isTyping) return;

        const userMessage: Message = { sender: 'user', text: query };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);
        
        setTimeout(() => {
            const botResponse = processQuestion(query, schedules, subjectMeta, lang);
            let botResponseText = '';

            if (botResponse.type === 'text') {
                botResponseText = botResponse.payload as string;
            } else if (botResponse.type === 'schedule') {
                const payload = botResponse.payload as InteractiveSchedulePayload;
                if (payload.classes.length === 0) {
                    botResponseText = t.responses.noClassesOnDay.replace('{{day}}', payload.dayName);
                } else {
                    let scheduleString = `<strong>${t.scheduleHeader.replace('{{day}}', payload.dayName)}</strong><br/>`;
                    payload.classes.forEach(cls => {
                        const meta = subjectMeta[cls.subject] || { icon: '📚' };
                        const flippedText = cls.isOnline ? ` ${t.responses.flipped}`: '';
                        scheduleString += `${meta.icon} ${cls.subject} (${formatTime(cls.startTime)} - ${formatTime(cls.endTime)})${flippedText}<br/>`;
                    });
                    botResponseText = scheduleString;
                }
            } else if (botResponse.type === 'tasks') {
                const payload = botResponse.payload as InteractiveTasksPayload;
                if (payload.tasks.length === 0) {
                    botResponseText = payload.title.includes(translations.en.pendingTaskHeader) ? t.responses.allTasksDone : t.responses.noTasksFound.replace('{{subject}}', 'any subject').replace('{{day}}', 'any day');
                } else {
                     let tasksString = `<strong>${payload.title}</strong><br/>`;
                     const groupedTasks = payload.tasks.reduce((acc, task) => {
                        const key = `${task.day} - ${task.subject}`;
                        if (!acc[key]) acc[key] = { day: task.day, subject: task.subject, tasks: [] };
                        acc[key].tasks.push(task);
                        return acc;
                    }, {} as Record<string, { day: string; subject: string; tasks: typeof payload.tasks }>);

                    Object.values(groupedTasks).forEach(group => {
                         tasksString += `<br/><strong>${group.subject} (${t.dayNames[group.day as keyof typeof t.dayNames]})</strong><br/>`;
                         group.tasks.forEach(task => {
                             tasksString += `• ${task.text} ${task.completed ? `(${lang === 'th' ? 'เสร็จแล้ว' : 'Done'})` : ''}<br/>`;
                         });
                    });
                    botResponseText = tasksString;
                }
            }

            const botMessage: Message = {
                sender: 'bot',
                text: botResponseText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>')
            };

            setMessages(prev => [...prev, botMessage]);
            setIsTyping(false);
        }, 800 + Math.random() * 500);
    };

    return (
        <div className="w-full h-full flex flex-col bg-white dark:bg-zinc-800/50 rounded-2xl shadow-soft">
            <header className="flex-shrink-0 p-4 border-b border-zinc-200 dark:border-zinc-700/50">
                <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                    <Bot size={20} className="text-primary"/> {assistantName}
                </h3>
            </header>
            
            <main ref={chatContainerRef} className="flex-1 overflow-y-auto">
                 <div className="p-4 space-y-6">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.sender === 'bot' && (
                                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                                    <Bot size={18} className="text-white" />
                                </div>
                            )}
                            <div
                                className={`p-3 rounded-2xl max-w-xs sm:max-w-sm break-words text-sm shadow-sm ${
                                    msg.sender === 'user' 
                                    ? 'bg-primary text-white rounded-br-none' 
                                    : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-bl-none'
                                }`}
                                dangerouslySetInnerHTML={{ __html: msg.text }}
                            />
                             {msg.sender === 'user' && (
                                <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-600 flex items-center justify-center flex-shrink-0">
                                    <User size={16} className="text-zinc-600 dark:text-zinc-300"/>
                                </div>
                             )}
                        </div>
                    ))}
                    {isTyping && <TypingIndicator />}
                 </div>
            </main>

            <footer className="flex-shrink-0 p-3 border-t border-zinc-200 dark:border-zinc-700/50 space-y-3">
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    {t.quickQuestions.map(q => (
                        <button 
                            key={q.prompt}
                            onClick={() => handleSend(q.prompt)} 
                            disabled={isTyping}
                            className="px-3 py-1.5 text-xs font-medium rounded-full bg-zinc-200/80 dark:bg-zinc-700/80 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors flex-shrink-0 whitespace-nowrap disabled:opacity-50"
                        >
                            {q.title}
                        </button>
                    ))}
                </div>
                 <div className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSend(input)}
                        placeholder={t.inputPlaceholder.replace('{{name}}', assistantName)}
                        disabled={isTyping}
                        className="w-full rounded-full border-zinc-300 dark:border-zinc-600 bg-zinc-100 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 shadow-inner focus:border-primary focus:ring-1 focus:ring-primary py-3 pl-5 pr-14"
                    />
                    <button
                        onClick={() => handleSend(input)}
                        disabled={!input.trim() || isTyping}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-primary text-white hover:bg-primary-hover transition-colors disabled:bg-primary/50 disabled:cursor-not-allowed"
                        aria-label="Send message"
                    >
                        <Send size={18} />
                    </button>
                </div>
            </footer>
        </div>
    );
};
