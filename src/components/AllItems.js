import React, { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { Link } from 'react-router-dom';
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
    <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 'bold', background: colors.bg, color: colors.text, marginRight: '8px' }}>
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
    <div style={{ minHeight: '100vh', background: '#f0f2f5', padding: '30px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
          <h2 style={{ color: '#333', margin: 0 }}>📋 {userRole === 'admin' ? 'All Tasks' : 'My Tasks'}</h2>
          <Link to="/create">
            <button style={{ padding: '10px 20px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
              ➕ Create New
            </button>
          </Link>
        </div>
        {items.length === 0 ? (
          <div style={{ background: 'white', borderRadius: '12px', padding: '40px', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
            <div style={{ fontSize: '50px' }}>📭</div>
            <p style={{ color: '#888', fontSize: '18px' }}>No tasks found!</p>
            <Link to="/create">
              <button style={{ padding: '10px 20px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer'}}>
                Create First Task
              </button>
            </Link>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} style={{ background: 'white', borderRadius: '12px', padding: '20px 25px', marginBottom: '15px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ marginBottom: '8px' }}>
                  <Badge label={item.status} colors={STATUS_COLORS[item.status]} />
                  <Badge label={item.priority} colors={PRIORITY_COLORS[item.priority]} />
                </div>
                <h3 style={{ margin: '0 0 8px', color: '#333' }}>{item.title}</h3>
                <p style={{ margin: '0 0 5px', color: '#666' }}>{item.description}</p>
                <span style={{ fontSize: '12px', color: '#aaa' }}>By: {item.createdByEmail}</span>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <Link to={`/items/${item.id}`}>
                  <button style={{ padding: '8px 15px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>View</button>
                </Link>
                {(userRole === 'admin' || item.createdBy === currentUser.uid) && (
                  <>
                    <Link to={`/edit/${item.id}`}>
                      <button style={{ padding: '8px 15px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight:'bold' }}>Edit</button>
                    </Link>
                    <button onClick={() => handleDelete(item.id)} style={{ padding: '8px 15px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Delete</button>
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
