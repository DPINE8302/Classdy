
import React, { useState, useEffect, useRef } from 'react';
import type { Schedule, SubjectMeta, Settings as SettingsType, ChatResponse, InteractiveSchedulePayload, InteractiveTasksPayload, ClassSession } from '../types';
import { processQuestion, translations } from '../lib/chat';
import { Bot, User, Send, MessageSquareText, HelpCircle, Check, BookOpen } from 'lucide-react';
import { formatTime, getContrastingTextColor } from '../lib/utils';
import { Card } from './shared/Card';

type Language = 'en' | 'th';

interface ChatViewProps {
    schedules: Schedule[];
    subjectMeta: SubjectMeta;
    settings: SettingsType;
    lang: Language;
}

interface Message {
    sender: 'user' | 'bot';
    response: ChatResponse;
}

const TypingIndicator = () => (
    <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <Bot size={20} className="text-white" />
        </div>
        <div className="px-4 py-3 rounded-t-2xl rounded-br-2xl bg-zinc-100 dark:bg-zinc-700 flex items-center gap-1.5">
            <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce " style={{animationDelay: '0s'}}></span>
            <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce " style={{animationDelay: '0.2s'}}></span>
            <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce " style={{animationDelay: '0.4s'}}></span>
        </div>
    </div>
);

