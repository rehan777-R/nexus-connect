import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useTheme } from '../ThemeContext';

function Navbar() {
  const { currentUser, userRole, userProfile, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed', err);
    }
  }

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar">
      {/* Left - Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: '22px', height: '22px', borderRadius: '6px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: 'white', fontSize: '12px', fontWeight: 700 }}>N</span>
        </div>
        <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '16px' }}>Nexus</span>
      </div>

      {/* Center - Links (collapses into burger menu on mobile) */}
      <div className={`navbar-links${menuOpen ? ' open' : ''}`}>
        <Link to="/" className="navbar-link" onClick={closeMenu}>Home</Link>
        {currentUser && (
          <>
            <Link to="/items" className="navbar-link" onClick={closeMenu}>Tasks</Link>
            <Link to="/board" className="navbar-link" onClick={closeMenu}>Board</Link>
            <Link to="/dashboard" className="navbar-link" onClick={closeMenu}>Dashboard</Link>
            <Link to="/chat" className="navbar-link" onClick={closeMenu}>Chat</Link>
            <Link to="/assistant" className="navbar-link" onClick={closeMenu}>✨ AI Assistant</Link>
            {userRole === 'admin' && (
              <Link to="/admin" className="navbar-link" style={{ color: 'var(--warning)' }} onClick={closeMenu}>Admin</Link>
            )}
          </>
        )}
      </div>

      {/* Right - theme toggle + auth */}
      <div className="navbar-right">
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        {currentUser ? (
          <>
            <Link to="/profile" title="Your profile" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: userProfile?.avatarColor || '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12.5px', fontWeight: 700 }}>
                {(userProfile?.displayName || currentUser.email)?.[0]?.toUpperCase()}
              </div>
              <span className="navbar-username" style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                {userProfile?.displayName || currentUser.email}
              </span>
            </Link>
            <button onClick={handleLogout} className="btn-secondary">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="navbar-link">Login</Link>
            <Link to="/signup" style={{ padding: '8px 16px', background: 'var(--accent)', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: 500, fontSize: '13.5px', whiteSpace: 'nowrap' }}>Sign up</Link>
          </>
        )}
        <button
          className="navbar-burger"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
