import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const linkStyle = { color: '#A1A1AA', margin: '0 4px', padding: '6px 10px', textDecoration: 'none', fontWeight: '500', fontSize: '13.5px', borderRadius: '6px' };
const activeLinkStyle = { ...linkStyle, color: '#E5E5E7' };

function Navbar() {
  const { currentUser, userRole, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed', err);
    }
  }

  return (
    <nav style={{ background: '#111113', padding: '13px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1F1F23' }}>
      {/* Left - Logo + Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '22px' }}>
          <div style={{ width: '22px', height: '22px', borderRadius: '6px', background: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'white', fontSize: '12px', fontWeight: '700' }}>N</span>
          </div>
          <span style={{ color: 'white', fontWeight: '600', fontSize: '16px' }}>Nexus</span>
        </div>
        <Link to="/" style={linkStyle}>Home</Link>
        {currentUser && (
          <>
            <Link to="/items" style={linkStyle}>Tasks</Link>
            <Link to="/create" style={linkStyle}>New task</Link>
            <Link to="/dashboard" style={linkStyle}>Dashboard</Link>
            <Link to="/chat" style={linkStyle}>Chat</Link>
            {userRole === 'admin' && (
              <Link to="/admin" style={{ ...activeLinkStyle, color: '#EAB308' }}>Admin</Link>
            )}
          </>
        )}
      </div>
      {/* Right - Auth */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {currentUser ? (
          <>
            <span style={{ color: '#71717A', fontSize: '13px' }}>{currentUser.email}</span>
            <button onClick={handleLogout} className="btn-secondary">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={linkStyle}>Login</Link>
            <Link to="/signup" style={{ padding: '8px 16px', background: '#2563EB', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: '500', fontSize: '13.5px' }}>Sign up</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
