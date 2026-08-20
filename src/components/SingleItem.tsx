import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { PRIORITY_COLORS, STATUS_COLORS, Badge } from './taskBadges';
import type { Task } from '../types';

function SingleItem() {
  const [item, setItem] = useState<Task | null>(null);
  const { id } = useParams() as { id: string };
  const { currentUser, userRole } = useAuth();
  useEffect(() => {
    const fetchItem = async () => {
      const docRef = doc(db, 'items', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setItem({ id: docSnap.id, ...docSnap.data() } as Task);
      }
    };
    fetchItem();
  }, [id]);
  if (!item) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: '15px', color: 'var(--text-muted)' }}>Loading...</div>
    </div>
  );
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'var(--surface)', borderRadius: '12px', padding: '40px', border: '1px solid var(--border)', width: '100%', maxWidth: '600px' }}>
        <h2 style={{ margin: '0 0 20px', fontSize: '24px', fontWeight: 600, color: 'var(--text-primary)' }}>{item.title}</h2>
        {/* Status + Priority */}
        <div style={{ marginBottom: '24px' }}>
          <Badge label={item.status} colors={STATUS_COLORS[item.status]} />
          <Badge label={item.priority} colors={PRIORITY_COLORS[item.priority]} />
        </div>
        {/* Content */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px', fontSize: '13px' }}>Description</label>
          <p style={{ color: 'var(--text-primary)', background: 'var(--bg)', padding: '15px', borderRadius: '8px', lineHeight: '1.6', fontSize: '14px', border: '1px solid var(--border)', margin: 0 }}>{item.description}</p>
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px', fontSize: '13px' }}>Created By</label>
          <p style={{ color: 'var(--text-primary)', margin: 0, fontSize: '14px' }}>{item.createdByEmail}</p>
        </div>
        <div style={{ marginBottom: '28px' }}>
          <label style={{ fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px', fontSize: '13px' }}>Created At</label>
          <p style={{ color: 'var(--text-primary)', margin: 0, fontSize: '14px' }}>{item.createdAt?.slice(0, 10)}</p>
        </div>
        {/* Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          {(userRole === 'admin' || item.createdBy === currentUser?.uid) && (
            <Link to={`/edit/${item.id}`}>
              <button style={{ padding: '10px 18px', background: 'var(--border)', color: 'var(--text-primary)', border: '1px solid var(--border-strong)', borderRadius: '8px', fontWeight: 500, fontSize: '14px', cursor: 'pointer'}}>
                Edit
              </button>
            </Link>
          )}
          <Link to="/items">
            <button style={{ padding: '10px 18px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>
              Back to Tasks
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
export default SingleItem;
