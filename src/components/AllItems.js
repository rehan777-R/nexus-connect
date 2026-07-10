import React, { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { Link } from 'react-router-dom';
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
    <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 500, background: colors.bg, color: colors.text, marginRight: '8px' }}>
      {label}
    </span>
  );
}

function AllItems() {
  const [items, setItems] = useState([]);
  const { currentUser, userRole } = useAuth();

  const fetchItems = async () => {
    const querySnapshot = await getDocs(collection(db, 'items'));
    const itemsList = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    // Admin sab dekhe, user sirf apne
    if (userRole === 'admin') {
      setItems(itemsList);
    } else {
      setItems(itemsList.filter(item => item.createdBy === currentUser.uid));
    }
  };

  useEffect(() => {
    if (currentUser) fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, userRole]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await deleteDoc(doc(db, 'items', id));
      fetchItems();
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0B', padding: '30px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
          <h2 style={{ color: '#E5E5E7', margin: 0, fontSize: '22px', fontWeight: 600 }}>{userRole === 'admin' ? 'All Tasks' : 'My Tasks'}</h2>
          <Link to="/create">
            <button style={{ padding: '10px 18px', background: '#2563EB', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>
              Create New
            </button>
          </Link>
        </div>
        {items.length === 0 ? (
          <div style={{ background: '#111113', borderRadius: '12px', padding: '48px', textAlign: 'center', border: '1px solid #1F1F23' }}>
            <p style={{ color: '#71717A', fontSize: '15px', marginBottom: '20px' }}>No tasks found.</p>
            <Link to="/create">
              <button style={{ padding: '10px 18px', background: '#2563EB', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '14px', cursor: 'pointer'}}>
                Create First Task
              </button>
            </Link>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} style={{ background: '#111113', borderRadius: '12px', padding: '20px 24px', marginBottom: '14px', border: '1px solid #1F1F23', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ marginBottom: '10px' }}>
                  <Badge label={item.status} colors={STATUS_COLORS[item.status]} />
                  <Badge label={item.priority} colors={PRIORITY_COLORS[item.priority]} />
                </div>
                <h3 style={{ margin: '0 0 6px', color: '#E5E5E7', fontSize: '16px', fontWeight: 600 }}>{item.title}</h3>
                <p style={{ margin: '0 0 8px', color: '#A1A1AA', fontSize: '14px' }}>{item.description}</p>
                <span style={{ fontSize: '12px', color: '#71717A' }}>By: {item.createdByEmail}</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                <Link to={`/items/${item.id}`}>
                  <button style={{ padding: '8px 14px', background: '#1F1F23', color: '#E5E5E7', border: '1px solid #27272A', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, fontSize: '13px' }}>View</button>
                </Link>
                {(userRole === 'admin' || item.createdBy === currentUser.uid) && (
                  <>
                    <Link to={`/edit/${item.id}`}>
                      <button style={{ padding: '8px 14px', background: '#1F1F23', color: '#E5E5E7', border: '1px solid #27272A', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, fontSize: '13px' }}>Edit</button>
                    </Link>
                    <button onClick={() => handleDelete(item.id)} style={{ padding: '8px 14px', background: 'transparent', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, fontSize: '13px' }}>Delete</button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AllItems;
