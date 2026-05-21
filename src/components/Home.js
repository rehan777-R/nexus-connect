import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';

function Home() {
  const { currentUser, userRole } = useAuth();

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5' }}>

      {/* Hero Section */}
      <div style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', padding: '80px 30px', textAlign: 'center', color: 'white' }}>
        <h1 style={{ fontSize: '48px', margin: '0 0 15px' }}>🔥 MyCRUD App</h1>
        <p style={{ fontSize: '20px', opacity: 0.85, marginBottom: '35px' }}>A simple and powerful CRUD application using React & Firebase</p>
        {currentUser ? (
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/create">
              <button style={{ padding: '14px 30px', background: 'white', color: '#4f46e5', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
                ➕ Create Item
              </button>
            </Link>
            <Link to="/items">
              <button style={{ padding: '14px 30px', background: 'transparent', color: 'white', border: '2px solid white', borderRadius: '10px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
                📦 View Items
              </button>
            </Link>
            {userRole === 'admin' && (
              <Link to="/admin">
                <button style={{ padding: '14px 30px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
                  🛡️ Admin Panel
                </button>
              </Link>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
            <Link to="/signup">
              <button style={{ padding: '14px 30px', background: 'white', color: '#4f46e5', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
                🚀 Get Started
              </button>
            </Link>
            <Link to="/login">
              <button style={{ padding: '14px 30px', background: 'transparent', color: 'white', border: '2px solid white', borderRadius: '10px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
                Login
              </button>
            </Link>
          </div>
        )}
      </div>

      {/* Features Section */}
      <div style={{ padding: '60px 30px', maxWidth: '900px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', color: '#333', marginBottom: '40px' }}>✨ Features</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '25px' }}>
          {[
            { icon: '🔐', title: 'Secure Auth', desc: 'Email & Google Sign-In' },
            { icon: '📦', title: 'CRUD Operations', desc: 'Create, Read, Update, Delete' },
            { icon: '🛡️', title: 'Role Based Access', desc: 'Admin & User roles' },
            { icon: '💬', title: 'Real-time Chat', desc: 'Chat with other users' },
          ].map((feature, i) => (
            <div key={i} style={{ background: 'white', borderRadius: '12px', padding: '25px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', textAlign: 'center' }}>
              <div style={{ fontSize: '40px', marginBottom: '10px' }}>{feature.icon}</div>
              <h3 style={{ color: '#4f46e5', margin: '0 0 8px' }}>{feature.title}</h3>
              <p style={{ color: '#888', margin: 0 }}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

export default Home;