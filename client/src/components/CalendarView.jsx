import React, { useState } from 'react';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarView({ tasks }) {
  const [current, setCurrent] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  function prevMonth() {
    setCurrent(({ year, month }) => month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 });
  }
  function nextMonth() {
    setCurrent(({ year, month }) => month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 });
  }

  const { year, month } = current;
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date().toDateString();

  // Index tasks by date string (YYYY-MM-DD)
  const tasksByDate = {};
  tasks.forEach((t) => {
    if (!t.dueDate) return;
    const key = t.dueDate.slice(0, 10);
    if (!tasksByDate[key]) tasksByDate[key] = [];
    tasksByDate[key].push(t);
  });

  const cells = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  // Pad to full weeks
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="calendar">
      <div className="calendar-nav">
        <button onClick={prevMonth}>‹</button>
        <h3>{new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
        <button onClick={nextMonth}>›</button>
      </div>
      <div className="calendar-grid">
        {DAYS.map((d) => <div key={d} className="calendar-day-header">{d}</div>)}
        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} className="calendar-cell empty" />;
          const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const dayTasks = tasksByDate[dateKey] || [];
          const isToday = new Date(year, month, day).toDateString() === today;
          return (
            <div key={dateKey} className={`calendar-cell${isToday ? ' today' : ''}${dayTasks.length ? ' has-tasks' : ''}`}>
              <span className="calendar-day-num">{day}</span>
              <div className="calendar-tasks">
                {dayTasks.slice(0, 3).map((t) => (
                  <div key={t.id} className={`calendar-task-chip${t.completed ? ' done' : ''} priority-bg-${t.priority}`}>
                    {t.title}
                  </div>
                ))}
                {dayTasks.length > 3 && <div className="calendar-task-chip more">+{dayTasks.length - 3} more</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
