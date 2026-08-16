import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const linkStyle = { color: '#A1A1AA', margin: '0 4px', padding: '6px 10px', textDecoration: 'none', fontWeight: '500', fontSize: '13.5px', borderRadius: '6px' };
const activeLinkStyle = { ...linkStyle, color: '#E5E5E7' };

function Navbar() {
  const { currentUser, userRole, userProfile, logout } = useAuth();
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
            <Link to="/board" style={linkStyle}>Board</Link>
            <Link to="/dashboard" style={linkStyle}>Dashboard</Link>
            <Link to="/chat" style={linkStyle}>Chat</Link>
            <Link to="/assistant" style={linkStyle}>AI Assistant</Link>
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
            <Link to="/profile" title="Your profile" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: userProfile?.avatarColor || '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12.5px', fontWeight: 700 }}>
                {(userProfile?.displayName || currentUser.email)?.[0]?.toUpperCase()}
              </div>
              <span style={{ color: '#A1A1AA', fontSize: '13px' }}>
                {userProfile?.displayName || currentUser.email}
              </span>
            </Link>
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
