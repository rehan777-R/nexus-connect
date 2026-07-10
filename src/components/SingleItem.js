import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
const PRIORITY_COLORS = {
  Low: { bg: 'rgba(34,197,94,0.12)', text: '#22C55E' },
  Medium: { bg: 'rgba(234,179,8,0.12)', text: '#EAB308' },
  High: { bg: 'rgba(239,68,68,0.12)', text: '#EF4444' },
};
const STATUS_COLORS = {
  'To Do': { bg: 'rgba(113,113,122,0.15)', text: '#A1A1AA' },
  'In Progress': { bg: 'rgba(37,99,235,0.12)', text: '#3B82F6' },
  'Done': { bg: 'rgba(34,197,94,0.12)', text: '#22C55E' },
};
function Badge({ label, colors }) {
  if (!label || !colors) return null;
  return (
    <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: 500, background: colors.bg, color: colors.text, marginRight: '10px' }}>
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
    <div style={{ minHeight: '100vh', background: '#0A0A0B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: '15px', color: '#71717A' }}>Loading...</div>
    </div>
  );
  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0B', padding: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#111113', borderRadius: '12px', padding: '40px', border: '1px solid #1F1F23', width: '100%', maxWidth: '600px' }}>
        <h2 style={{ margin: '0 0 20px', fontSize: '24px', fontWeight: 600, color: '#E5E5E7' }}>{item.title}</h2>
        {/* Status + Priority */}
        <div style={{ marginBottom: '24px' }}>
          <Badge label={item.status} colors={STATUS_COLORS[item.status]} />
          <Badge label={item.priority} colors={PRIORITY_COLORS[item.priority]} />
        </div>
        {/* Content */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontWeight: 500, color: '#A1A1AA', display: 'block', marginBottom: '8px', fontSize: '13px' }}>Description</label>
          <p style={{ color: '#E5E5E7', background: '#0A0A0B', padding: '15px', borderRadius: '8px', lineHeight: '1.6', fontSize: '14px', border: '1px solid #1F1F23', margin: 0 }}>{item.description}</p>
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontWeight: 500, color: '#A1A1AA', display: 'block', marginBottom: '8px', fontSize: '13px' }}>Created By</label>
          <p style={{ color: '#E5E5E7', margin: 0, fontSize: '14px' }}>{item.createdByEmail}</p>
        </div>
        <div style={{ marginBottom: '28px' }}>
          <label style={{ fontWeight: 500, color: '#A1A1AA', display: 'block', marginBottom: '8px', fontSize: '13px' }}>Created At</label>
          <p style={{ color: '#E5E5E7', margin: 0, fontSize: '14px' }}>{item.createdAt?.slice(0, 10)}</p>
        </div>
        {/* Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          {(userRole === 'admin' || item.createdBy === currentUser?.uid) && (
            <Link to={`/edit/${item.id}`}>
              <button style={{ padding: '10px 18px', background: '#1F1F23', color: '#E5E5E7', border: '1px solid #27272A', borderRadius: '8px', fontWeight: 500, fontSize: '14px', cursor: 'pointer'}}>
                Edit
              </button>
            </Link>
          )}
          <Link to="/items">
            <button style={{ padding: '10px 18px', background: '#2563EB', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>
              Back to Tasks
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
export default SingleItem;
