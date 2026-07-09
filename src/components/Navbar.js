import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

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
    <nav style={{ background: '#4f46e5', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>

      {/* Left - Logo + Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
        <span style={{ color: 'white', fontWeight: 'bold', fontSize: '20px', marginRight: '20px' }}>🔗 Nexus</span>
        <Link to="/" style={{ color: 'rgba(255,255,255,0.85)', margin: '5px 10px', textDecoration: 'none', fontWeight: '500' }}>Home</Link>
        {currentUser && (
          <>
            <Link to="/items" style={{ color: 'rgba(255,255,255,0.85)', margin: '5px 10px', textDecoration: 'none', fontWeight: '500' }}>All Items</Link>
            <Link to="/create" style={{ color: 'rgba(255,255,255,0.85)', margin: '5px 10px', textDecoration: 'none', fontWeight: '500' }}>Create Item</Link>
            <Link to="/dashboard" style={{ color: 'rgba(255,255,255,0.85)', margin: '5px 10px', textDecoration: 'none', fontWeight: '500' }}>Dashboard</Link>
            <Link to="/chat" style={{ color: 'rgba(255,255,255,0.85)', margin: '5px 10px', textDecoration: 'none', fontWeight: '500' }}>💬 Chat</Link> {/* ← YEH ADD HUA */}
            {userRole === 'admin' && (
              <Link to="/admin" style={{ color: '#fcd34d', margin: '5px 10px', textDecoration: 'none', fontWeight: '500' }}>🛡️ Admin</Link>
            )}
          </>
        )}
      </div>

      {/* Right - Auth */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {currentUser ? (
          <>
            <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '14px' }}>👤 {currentUser.email}</span>
            <button onClick={handleLogout} style={{ padding: '8px 18px', background: 'white', color: '#4f46e5', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ color: 'rgba(255,255,255,0.85)', margin: '5px 10px', textDecoration: 'none', fontWeight: '500' }}>Login</Link>
            <Link to="/signup" style={{ padding: '8px 18px', background: 'white', color: '#4f46e5', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>Sign Up</Link>
          </>
        )}
      </div>

    </nav>
  );
}

export default Navbar;
