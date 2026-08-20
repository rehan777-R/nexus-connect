import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, updateDoc, doc, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useToast } from '../Toast';
import { PRIORITY_COLORS, Badge, dueDateInfo } from './taskBadges';
import type { Task, TaskStatus } from '../types';

const COLUMNS: { status: TaskStatus; accent: string }[] = [
  { status: 'To Do', accent: 'var(--text-secondary)' },
  { status: 'In Progress', accent: '#3B82F6' },
  { status: 'Done', accent: '#22C55E' },
];

function Board() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<TaskStatus | null>(null);
  const { currentUser, userRole } = useAuth();
  const showToast = useToast();

  useEffect(() => {
    if (!currentUser) return;
    // Scope the query server-side: security rules only allow reading your
    // own tasks unless you're an admin.
    const ref = collection(db, 'items');
    const q = userRole === 'admin' ? ref : query(ref, where('createdBy', '==', currentUser.uid));
    const unsub = onSnapshot(q, (snapshot) => {
      setTasks(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Task)));
    });
    return () => unsub();
  }, [currentUser, userRole]);

  const handleDrop = async (e: React.DragEvent, newStatus: TaskStatus) => {
    e.preventDefault();
    setDragOverCol(null);
    const id = e.dataTransfer.getData('taskId');
    setDraggingId(null);
    const task = tasks.find((t) => t.id === id);
    if (!task || task.status === newStatus) return;
    try {
      await updateDoc(doc(db, 'items', id), { status: newStatus });
      showToast(`Moved to ${newStatus}`);
    } catch (err) {
      console.error('Error moving task:', err);
      showToast('Could not move task', 'error');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '30px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
          <div>
            <h2 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '22px', fontWeight: 600 }}>Board</h2>
            <p style={{ color: 'var(--text-muted)', margin: '4px 0 0', fontSize: '13.5px' }}>Drag tasks between columns to update their status.</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link to="/items">
              <button style={{ padding: '10px 18px', background: 'var(--border)', color: 'var(--text-primary)', border: '1px solid var(--border-strong)', borderRadius: '8px', fontWeight: 500, fontSize: '14px', cursor: 'pointer' }}>
                List view
              </button>
            </Link>
            <Link to="/create">
              <button style={{ padding: '10px 18px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>
                Create New
              </button>
            </Link>
          </div>
        </div>

        <div className="board-grid">
          {COLUMNS.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.status);
            const isOver = dragOverCol === col.status;
            return (
              <div
                key={col.status}
                onDragOver={(e) => { e.preventDefault(); setDragOverCol(col.status); }}
                onDragLeave={() => setDragOverCol(null)}
                onDrop={(e) => handleDrop(e, col.status)}
                style={{
                  background: isOver ? 'var(--accent-soft)' : 'var(--surface)',
                  border: `1px solid ${isOver ? col.accent : 'var(--border)'}`,
                  borderRadius: '12px',
                  padding: '16px',
                  minHeight: '300px',
                  transition: 'border-color 0.15s, background 0.15s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: col.accent }} />
                  <h3 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '14px', fontWeight: 600 }}>{col.status}</h3>
                  <span style={{ color: 'var(--text-muted)', fontSize: '12.5px', marginLeft: 'auto' }}>{colTasks.length}</span>
                </div>

                {colTasks.length === 0 && (
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '30px 0', border: '1px dashed var(--border-strong)', borderRadius: '8px' }}>
                    {isOver ? 'Drop here' : 'No tasks'}
                  </p>
                )}

                {colTasks.map((task) => {
                  const due = dueDateInfo(task);
                  return (
                    <div
                      key={task.id}
                      className="board-card"
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('taskId', task.id);
                        setDraggingId(task.id);
                      }}
                      onDragEnd={() => { setDraggingId(null); setDragOverCol(null); }}
                      style={{
                        background: 'var(--surface-2)',
                        border: '1px solid var(--border-strong)',
                        borderRadius: '10px',
                        padding: '14px',
                        marginBottom: '10px',
                        opacity: draggingId === task.id ? 0.4 : 1,
                        transform: draggingId === task.id ? 'rotate(1.5deg) scale(0.98)' : 'none',
                      }}
                    >
                      <div style={{ marginBottom: '8px' }}>
                        <Badge label={task.priority} colors={PRIORITY_COLORS[task.priority]} />
                        {due && <Badge label={due.label} colors={due.colors} />}
                      </div>
                      <Link to={`/items/${task.id}`} style={{ textDecoration: 'none' }}>
                        <h4 style={{ margin: '0 0 4px', color: 'var(--text-primary)', fontSize: '14px', fontWeight: 600 }}>{task.title}</h4>
                      </Link>
                      <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '12.5px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {task.description}
                      </p>
                      {userRole === 'admin' && (
                        <p style={{ margin: '8px 0 0', color: 'var(--text-muted)', fontSize: '11.5px' }}>{task.createdByEmail}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Board;
