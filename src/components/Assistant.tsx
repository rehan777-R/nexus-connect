import React, { useState } from 'react';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useToast } from '../Toast';
import { PRIORITY_COLORS, Badge } from './taskBadges';
import type { TaskPriority } from '../types';

interface Suggestion {
  title: string;
  description: string;
  priority: TaskPriority;
  added: boolean;
}

const card: React.CSSProperties = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '28px' };
const inputStyle: React.CSSProperties = { width: '100%', boxSizing: 'border-box', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border-strong)', background: 'var(--bg)', color: 'var(--text-primary)', fontSize: '14px', outline: 'none', margin: 0 };

function AiBadge({ children }: { children: React.ReactNode }) {
  return <span className="ai-badge">✨ {children}</span>;
}

function Thinking({ label }: { label: string }) {
  return (
    <div className="ai-thinking" style={{ marginTop: '16px' }}>
      <span className="typing-dots"><span>•</span><span>•</span><span>•</span></span>
      <span>{label}</span>
    </div>
  );
}

// The visible agent pipeline: goal in → LLM reasoning → structured tasks → board.
function Stepper({ step }: { step: number }) {
  const STEPS = ['Describe goal', 'LLM plans tasks', 'Review output', 'Added to board'];
  return (
    <div className="stepper" aria-label="Agent workflow progress">
      {STEPS.map((label, i) => {
        const state = i < step ? 'done' : i === step ? 'active' : '';
        return (
          <React.Fragment key={label}>
            {i > 0 && <span className="stepper-arrow">→</span>}
            <span className={`stepper-step ${state}`}>
              <span className="dot">{i < step ? '✓' : i + 1}</span>
              {label}
            </span>
          </React.Fragment>
        );
      })}
    </div>
  );
}

function Assistant() {
  const [goal, setGoal] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [breakdownLoading, setBreakdownLoading] = useState(false);
  const [addingAll, setAddingAll] = useState(false);
  const [summary, setSummary] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const showToast = useToast();

  const allAdded = suggestions.length > 0 && suggestions.every((s) => s.added);
  // Which stage of the agent pipeline we're at (drives the stepper).
  const step = allAdded ? 4 : suggestions.length > 0 ? 2 : breakdownLoading ? 1 : 0;

  const generateBreakdown = async (e: React.FormEvent<HTMLFormElement>) => {
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
      setSuggestions(((data.tasks || []) as Omit<Suggestion, 'added'>[]).map((t) => ({ ...t, added: false })));
    } catch (err) {
      console.error('AI breakdown failed:', err);
      setError('Could not generate tasks. Please try again.');
    }
    setBreakdownLoading(false);
  };

  const addTask = async (index: number) => {
    const t = suggestions[index];
    if (!currentUser) return;
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
    if (!currentUser) return;
    setSummaryLoading(true);
    setError('');
    setSummary('');
    try {
      // Query only this user's tasks — the security rules reject broader reads.
      const q = query(collection(db, 'items'), where('createdBy', '==', currentUser.uid));
      const snap = await getDocs(q);
      const myTasks = snap.docs.map((d) => d.data());
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
    <div className="page" style={{ minHeight: '100vh', background: 'var(--bg)', padding: '30px' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <h2 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '22px', fontWeight: 600 }}>AI Assistant</h2>
            <AiBadge>Llama 3.3 70B · Groq · serverless</AiBadge>
          </div>
          <p style={{ color: 'var(--text-muted)', margin: '6px 0 0', fontSize: '13.5px' }}>
            An LLM planning agent: it turns your goal into structured, prioritized tasks and files them onto your board.
          </p>
        </div>

        {error && (
          <p style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', border: '1px solid rgba(239,68,68,0.3)', marginBottom: '18px' }}>
            {error}
          </p>
        )}

        {/* Goal breakdown — the agent pipeline */}
        <div style={{ ...card, marginBottom: '18px' }}>
          <h3 style={{ color: 'var(--text-primary)', margin: '0 0 6px', fontSize: '15px', fontWeight: 600 }}>Break a goal into tasks</h3>
          <p style={{ color: 'var(--text-muted)', margin: '0 0 16px', fontSize: '13px' }}>
            Describe what you want to achieve and the model plans the tasks for you.
          </p>

          <Stepper step={step} />

          <form onSubmit={generateBreakdown} style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              placeholder='e.g. "Launch a portfolio website by next month"'
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              aria-label="Goal for the AI to break down"
              style={{ ...inputStyle, flex: 1 }}
            />
            <button type="submit" disabled={breakdownLoading || !goal.trim()} className="btn-primary" style={{ opacity: breakdownLoading ? 0.7 : 1, whiteSpace: 'nowrap' }}>
              {breakdownLoading ? 'Planning…' : 'Generate'}
            </button>
          </form>

          {breakdownLoading && <Thinking label="Llama 3.3 70B is planning your tasks…" />}

          {suggestions.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              {suggestions.map((t, i) => (
                <div key={i} className="ai-card" style={{ padding: '14px 16px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '14px' }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ marginBottom: '6px', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <AiBadge>AI-generated</AiBadge>
                      <Badge label={t.priority} colors={PRIORITY_COLORS[t.priority]} />
                    </div>
                    <h4 style={{ margin: '0 0 4px', color: 'var(--text-primary)', fontSize: '14px', fontWeight: 600 }}>{t.title}</h4>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '13px' }}>{t.description}</p>
                  </div>
                  <button
                    onClick={() => addTask(i)}
                    disabled={t.added}
                    style={{ padding: '8px 14px', background: t.added ? 'transparent' : 'var(--border)', color: t.added ? 'var(--success)' : 'var(--text-primary)', border: `1px solid ${t.added ? 'rgba(34,197,94,0.3)' : 'var(--border-strong)'}`, borderRadius: '8px', cursor: t.added ? 'default' : 'pointer', fontWeight: 500, fontSize: '13px', flexShrink: 0 }}
                  >
                    {t.added ? '✓ Added' : 'Add task'}
                  </button>
                </div>
              ))}
              <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
                <button onClick={addAll} disabled={addingAll || allAdded} className="btn-primary" style={{ opacity: addingAll ? 0.7 : 1 }}>
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
          <h3 style={{ color: 'var(--text-primary)', margin: '0 0 6px', fontSize: '15px', fontWeight: 600 }}>Summarize my workload</h3>
          <p style={{ color: 'var(--text-muted)', margin: '0 0 16px', fontSize: '13px' }}>
            The model reads your open tasks and tells you what to tackle next.
          </p>
          <button onClick={generateSummary} disabled={summaryLoading} className="btn-secondary" style={{ opacity: summaryLoading ? 0.7 : 1 }}>
            {summaryLoading ? 'Analyzing…' : 'Generate summary'}
          </button>
          {summaryLoading && <Thinking label="Reading your tasks and drafting a summary…" />}
          {summary && (
            <div className="ai-card" style={{ marginTop: '16px', padding: '16px' }}>
              <div style={{ marginBottom: '8px' }}>
                <AiBadge>AI-generated summary</AiBadge>
              </div>
              <p style={{ margin: 0, color: 'var(--text-primary)', fontSize: '13.5px', lineHeight: 1.6 }}>
                {summary}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Assistant;
