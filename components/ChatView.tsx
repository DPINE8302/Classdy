
import React, { useState, useEffect, useRef } from 'react';
import type { Schedule, SubjectMeta, Settings as SettingsType } from '../types';
import { processQuestion } from '../lib/chat';
import { Bot, User, Send, Sparkles, MessageSquare } from 'lucide-react';

interface ChatViewProps {
    schedules: Schedule[];
    subjectMeta: SubjectMeta;
    settings: SettingsType;
}

interface Message {
    sender: 'user' | 'bot';
    text: string;
}

const CHAT_SUGGESTIONS = [
    "What's my schedule today?",
    "Do I have any homework?",
    "What's my next class?",
    "Show my weekly schedule",
    "ขอดูตารางเรียนวันพรุ่งนี้",
    "การบ้านที่ยังไม่เสร็จ",
];

export const ChatView: React.FC<ChatViewProps> = ({ schedules, subjectMeta, settings }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const assistantName = settings.assistantName || 'Bros';

    useEffect(() => {
        setMessages([{
            sender: 'bot',
            text: `Hello! I'm ${assistantName}. Ask me about your schedule, tasks, or anything else.`
        }]);
    }, [assistantName]);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = (query: string) => {
        if (query.trim() === '') return;

        const userMessage: Message = { sender: 'user', text: query };
        const botResponseText = processQuestion(query, schedules, subjectMeta);
        const botMessage: Message = {
            sender: 'bot',
            text: botResponseText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>')
        };

        setMessages(prev => [...prev, userMessage, botMessage]);
        setInput('');
        inputRef.current?.focus();
    };

    const WelcomeScreen = () => (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="p-4 bg-primary/10 rounded-full mb-4">
                 <MessageSquare size={40} className="text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-200">Welcome to {assistantName}</h2>
            <p className="text-zinc-500 dark:text-zinc-400 mt-2 max-w-sm">
                Your intelligent assistant is ready to help. Try asking a question or use one of the suggestions below.
            </p>
        </div>
    );

    return (
        <div className="flex flex-col h-full w-full bg-white dark:bg-zinc-800 rounded-2xl shadow-soft overflow-hidden">
            <main className="flex-1 flex flex-col relative overflow-hidden">
                {messages.length <= 1 ? (
                    <WelcomeScreen />
                ) : (
                    <div ref={chatContainerRef} className="flex-1 p-6 space-y-6 overflow-y-auto">
                        {messages.map((msg, index) => (
                             <div key={index} className={`flex items-start gap-4 max-w-xl ${msg.sender === 'user' ? 'self-end ml-auto' : 'self-start mr-auto'}`}>
                                {msg.sender === 'bot' && (
                                    <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-1">
                                        <Bot size={20} className="text-white" />
                                    </div>
                                )}
                                <div
                                    className={`p-4 rounded-t-2xl text-sm shadow-sm ${
                                        msg.sender === 'user' 
                                        ? 'bg-primary text-white rounded-bl-2xl' 
                                        : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-br-2xl'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: msg.text }}
                                />
                                {msg.sender === 'user' && (
                                    <div className="w-9 h-9 rounded-full bg-zinc-200 dark:bg-zinc-600 flex items-center justify-center flex-shrink-0 mt-1">
                                        <User size={18} className="text-zinc-600 dark:text-zinc-300" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
                
                <div className="p-4 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm border-t border-zinc-200 dark:border-zinc-700/50">
                     <div className="w-full overflow-x-auto pb-3 mb-3 -mx-4 px-4">
                        <div className="flex gap-2">
                             {CHAT_SUGGESTIONS.map(suggestion => (
                                <button
                                    key={suggestion}
                                    onClick={() => handleSend(suggestion)}
                                    className="flex-shrink-0 px-4 py-2 text-sm font-medium rounded-lg bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors flex items-center gap-2"
                                >
                                    <Sparkles size={16} className="text-amber-500" />
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="relative">
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') handleSend(input); }}
                            placeholder="Ask me anything..."
                            className="w-full rounded-xl border-zinc-300 dark:border-zinc-600 bg-zinc-100 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-inner focus:border-primary focus:ring-1 focus:ring-primary py-3 pl-4 pr-12 text-sm"
                        />
                        <button 
                            onClick={() => handleSend(input)} 
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-primary text-white hover:bg-primary-hover transition-colors disabled:bg-primary/50 disabled:cursor-not-allowed" 
                            aria-label="Send message"
                            disabled={!input.trim()}
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};