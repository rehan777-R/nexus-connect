import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const PRIORITY_COLORS = {
  Low: { bg: '#dcfce7', text: '#166534' },
  Medium: { bg: '#fef3c7', text: '#92400e' },
  High: { bg: '#fee2e2', text: '#991b1b' },
};

const STATUS_COLORS = {
  'To Do': { bg: '#e0e7ff', text: '#3730a3' },
  'In Progress': { bg: '#fef3c7', text: '#92400e' },
  'Done': { bg: '#dcfce7', text: '#166534' },
};

function Badge({ label, colors }) {
  if (!label || !colors) return null;
  return (
    <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '999px', fontSize: '13px', fontWeight: 'bold', background: colors.bg, color: colors.text, marginRight: '10px' }}>
      {label}
    </span>
  );
}

function SingleItem() {
  const [item, setItem] = useState(null);
  const { id } = useParams();
  const { currentUser, userRole } = useAuth();

  useEffect(() => {
    const fetchItem = async () => {
      const docRef = doc(db, 'items', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setItem({ id: docSnap.id, ...docSnap.data() });
      }
    };
    fetchItem();
  }, [id]);

  if (!item) return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: '18px', color: '#666' }}>⏳ Loading...</div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5', padding: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'white', borderRadius: '15px', padding: '40px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', width: '100%', maxWidth: '600px' }}>
        {/* Header */}
        <div style={{ background: '#4f46e5', borderRadius: '10px', padding: '20px', marginBottom: '25px', color: 'white' }}>
          <h2 style={{ margin: 0, fontSize: '26px' }}>📄 {item.title}</h2>
        </div>
        {/* Status + Priority */}
        <div style={{ marginBottom: '20px' }}>
          <Badge label={item.status} colors={STATUS_COLORS[item.status]} />
          <Badge label={item.priority} colors={PRIORITY_COLORS[item.priority]} />
        </div>
        {/* Content */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontWeight: 'bold', color: '#555', display: 'block', marginBottom: '8px' }}>Description</label>
          <p style={{ color: '#444', background: '#f8f8f8', padding: '15px', borderRadius: '8px', lineHeight: '1.6' }}>{item.description}</p>
        </div>
        <div style={{ marginBottom: '25px' }}>
          <label style={{ fontWeight: 'bold', color: '#555', display: 'block', marginBottom: '8px' }}>Created By</label>
          <p style={{ color: '#666', margin: 0 }}>📧 {item.createdByEmail}</p>
        </div>
        <div style={{ marginBottom: '25px' }}>
          <label style={{ fontWeight: 'bold', color: '#555', display: 'block', marginBottom: '8px' }}>Created At</label>
          <p style={{ color: '#666', margin: 0 }}>📅 {item.createdAt?.slice(0, 10)}</p>
        </div>
        {/* Buttons */}
        <div style={{ display: 'flex', gap: '15px' }}>
          {(userRole === 'admin' || item.createdBy === currentUser?.uid) && (
            <Link to={`/edit/${item.id}`}>
              <button style={{ padding: '10px 20px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer'}}>
                ✏️ Edit
              </button>
            </Link>
          )}
          <Link to="/items">
            <button style={{ padding: '10px 20px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
              ← Back to Tasks
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default SingleItem;
