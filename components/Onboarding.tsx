import { useState } from 'react';
import { CalendarDays, GraduationCap } from 'lucide-react';
import type { DayOfWeek, Schedule } from '../types';
import { DAYS_OF_WEEK } from '../constants';

export function Onboarding({ onComplete }: { onComplete: (schedule: Schedule) => void }) {
  const [name, setName] = useState('My term');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [subject, setSubject] = useState('');
  const [day, setDay] = useState<DayOfWeek>(1);
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('09:00');
  const [room, setRoom] = useState('');
  const [teacher, setTeacher] = useState('');
  const [error, setError] = useState('');
  const input = 'w-full rounded-xl border-zinc-300 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-800';
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !startDate || !endDate || endDate < startDate) return setError('Add a name and a valid term date range.');
    if (subject.trim() && endTime <= startTime) return setError('Class end time must be after its start time.');
    const id = `schedule-${Date.now()}`;
    onComplete({ id, name: name.trim(), startDate, endDate, rules: DAYS_OF_WEEK.map(({ value }) => ({ dayOfWeek: value, classes: value === day && subject.trim() ? [{ id: `${id}-first`, subject: subject.trim(), startTime, endTime, room: room.trim() || undefined, teacher: teacher.trim() || undefined, tasks: [] }] : [] })) });
  };
  return <main className="min-h-screen bg-zinc-100 px-4 py-10 dark:bg-zinc-900 sm:py-16">
    <form onSubmit={submit} className="mx-auto max-w-3xl rounded-3xl bg-white p-6 shadow-soft dark:bg-zinc-800 sm:p-10">
      <div className="mb-8 flex items-start gap-4"><div className="rounded-2xl bg-primary/10 p-3 text-primary"><GraduationCap /></div><div><p className="text-sm font-semibold text-primary">Welcome to Classdy</p><h1 className="text-3xl font-bold">Build your first term</h1><p className="mt-2 text-zinc-500">Start with one class. You can add subjects and the rest of your week after setup.</p></div></div>
      <fieldset className="grid gap-4 sm:grid-cols-2"><legend className="mb-3 text-lg font-semibold">Term details</legend><label>Schedule name<input className={input} value={name} onChange={(e) => setName(e.target.value)} required /></label><span /><label>Start date<input type="date" className={input} value={startDate} onChange={(e) => setStartDate(e.target.value)} required /></label><label>End date<input type="date" className={input} value={endDate} onChange={(e) => setEndDate(e.target.value)} required /></label></fieldset>
      <fieldset className="mt-8 grid gap-4 sm:grid-cols-2"><legend className="mb-1 text-lg font-semibold">First class <span className="text-sm font-normal text-zinc-500">(optional)</span></legend><label className="sm:col-span-2">Subject<input className={input} value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Mathematics / คณิตศาสตร์" /></label><label>Day<select className={input} value={day} onChange={(e) => setDay(Number(e.target.value) as DayOfWeek)}>{DAYS_OF_WEEK.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label><label>Room<input className={input} value={room} onChange={(e) => setRoom(e.target.value)} /></label><label>Starts<input type="time" className={input} value={startTime} onChange={(e) => setStartTime(e.target.value)} /></label><label>Ends<input type="time" className={input} value={endTime} onChange={(e) => setEndTime(e.target.value)} /></label><label className="sm:col-span-2">Teacher<input className={input} value={teacher} onChange={(e) => setTeacher(e.target.value)} /></label></fieldset>
      {error ? <p role="alert" className="mt-4 text-sm text-danger">{error}</p> : null}<button className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-primary p-3.5 font-semibold text-white hover:bg-primary-hover"><CalendarDays size={19}/>Create my dashboard</button>
    </form>
  </main>;
}
