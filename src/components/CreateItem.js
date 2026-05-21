import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

function CreateItem() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'items'), {
        title: title,
        description: description,
        createdBy: currentUser.uid,
        createdByEmail: currentUser.email,
        createdAt: new Date().toISOString()
      });
      navigate('/items');
    } catch (error) {
      console.error('Error adding document: ', error);
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '30px' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', width: '100%', maxWidth: '500px' }}>
        
        <h2 style={{ textAlign: 'center', color: '#333', marginBottom: '30px', fontSize: '26px' }}>➕ Create New Item</h2>
        
        <form onSubmit={handleSubmit}>
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
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
            {loading ? 'Creating...' : '✅ Create Item'}
          </button>
        </form>

        <button onClick={() => navigate('/items')} style={{ width: '100%', padding: '12px', background: 'transparent', color: '#4f46e5', border: '1px solid #4f46e5', borderRadius: '8px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', marginTop: '15px' }}>
          ← Back to Items
        </button>

      </div>
    </div>
  );
}

export default CreateItem;