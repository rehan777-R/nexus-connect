import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const features = [
  { title: 'Secure authentication', desc: 'Email and Google sign-in, role-based access.' },
  { title: 'Kanban board', desc: 'Drag and drop tasks across columns, with priorities and due dates.' },
  { title: 'Real-time chat', desc: 'Presence, typing indicators, reactions, and AI moderation built in.' },
  { title: 'AI assistant', desc: 'Break goals into tasks and get workload summaries, powered by LLMs.' },
  { title: 'Analytics dashboard', desc: 'Live charts of your progress, priorities, and overdue work.' },
  { title: 'Admin controls', desc: 'User management and an AI moderation review queue for admins.' },
];

function Home() {
  const { currentUser, userRole } = useAuth();
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Hero Section */}
      <div style={{ padding: '90px 30px 70px', textAlign: 'center', borderBottom: '1px solid var(--border)' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <span style={{ color: 'white', fontSize: '24px', fontWeight: '700' }}>N</span>
        </div>
        <h1 style={{ fontSize: '38px', margin: '0 0 14px', color: 'var(--text-primary)', fontWeight: '700' }}>Where your team gets things done</h1>
        <p style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '35px', maxWidth: '480px', marginLeft: 'auto', marginRight: 'auto' }}>
          Tasks, ownership, and real-time chat, all in one connected workspace.
        </p>
        {currentUser ? (
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/create">
              <button className="btn-primary" style={{ padding: '11px 24px', fontSize: '14px' }}>
                Create task
              </button>
            </Link>
            <Link to="/items">
              <button className="btn-secondary" style={{ padding: '11px 24px', fontSize: '14px' }}>
                View tasks
              </button>
            </Link>
            {userRole === 'admin' && (
              <Link to="/admin">
                <button className="btn-secondary" style={{ padding: '11px 24px', fontSize: '14px', color: '#EAB308', borderColor: 'rgba(234,179,8,0.3)' }}>
                  Admin panel
                </button>
              </Link>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Link to="/signup">
              <button className="btn-primary" style={{ padding: '11px 24px', fontSize: '14px' }}>
                Get started
              </button>
            </Link>
            <Link to="/login">
              <button className="btn-secondary" style={{ padding: '11px 24px', fontSize: '14px' }}>
                Login
              </button>
            </Link>
          </div>
        )}
      </div>
      {/* Features Section */}
      <div style={{ padding: '60px 30px', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {features.map((feature, i) => (
            <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '22px' }}>
              <h3 style={{ color: 'var(--text-primary)', margin: '0 0 8px', fontSize: '15px', fontWeight: '600' }}>{feature.title}</h3>
              <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '13.5px', lineHeight: '1.5' }}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;
