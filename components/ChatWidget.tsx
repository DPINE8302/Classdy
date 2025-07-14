
import React, { useState, useEffect, useRef } from 'react';
import type { Schedule, SubjectMeta, Settings as SettingsType } from '../types';
import { processQuestion } from '../lib/chat';
import { Bot, User, Send } from 'lucide-react';
import { Card } from './shared/Card';

interface ChatWidgetProps {
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
    "ตารางเรียนวันนี้",
    "What's my next class?",
    "การบ้านมีอะไรบ้าง",
    "Do I have Math tomorrow?",
    "พรุ่งนี้มีเรียนคณิตไหม",
];

export const ChatWidget: React.FC<ChatWidgetProps> = ({ schedules, subjectMeta, settings }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const assistantName = settings.assistantName || 'Bros';

    useEffect(() => {
        setMessages([{
            sender: 'bot',
            text: `Hello! I'm your ${assistantName} assistant. Ask me anything about your schedule or tasks.`
        }]);
    }, [assistantName]);

    useEffect(() => {
        // Scroll to bottom when new messages are added
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = () => {
        if (input.trim() === '') return;

        const userMessage: Message = { sender: 'user', text: input };
        const botResponseText = processQuestion(input, schedules, subjectMeta);
        const botMessage: Message = {
            sender: 'bot',
            text: botResponseText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>')
        };

        setMessages(prev => [...prev, userMessage, botMessage]);
        setInput('');
    };

    const handleSuggestionClick = (suggestion: string) => {
        setInput(suggestion);
        // We need to trigger handleSend after state update
        // A simple way is to process it directly
        const userMessage: Message = { sender: 'user', text: suggestion };
        const botResponseText = processQuestion(suggestion, schedules, subjectMeta);
        const botMessage: Message = {
            sender: 'bot',
            text: botResponseText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>')
        };
        setMessages(prev => [...prev, userMessage, botMessage]);
        setInput('');
    };


    return (
        <Card className="w-full max-w-2xl mx-auto p-0 flex flex-col" style={{height: '70vh'}}>
             <div className="flex justify-between items-center p-4 border-b border-zinc-200 dark:border-zinc-700">
                <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                    <Bot size={20} /> {assistantName}
                </h3>
            </div>
            <div ref={chatContainerRef} className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.sender === 'bot' && <Bot size={24} className="text-primary flex-shrink-0 mt-1" />}
                        <div
                            className={`p-3 rounded-2xl max-w-md break-words text-sm ${
                                msg.sender === 'user' 
                                ? 'bg-primary text-white' 
                                : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200'
                            }`}
                            dangerouslySetInnerHTML={{ __html: msg.text }}
                        />
                         {msg.sender === 'user' && <User size={24} className="text-zinc-500 flex-shrink-0 mt-1" />}
                    </div>
                ))}
            </div>
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-700">
                 <div className="flex flex-wrap gap-2 mb-3">
                    {CHAT_SUGGESTIONS.map(suggestion => (
                        <button key={suggestion} onClick={() => handleSuggestionClick(suggestion)} className="px-3 py-1.5 text-xs font-semibold rounded-full bg-zinc-200/80 dark:bg-zinc-700/80 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors">
                            {suggestion}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                        placeholder="Ask me anything..."
                        className="flex-grow w-full rounded-lg border-zinc-300 dark:border-zinc-600 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm"
                    />
                    <button onClick={handleSend} className="p-2.5 rounded-lg bg-primary text-white hover:bg-primary-hover transition-colors" aria-label="Send message">
                        <Send size={20} />
                    </button>
                </div>
            </div>
        </Card>
    );
};