export const ChatView: React.FC<ChatViewProps> = ({ schedules, subjectMeta, settings, lang }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const assistantName = settings.assistantName || 'Bros';
    const t = translations[lang];
    
    const CHAT_SUGGESTIONS = [
        { title: t.quickQuestions[0].title, prompt: t.quickQuestions[0].prompt, icon: <MessageSquareText /> },
        { title: t.quickQuestions[1].title, prompt: t.quickQuestions[1].prompt, icon: <Check /> },
        { title: t.quickQuestions[2].title, prompt: t.quickQuestions[2].prompt, icon: <HelpCircle /> },
        { title: t.quickQuestions[3].title, prompt: t.quickQuestions[3].prompt, icon: <BookOpen /> },
    ];

    const ScheduleCard: React.FC<{ payload: InteractiveSchedulePayload, subjectMeta: SubjectMeta }> = ({ payload, subjectMeta }) => {
        return (
            <Card className="p-4 bg-zinc-100 dark:bg-zinc-700/80 shadow-none border border-zinc-200 dark:border-zinc-600/50 w-full">
                <h4 className="font-bold text-zinc-800 dark:text-zinc-200 mb-3">{t.scheduleHeader.replace('{{day}}', payload.dayName)}</h4>
                <ul className="space-y-2">
                    {payload.classes.map(cls => {
                        const meta = subjectMeta[cls.subject] || { color: '#cccccc', icon: '📚' };
                        return (
                             <li key={cls.id} className="flex items-center gap-3 text-sm">
                                <span className="w-8 h-8 flex items-center justify-center rounded-lg text-lg" style={{backgroundColor: meta.color, color: getContrastingTextColor(meta.color)}}>{meta.icon}</span>
                                <div className="flex-1">
                                    <p className="font-semibold text-zinc-800 dark:text-zinc-200">{cls.subject}{cls.isOnline && <span className="text-xs ml-2 text-primary font-medium">{t.responses.flipped}</span>}</p>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{formatTime(cls.startTime)} - {formatTime(cls.endTime)}</p>
                                </div>
                            </li>
                        )
                    })}
                </ul>
            </Card>
        );
    }
    
    const TasksCard: React.FC<{ payload: InteractiveTasksPayload, subjectMeta: SubjectMeta }> = ({ payload, subjectMeta }) => {
        const groupedTasks = payload.tasks.reduce((acc, task) => {
            const key = `${task.day} - ${task.subject}`;
            if (!acc[key]) {
                acc[key] = { day: task.day, subject: task.subject, tasks: [] };
            }
            acc[key].tasks.push(task);
            return acc;
        }, {} as Record<string, { day: string; subject: string; tasks: typeof payload.tasks }>);
        
        return (
            <Card className="p-4 bg-zinc-100 dark:bg-zinc-700/80 shadow-none border border-zinc-200 dark:border-zinc-600/50 w-full">
                <h4 className="font-bold text-zinc-800 dark:text-zinc-200 mb-3">{payload.title}</h4>
                <div className="space-y-3">
                    {Object.values(groupedTasks).map(group => {
                         const meta = subjectMeta[group.subject] || { color: '#cccccc', icon: '📚' };
                         const displayDay = t.dayNames[group.day as keyof typeof t.dayNames] || group.day;
                         return (
                            <div key={group.subject + group.day}>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="w-2 h-2 rounded-full" style={{backgroundColor: meta.color}}></span>
                                    <p className="font-semibold text-sm text-zinc-700 dark:text-zinc-300">{group.subject} <span className="text-xs font-normal text-zinc-500">({displayDay})</span></p>
                                </div>
                                <ul className="pl-5 space-y-1">
                                    {group.tasks.map((task, idx) => (
                                        <li key={idx} className="text-sm text-zinc-600 dark:text-zinc-400 list-disc list-outside">
                                            {task.text} {task.completed && <span className="text-xs text-green-500">({lang === 'th' ? 'เสร็จแล้ว' : 'Done'})</span>}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                         )
                    })}
                </div>
            </Card>
        )
    }

    useEffect(() => {
        const getInitialMessage = () => ({
            sender: 'bot' as const,
            response: { type: 'text' as const, payload: t.welcomeMessage.replace('{{name}}', assistantName)}
        });
        setMessages([getInitialMessage()]);
    }, [assistantName, lang, t.welcomeMessage]);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSend = (query: string) => {
        if (query.trim() === '' || isTyping) return;

        const userMessage: Message = { sender: 'user', response: {type: 'text', payload: query }};
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        setTimeout(() => {
            const botResponse = processQuestion(query, schedules, subjectMeta, lang);
            const botMessage: Message = { sender: 'bot', response: botResponse };
            if (botResponse.type === 'text') {
                botResponse.payload = (botResponse.payload as string).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>');
            }
            setMessages(prev => [...prev, botMessage]);
            setIsTyping(false);
            inputRef.current?.focus();
        }, 800 + Math.random() * 500);
    };

    return (
        <div className="flex flex-col h-full w-full bg-white dark:bg-zinc-800 rounded-2xl shadow-soft overflow-hidden">
            <main className="flex-1 flex flex-col min-h-0">
                {messages.length <= 1 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 sm:p-12 animate-fade-in">
                        <div className="p-5 bg-primary/10 rounded-full mb-6">
                            <MessageSquareText size={32} strokeWidth={1.5} className="text-primary" />
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-800 dark:text-zinc-200">
                           {t.welcomeTitle.replace('{{name}}', assistantName)}
                        </h2>
                        <p className="text-zinc-500 dark:text-zinc-400 mt-3 max-w-md text-sm sm:text-base">
                           {t.welcomeSubtitle}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 w-full max-w-2xl">
                            {CHAT_SUGGESTIONS.map(suggestion => (
                                <button key={suggestion.title} onClick={() => handleSend(suggestion.prompt)} className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-700/50 transition-all text-left flex items-center gap-4 group">
                                    <div className="p-2 bg-white dark:bg-zinc-700/50 rounded-lg text-primary group-hover:scale-110 transition-transform">
                                        {React.cloneElement(suggestion.icon, { size: 20 })}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-zinc-800 dark:text-zinc-200">{suggestion.title}</h3>
                                        <p className="text-sm text-zinc-500 dark:text-zinc-400 hidden sm:block">{suggestion.prompt}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div ref={chatContainerRef} className="flex-1 p-4 sm:p-6 space-y-6 overflow-y-auto">
                        {messages.map((msg, index) => (
                             <div key={index} className={`flex items-start gap-4 max-w-xl w-fit ${msg.sender === 'user' ? 'ml-auto' : ''}`}>
                                {msg.sender === 'bot' && (
                                    <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-1">
                                        <Bot size={20} className="text-white" />
                                    </div>
                                )}
                                <div
                                    className={`rounded-t-2xl text-sm shadow-sm flex flex-col gap-2 ${
                                        msg.sender === 'user' 
                                        ? 'bg-primary text-white rounded-bl-2xl px-4 py-3' 
                                        : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-br-2xl'
                                    } ${msg.response.type === 'text' ? 'px-4 py-3' : 'p-0 bg-transparent dark:bg-transparent shadow-none'}`
                                    }
                                >
                                    {msg.response.type === 'schedule' ? <ScheduleCard payload={msg.response.payload as InteractiveSchedulePayload} subjectMeta={subjectMeta} />
                                    : msg.response.type === 'tasks' ? <TasksCard payload={msg.response.payload as InteractiveTasksPayload} subjectMeta={subjectMeta} />
                                    : <div dangerouslySetInnerHTML={{ __html: msg.response.payload as string }} />
                                    }
                                </div>
                                {msg.sender === 'user' && (
                                    <div className="w-9 h-9 rounded-full bg-zinc-200 dark:bg-zinc-600 flex items-center justify-center flex-shrink-0 mt-1">
                                        <User size={18} className="text-zinc-600 dark:text-zinc-300" />
                                    </div>
                                )}
                            </div>
                        ))}
                        {isTyping && <TypingIndicator />}
                    </div>
                )}
                
                <div className="p-4 sm:p-6 border-t border-zinc-200 dark:border-zinc-700/50">
                    {messages.length > 1 && !isTyping && (
                        <div className="mb-4 animate-fade-in">
                            <h4 className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400 tracking-wider mb-2">{t.quickQuestionsHeader}</h4>
                            <div className="flex flex-wrap gap-2">
                                {t.quickQuestions.map(suggestion => (
                                    <button
                                        key={suggestion.prompt}
                                        onClick={() => handleSend(suggestion.prompt)}
                                        disabled={isTyping}
                                        className="px-3 py-1.5 text-xs font-semibold rounded-full bg-zinc-200/80 dark:bg-zinc-700/80 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors disabled:opacity-50"
                                    >
                                        {suggestion.title}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    <div className="relative">
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') handleSend(input); }}
                            placeholder={t.inputPlaceholder.replace('{{name}}', assistantName)}
                            className="w-full rounded-xl border-zinc-300 dark:border-zinc-600 bg-zinc-100 dark:bg-zinc-700/50 text-zinc-900 dark:text-zinc-100 shadow-inner focus:border-primary focus:ring-1 focus:ring-primary py-3 pl-4 pr-14 text-base"
                            disabled={isTyping}
                        />
                        <button 
                            onClick={() => handleSend(input)} 
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-primary text-white hover:bg-primary-hover transition-colors disabled:bg-primary/50 disabled:cursor-not-allowed" 
                            aria-label="Send message"
                            disabled={!input.trim() || isTyping}
                        >
                            <Send size={20} />
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};
