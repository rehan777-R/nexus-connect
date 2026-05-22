import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

function EditItem() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, userRole } = useAuth();

useEffect(() => {
  const fetchItem = async () => {
    const docRef = doc(db, 'items', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (userRole !== 'admin' && data.createdBy !== currentUser.uid) {
        navigate('/items');
        return;
      }
      setTitle(data.title);
      setDescription(data.description);
    }
  };
  fetchItem();
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateDoc(doc(db, 'items', id), {
        title: title,
        description: description,
      });
      navigate('/items');
    } catch (error) {
      setError('Failed to update item. Try again!');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '30px' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', width: '100%', maxWidth: '500px' }}>

        <h2 style={{ textAlign: 'center', color: '#333', marginBottom: '30px', fontSize: '26px' }}>✏️ Edit Item</h2>

        {error && <p style={{ background: '#ffe0e0', color: 'red', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>{error}</p>}

        <form onSubmit={handleUpdate}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '6px', color: '#555', fontWeight: 'bold' }}>Title</label>
            <input
              type="text"
              placeholder="Enter item title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={{ width: '93%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '15px' }}
            />
          </div>
          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'block', marginBottom: '6px', color: '#555', fontWeight: 'bold' }}>Description</label>
            <textarea
              placeholder="Enter item description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows="5"
              style={{ width: '93%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '15px', resize: 'vertical' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '15px' }}>
            <button type="submit" disabled={loading} style={{ flex: 1, padding: '12px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
              {loading ? 'Updating...' : '✅ Update Item'}
            </button>
            <button type="button" onClick={() => navigate('/items')} style={{ flex: 1, padding: '12px', background: 'transparent', color: '#4f46e5', border: '1px solid #4f46e5', borderRadius: '8px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

export default EditItem;