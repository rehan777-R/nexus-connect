import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';

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
              <button style={{ padding: '10px 20px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                ✏️ Edit
              </button>
            </Link>
          )}
          <Link to="/items">
            <button style={{ padding: '10px 20px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
              ← Back to Items
            </button>
          </Link>
        </div>

      </div>
    </div>
  );
}

export default SingleItem;