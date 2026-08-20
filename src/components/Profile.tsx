import React, { useEffect, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { db, auth } from '../firebase';
import { useAuth } from '../AuthContext';
import { useToast } from '../Toast';

const AVATAR_COLORS = ['#2563EB', '#7C3AED', '#DB2777', '#EF4444', '#EA580C', '#EAB308', '#22C55E', '#0D9488'];

const card: React.CSSProperties = { background: '#111113', border: '1px solid #1F1F23', borderRadius: '12px', padding: '28px' };
const labelStyle: React.CSSProperties = { display: 'block', marginBottom: '8px', color: '#A1A1AA', fontWeight: 500, fontSize: '13px' };
const inputStyle: React.CSSProperties = { width: '100%', boxSizing: 'border-box', padding: '12px 14px', borderRadius: '8px', border: '1px solid #27272A', background: '#0A0A0B', color: '#E5E5E7', fontSize: '14px', outline: 'none', margin: 0 };

function Profile() {
  const { currentUser, userRole } = useAuth();
  const showToast = useToast();
  const [displayName, setDisplayName] = useState('');
  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[0]);
  const [joined, setJoined] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    const uid = currentUser.uid;
    async function fetchProfile() {
      const snap = await getDoc(doc(db, 'users', uid));
      if (snap.exists()) {
        const data = snap.data();
        setDisplayName(data.displayName || '');
        setAvatarColor(data.avatarColor || AVATAR_COLORS[0]);
        setJoined(data.createdAt?.slice(0, 10) || '');
      }
    }
    fetchProfile();
  }, [currentUser]);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentUser) return;
    setSaving(true);
    try {
      await setDoc(
        doc(db, 'users', currentUser.uid),
        { displayName: displayName.trim(), avatarColor },
        { merge: true }
      );
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: displayName.trim() });
      }
      showToast('Profile updated');
    } catch (err) {
      console.error('Error saving profile:', err);
      showToast('Could not save profile', 'error');
    }
    setSaving(false);
  };

  const initial = (displayName || currentUser?.email || '?')[0].toUpperCase();

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0B', display: 'flex', justifyContent: 'center', padding: '40px 30px' }}>
      <div style={{ width: '100%', maxWidth: '520px' }}>
        <div style={{ ...card, marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '26px', fontWeight: 700, flexShrink: 0 }}>
            {initial}
          </div>
          <div style={{ minWidth: 0 }}>
            <h2 style={{ color: '#E5E5E7', margin: 0, fontSize: '20px', fontWeight: 600 }}>
              {displayName || 'Unnamed user'}
            </h2>
            <p style={{ color: '#71717A', margin: '4px 0 0', fontSize: '13.5px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentUser?.email}</p>
            <div style={{ marginTop: '8px', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ background: userRole === 'admin' ? 'rgba(234,179,8,0.12)' : 'rgba(37,99,235,0.12)', color: userRole === 'admin' ? '#EAB308' : '#3B82F6', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 500 }}>
                {userRole || 'user'}
              </span>
              {joined && <span style={{ color: '#71717A', fontSize: '12px' }}>Joined {joined}</span>}
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} style={card}>
          <h3 style={{ color: 'white', margin: '0 0 20px', fontSize: '15px', fontWeight: 600 }}>Edit profile</h3>
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Display name</label>
            <input
              type="text"
              placeholder="How your teammates see you"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={40}
              style={inputStyle}
            />
          </div>
          <div style={{ marginBottom: '26px' }}>
            <label style={labelStyle}>Avatar color</label>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {AVATAR_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setAvatarColor(color)}
                  aria-label={`Avatar color ${color}`}
                  style={{
                    width: '32px', height: '32px', borderRadius: '50%', background: color,
                    border: avatarColor === color ? '2px solid #E5E5E7' : '2px solid transparent',
                    cursor: 'pointer', padding: 0,
                  }}
                />
              ))}
            </div>
          </div>
          <button type="submit" disabled={saving} className="btn-primary" style={{ width: '100%', padding: '12px', fontSize: '14px', fontWeight: 600, opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Profile;
