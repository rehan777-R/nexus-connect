import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, updateDoc, doc, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useToast } from '../Toast';
import { PRIORITY_COLORS, Badge, dueDateInfo } from './taskBadges';

const COLUMNS = [
  { status: 'To Do', accent: '#A1A1AA' },
  { status: 'In Progress', accent: '#3B82F6' },
  { status: 'Done', accent: '#22C55E' },
];

function Board() {
  const [tasks, setTasks] = useState([]);
  const [draggingId, setDraggingId] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);
  const { currentUser, userRole } = useAuth();
  const showToast = useToast();

  useEffect(() => {
    if (!currentUser) return;
    // Scope the query server-side: security rules only allow reading your
    // own tasks unless you're an admin.
    const ref = collection(db, 'items');
    const q = userRole === 'admin' ? ref : query(ref, where('createdBy', '==', currentUser.uid));
    const unsub = onSnapshot(q, (snapshot) => {
      setTasks(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [currentUser, userRole]);

  const handleDrop = async (e, newStatus) => {
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
    <div style={{ minHeight: '100vh', background: '#0A0A0B', padding: '30px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
          <div>
            <h2 style={{ color: '#E5E5E7', margin: 0, fontSize: '22px', fontWeight: 600 }}>Board</h2>
            <p style={{ color: '#71717A', margin: '4px 0 0', fontSize: '13.5px' }}>Drag tasks between columns to update their status.</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link to="/items">
              <button style={{ padding: '10px 18px', background: '#1F1F23', color: '#E5E5E7', border: '1px solid #27272A', borderRadius: '8px', fontWeight: 500, fontSize: '14px', cursor: 'pointer' }}>
                List view
              </button>
            </Link>
            <Link to="/create">
              <button style={{ padding: '10px 18px', background: '#2563EB', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>
                Create New
              </button>
            </Link>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', alignItems: 'start' }}>
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
                  background: '#111113',
                  border: `1px solid ${isOver ? col.accent : '#1F1F23'}`,
                  borderRadius: '12px',
                  padding: '16px',
                  minHeight: '300px',
                  transition: 'border-color 0.15s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: col.accent }} />
                  <h3 style={{ color: '#E5E5E7', margin: 0, fontSize: '14px', fontWeight: 600 }}>{col.status}</h3>
                  <span style={{ color: '#71717A', fontSize: '12.5px', marginLeft: 'auto' }}>{colTasks.length}</span>
                </div>

                {colTasks.length === 0 && (
                  <p style={{ color: '#71717A', fontSize: '13px', textAlign: 'center', padding: '30px 0', border: '1px dashed #27272A', borderRadius: '8px' }}>
                    {isOver ? 'Drop here' : 'No tasks'}
                  </p>
                )}

                {colTasks.map((task) => {
                  const due = dueDateInfo(task);
                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('taskId', task.id);
                        setDraggingId(task.id);
                      }}
                      onDragEnd={() => { setDraggingId(null); setDragOverCol(null); }}
                      style={{
                        background: '#18181B',
                        border: '1px solid #27272A',
                        borderRadius: '10px',
                        padding: '14px',
                        marginBottom: '10px',
                        cursor: 'grab',
                        opacity: draggingId === task.id ? 0.4 : 1,
                      }}
                    >
                      <div style={{ marginBottom: '8px' }}>
                        <Badge label={task.priority} colors={PRIORITY_COLORS[task.priority]} />
                        {due && <Badge label={due.label} colors={due.colors} />}
                      </div>
                      <Link to={`/items/${task.id}`} style={{ textDecoration: 'none' }}>
                        <h4 style={{ margin: '0 0 4px', color: '#E5E5E7', fontSize: '14px', fontWeight: 600 }}>{task.title}</h4>
                      </Link>
                      <p style={{ margin: 0, color: '#A1A1AA', fontSize: '12.5px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {task.description}
                      </p>
                      {userRole === 'admin' && (
                        <p style={{ margin: '8px 0 0', color: '#71717A', fontSize: '11.5px' }}>{task.createdByEmail}</p>
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
