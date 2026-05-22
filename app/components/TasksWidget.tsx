'use client';
import { useState, useEffect } from 'react';
import { Task } from '@/app/types';
import { getTasks, saveTasks } from '@/app/lib/storage';

export default function TasksWidget() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    setTasks(getTasks());
  }, []);

  function persist(updated: Task[]) {
    setTasks(updated);
    saveTasks(updated);
  }

  function addTask() {
    if (!newTask.trim()) return;
    const task: Task = {
      id: Date.now().toString(),
      text: newTask.trim(),
      done: false,
      createdAt: new Date().toISOString(),
    };
    persist([...tasks, task]);
    setNewTask('');
    setAdding(false);
  }

  function toggleTask(id: string) {
    persist(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  }

  function deleteTask(id: string) {
    persist(tasks.filter(t => t.id !== id));
  }

  const active = tasks.filter(t => !t.done);
  const done = tasks.filter(t => t.done);

  return (
    <div className="card fade-up delay-4">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Tasks
          </span>
          {active.length > 0 && (
            <span style={{
              background: 'var(--accent-dim)',
              color: 'var(--accent)',
              fontSize: '11px',
              padding: '2px 7px',
              borderRadius: '10px',
              border: '1px solid rgba(200,169,110,0.2)',
            }}>
              {active.length}
            </span>
          )}
        </div>
        <button className="btn-ghost" onClick={() => setAdding(true)}>+ Add</button>
      </div>

      {adding && (
        <div style={{ marginBottom: '12px' }}>
          <input
            type="text"
            autoFocus
            value={newTask}
            onChange={e => setNewTask(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') addTask(); if (e.key === 'Escape') setAdding(false); }}
            placeholder="What needs doing?"
            style={{ marginBottom: '8px' }}
          />
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn" onClick={addTask}>Add task</button>
            <button className="btn-ghost" onClick={() => setAdding(false)}>Cancel</button>
          </div>
        </div>
      )}

      {tasks.length === 0 && !adding && (
        <div style={{ color: 'var(--muted)', fontSize: '13px', padding: '8px 0' }}>
          No tasks yet — clear day ahead.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {active.map(task => (
          <TaskRow key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} />
        ))}
        {done.length > 0 && active.length > 0 && (
          <div style={{ height: '1px', background: 'var(--border)', margin: '8px 0' }} />
        )}
        {done.map(task => (
          <TaskRow key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} />
        ))}
      </div>
    </div>
  );
}

function TaskRow({ task, onToggle, onDelete }: {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '8px 0',
        borderRadius: '6px',
        transition: 'all 0.15s',
      }}
    >
      <span
        onClick={() => onToggle(task.id)}
        style={{
          width: '16px',
          height: '16px',
          borderRadius: '4px',
          border: task.done ? '2px solid var(--green)' : '2px solid var(--border)',
          background: task.done ? 'var(--green)' : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          flexShrink: 0,
          transition: 'all 0.15s',
        }}
      >
        {task.done && (
          <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
            <path d="M1 3.5L3.5 6L8 1" stroke="var(--bg)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </span>
      <span style={{
        flex: 1,
        fontSize: '14px',
        color: task.done ? 'var(--muted)' : 'var(--text)',
        textDecoration: task.done ? 'line-through' : 'none',
        fontWeight: 300,
      }}>
        {task.text}
      </span>
      {hovered && (
        <span
          onClick={() => onDelete(task.id)}
          style={{ color: 'var(--muted)', cursor: 'pointer', fontSize: '16px', lineHeight: 1, transition: 'color 0.15s' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--red)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
        >
          ×
        </span>
      )}
    </div>
  );
}
