import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useToast } from '../Toast';

function CreateItem() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('To Do');
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const showToast = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentUser) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'items'), {
        title: title,
        description: description,
        status: status,
        priority: priority,
        dueDate: dueDate || null,
        createdBy: currentUser.uid,
        createdByEmail: currentUser.email,
        createdAt: new Date().toISOString()
      });
      showToast('Task created');
      navigate('/items');
    } catch (error) {
      console.error('Error adding document: ', error);
      showToast('Failed to create task', 'error');
    }
    setLoading(false);
  };

  const labelStyle: React.CSSProperties = { display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '13px' };
  const inputStyle: React.CSSProperties = { width: '100%', boxSizing: 'border-box', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border-strong)', background: 'var(--bg)', color: 'var(--text-primary)', fontSize: '14px', fontFamily: 'Inter, sans-serif', outline: 'none' };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '30px' }}>
      <div style={{ background: 'var(--surface)', padding: '40px', borderRadius: '12px', border: '1px solid var(--border)', width: '100%', maxWidth: '500px' }}>

        <h2 style={{ color: 'var(--text-primary)', marginBottom: '4px', fontSize: '22px', fontWeight: 600 }}>Create New Task</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: 0, marginBottom: '28px', fontSize: '14px' }}>Add a task to your team's board.</p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Title</label>
            <input
              type="text"
              placeholder="Enter task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={inputStyle}
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Description</label>
            <textarea
              placeholder="Enter task description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={5}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Due date <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              style={{ ...inputStyle, colorScheme: 'dark' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '15px', marginBottom: '28px' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} style={inputStyle}>
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value)} style={inputStyle}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Creating...' : 'Create Task'}
          </button>
        </form>
        <button onClick={() => navigate('/items')} style={{ width: '100%', padding: '12px', background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-strong)', borderRadius: '8px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', marginTop: '12px' }}>
          Back to Tasks
        </button>
      </div>
    </div>
  );
}

export default CreateItem;
