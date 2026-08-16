import React, { useState } from 'react';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useToast } from '../Toast';
import { PRIORITY_COLORS, Badge } from './taskBadges';

const card = { background: '#111113', border: '1px solid #1F1F23', borderRadius: '12px', padding: '28px' };
const inputStyle = { width: '100%', boxSizing: 'border-box', padding: '12px 14px', borderRadius: '8px', border: '1px solid #27272A', background: '#0A0A0B', color: '#E5E5E7', fontSize: '14px', outline: 'none', margin: 0 };

function Assistant() {
  const [goal, setGoal] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [breakdownLoading, setBreakdownLoading] = useState(false);
  const [addingAll, setAddingAll] = useState(false);
  const [summary, setSummary] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const showToast = useToast();

  const generateBreakdown = async (e) => {
    e.preventDefault();
    if (!goal.trim()) return;
    setBreakdownLoading(true);
    setError('');
    setSuggestions([]);
    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'breakdown', goal }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      setSuggestions((data.tasks || []).map((t) => ({ ...t, added: false })));
    } catch (err) {
      console.error('AI breakdown failed:', err);
      setError('Could not generate tasks. Please try again.');
    }
    setBreakdownLoading(false);
  };

  const addTask = async (index) => {
    const t = suggestions[index];
    try {
      await addDoc(collection(db, 'items'), {
        title: t.title,
        description: t.description,
        status: 'To Do',
        priority: ['Low', 'Medium', 'High'].includes(t.priority) ? t.priority : 'Medium',
        dueDate: null,
        createdBy: currentUser.uid,
        createdByEmail: currentUser.email,
        createdAt: new Date().toISOString(),
      });
      setSuggestions((prev) => prev.map((s, i) => (i === index ? { ...s, added: true } : s)));
      showToast(`Added "${t.title}"`);
    } catch (err) {
      console.error('Error adding task:', err);
      showToast('Could not add task', 'error');
    }
  };

  const addAll = async () => {
    setAddingAll(true);
    for (let i = 0; i < suggestions.length; i++) {
      if (!suggestions[i].added) await addTask(i);
    }
    setAddingAll(false);
    showToast('All tasks added to your board');
  };

  const generateSummary = async () => {
    setSummaryLoading(true);
    setError('');
    setSummary('');
    try {
      const snap = await getDocs(collection(db, 'items'));
      const myTasks = snap.docs
        .map((d) => d.data())
        .filter((t) => t.createdBy === currentUser.uid);
      if (myTasks.length === 0) {
        setSummary('You have no tasks yet. Create some tasks (or generate them above) and I can summarize your workload.');
        setSummaryLoading(false);
        return;
      }
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'summary', tasks: myTasks }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      setSummary(data.summary || '');
    } catch (err) {
      console.error('AI summary failed:', err);
      setError('Could not generate summary. Please try again.');
    }
    setSummaryLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0B', padding: '30px' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ color: '#E5E5E7', margin: 0, fontSize: '22px', fontWeight: 600 }}>✨ AI Assistant</h2>
          <p style={{ color: '#71717A', margin: '6px 0 0', fontSize: '13.5px' }}>
            Powered by Llama 3.3 70B — break down goals into tasks, or get a summary of your workload.
          </p>
        </div>

        {error && (
          <p style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', border: '1px solid rgba(239,68,68,0.3)', marginBottom: '18px' }}>
            {error}
          </p>
        )}

        {/* Goal breakdown */}
        <div style={{ ...card, marginBottom: '18px' }}>
          <h3 style={{ color: 'white', margin: '0 0 6px', fontSize: '15px', fontWeight: 600 }}>Break a goal into tasks</h3>
          <p style={{ color: '#71717A', margin: '0 0 16px', fontSize: '13px' }}>
            Describe what you want to achieve and the AI will plan the tasks for you.
          </p>
          <form onSubmit={generateBreakdown} style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              placeholder='e.g. "Launch a portfolio website by next month"'
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              style={{ ...inputStyle, flex: 1 }}
            />
            <button type="submit" disabled={breakdownLoading || !goal.trim()} className="btn-primary" style={{ opacity: breakdownLoading ? 0.7 : 1, whiteSpace: 'nowrap' }}>
              {breakdownLoading ? 'Thinking…' : 'Generate'}
            </button>
          </form>

          {suggestions.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              {suggestions.map((t, i) => (
                <div key={i} style={{ background: '#18181B', border: '1px solid #27272A', borderRadius: '10px', padding: '14px 16px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '14px' }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ marginBottom: '6px' }}>
                      <Badge label={t.priority} colors={PRIORITY_COLORS[t.priority]} />
                    </div>
                    <h4 style={{ margin: '0 0 4px', color: '#E5E5E7', fontSize: '14px', fontWeight: 600 }}>{t.title}</h4>
                    <p style={{ margin: 0, color: '#A1A1AA', fontSize: '13px' }}>{t.description}</p>
                  </div>
                  <button
                    onClick={() => addTask(i)}
                    disabled={t.added}
                    style={{ padding: '8px 14px', background: t.added ? 'transparent' : '#1F1F23', color: t.added ? '#22C55E' : '#E5E5E7', border: `1px solid ${t.added ? 'rgba(34,197,94,0.3)' : '#27272A'}`, borderRadius: '8px', cursor: t.added ? 'default' : 'pointer', fontWeight: 500, fontSize: '13px', flexShrink: 0 }}
                  >
                    {t.added ? '✓ Added' : 'Add task'}
                  </button>
                </div>
              ))}
              <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
                <button onClick={addAll} disabled={addingAll || suggestions.every((s) => s.added)} className="btn-primary" style={{ opacity: addingAll ? 0.7 : 1 }}>
                  {addingAll ? 'Adding…' : 'Add all to board'}
                </button>
                <button onClick={() => navigate('/board')} className="btn-secondary">
                  Open board
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Workload summary */}
        <div style={card}>
          <h3 style={{ color: 'white', margin: '0 0 6px', fontSize: '15px', fontWeight: 600 }}>Summarize my workload</h3>
          <p style={{ color: '#71717A', margin: '0 0 16px', fontSize: '13px' }}>
            Get a quick AI overview of your open tasks and what to tackle next.
          </p>
          <button onClick={generateSummary} disabled={summaryLoading} className="btn-secondary" style={{ opacity: summaryLoading ? 0.7 : 1 }}>
            {summaryLoading ? 'Analyzing…' : 'Generate summary'}
          </button>
          {summary && (
            <p style={{ marginTop: '16px', marginBottom: 0, background: '#18181B', border: '1px solid #27272A', borderRadius: '10px', padding: '16px', color: '#E5E5E7', fontSize: '13.5px', lineHeight: 1.6 }}>
              {summary}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Assistant;
