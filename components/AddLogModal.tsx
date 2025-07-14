
import React, { useState, useEffect } from 'react';
import type { AttendanceLog } from '../types';
import { Modal } from './shared/Modal';
import { Trash2 } from 'lucide-react';

interface AddLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (log: Omit<AttendanceLog, 'id'>) => void;
  onDelete: (logId: string) => void;
  log: AttendanceLog | null;
}

export const AddLogModal: React.FC<AddLogModalProps> = ({ isOpen, onClose, onSave, onDelete, log }) => {
  const [date, setDate] = useState('');
  const [arrivalTime, setArrivalTime] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [statusTag, setStatusTag] = useState<'None' | 'Absent' | 'Holiday'>('None');

  useEffect(() => {
    if (log) {
      setDate(log.date);
      setArrivalTime(log.arrivalTime || '');
      setDepartureTime(log.departureTime || '');
      setStatusTag(log.statusTag || 'None');
    } else {
      const today = new Date();
      setDate(today.toISOString().split('T')[0]);
      const nowTime = today.toTimeString().slice(0, 5);
      setArrivalTime(nowTime);
      setDepartureTime('');
      setStatusTag('None');
    }
  }, [log, isOpen]);

  const handleSave = () => {
    if (!date) return;
    onSave({
      date,
      arrivalTime: statusTag !== 'None' ? null : arrivalTime || null,
      departureTime: statusTag !== 'None' ? null : departureTime || null,
      statusTag: statusTag === 'None' ? undefined : statusTag,
    });
    onClose();
  };
  
  const handleDelete = () => {
    if(log && window.confirm('Are you sure you want to delete this log?')) {
        onDelete(log.id);
        onClose();
    }
  }

  const inputClasses = "mt-1 block w-full rounded-lg border-zinc-300 dark:border-zinc-600 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm";
  const labelClasses = "block text-sm font-medium text-zinc-700 dark:text-zinc-300";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={log ? 'Edit Attendance Log' : 'Add Attendance Log'}>
      <div className="space-y-6">
        <div>
          <label htmlFor="date" className={labelClasses}>Date</label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={inputClasses}
            style={{ colorScheme: 'dark' }}
          />
        </div>

        <div>
           <label htmlFor="statusTag" className={labelClasses}>Status Tag</label>
           <select
             id="statusTag"
             value={statusTag}
             onChange={(e) => setStatusTag(e.target.value as 'None' | 'Absent' | 'Holiday')}
             className={inputClasses}
           >
             <option value="None">Normal</option>
             <option value="Absent">Absent</option>
             <option value="Holiday">Holiday</option>
           </select>
         </div>

        {statusTag === 'None' && (
          <>
            <div>
              <label htmlFor="arrivalTime" className={labelClasses}>Arrival Time</label>
              <input
                type="time"
                id="arrivalTime"
                value={arrivalTime}
                onChange={(e) => setArrivalTime(e.target.value)}
                className={inputClasses}
                style={{ colorScheme: 'dark' }}
              />
            </div>
            <div>
              <label htmlFor="departureTime" className={labelClasses}>Departure Time (Optional)</label>
              <input
                type="time"
                id="departureTime"
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
                className={inputClasses}
                style={{ colorScheme: 'dark' }}
              />
            </div>
          </>
        )}
        
        <div className="flex justify-between items-center pt-4">
          <div>
            {log && (
                <button
                onClick={handleDelete}
                className="inline-flex items-center justify-center rounded-lg bg-danger/10 px-4 py-2 text-sm font-medium text-danger-dark hover:bg-danger/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-danger"
                >
                <Trash2 size={16} className="mr-2"/>
                Delete
                </button>
            )}
          </div>
          <div className="flex justify-end gap-3">
            <button
                type="button"
                onClick={onClose}
                className="rounded-lg border-none bg-zinc-200 dark:bg-zinc-700 py-2 px-4 text-sm font-medium text-zinc-800 dark:text-zinc-200 shadow-sm hover:bg-zinc-300 dark:hover:bg-zinc-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
                Cancel
            </button>
            <button
              onClick={handleSave}
              className="inline-flex justify-center rounded-lg border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
