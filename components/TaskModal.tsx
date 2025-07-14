
import React, { useState, useEffect } from 'react';
import type { Schedule, Task, DayOfWeek, SubjectMeta, ClassSession } from '../types';
import { Modal } from './shared/Modal';
import { Plus, Trash2 } from 'lucide-react';

interface TaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    schedule: Schedule;
    dayOfWeek: DayOfWeek;
    classId: string;
    onUpdateTasks: (scheduleId: string, dayOfWeek: DayOfWeek, classId: string, newTasks: Task[]) => void;
    subjectMeta: SubjectMeta;
}

export const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, schedule, dayOfWeek, classId, onUpdateTasks, subjectMeta }) => {
    const [currentClass, setCurrentClass] = useState<ClassSession | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [newTaskText, setNewTaskText] = useState('');

    useEffect(() => {
        if (isOpen) {
            const rule = schedule.rules.find(r => r.dayOfWeek === dayOfWeek);
            const classSession = rule?.classes.find(c => c.id === classId);
            if (classSession) {
                setCurrentClass(classSession);
                setTasks(classSession.tasks);
            }
        } else {
            // Reset state on close
            setCurrentClass(null);
            setTasks([]);
            setNewTaskText('');
        }
    }, [isOpen, schedule, dayOfWeek, classId]);

    const handleAddTask = () => {
        if (newTaskText.trim() === '') return;
        const newTask: Task = {
            id: `task-${Date.now()}`,
            text: newTaskText.trim(),
            completed: false,
        };
        const updatedTasks = [...tasks, newTask];
        setTasks(updatedTasks);
        onUpdateTasks(schedule.id, dayOfWeek, classId, updatedTasks);
        setNewTaskText('');
    };

    const handleToggleTask = (taskId: string) => {
        const updatedTasks = tasks.map(task =>
            task.id === taskId ? { ...task, completed: !task.completed } : task
        );
        setTasks(updatedTasks);
        onUpdateTasks(schedule.id, dayOfWeek, classId, updatedTasks);
    };

    const handleDeleteTask = (taskId: string) => {
        const updatedTasks = tasks.filter(task => task.id !== taskId);
        setTasks(updatedTasks);
        onUpdateTasks(schedule.id, dayOfWeek, classId, updatedTasks);
    };

    if (!currentClass) return null;

    const meta = subjectMeta[currentClass.subject] || { color: '#cccccc', icon: '📚' };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Tasks for ${currentClass.subject}`}>
            <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                    <span className="text-2xl">{meta.icon}</span>
                    <h3 className="font-semibold text-lg text-zinc-800 dark:text-zinc-200">{currentClass.subject}</h3>
                </div>
                
                <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                    {tasks.length > 0 ? tasks.map(task => (
                        <div key={task.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-800/50 group">
                           <input
                                type="checkbox"
                                id={`task-${task.id}`}
                                checked={task.completed}
                                onChange={() => handleToggleTask(task.id)}
                                className="h-5 w-5 rounded border-zinc-300 text-primary focus:ring-primary"
                            />
                            <label htmlFor={`task-${task.id}`} className={`flex-1 text-sm ${task.completed ? 'line-through text-zinc-500' : 'text-zinc-800 dark:text-zinc-200'}`}>
                                {task.text}
                            </label>
                            <button onClick={() => handleDeleteTask(task.id)} className="text-zinc-400 hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    )) : (
                        <p className="text-center text-zinc-500 dark:text-zinc-400 py-4">No tasks for this class. Add one below!</p>
                    )}
                </div>

                <div className="flex gap-2 pt-4 border-t border-zinc-200 dark:border-zinc-700">
                    <input
                        type="text"
                        value={newTaskText}
                        onChange={(e) => setNewTaskText(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleAddTask(); }}
                        placeholder="Add a new task..."
                        className="flex-grow w-full rounded-lg border-zinc-300 dark:border-zinc-600 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm"
                    />
                    <button
                        onClick={handleAddTask}
                        className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-hover focus:outline-none"
                    >
                        <Plus size={16} className="mr-1"/> Add
                    </button>
                </div>
            </div>
        </Modal>
    );
};
