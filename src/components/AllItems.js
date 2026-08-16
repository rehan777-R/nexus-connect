import React, { useState, useEffect, useMemo } from 'react';
import { collection, getDocs, deleteDoc, addDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useToast } from '../Toast';
import { PRIORITY_COLORS, STATUS_COLORS, Badge, dueDateInfo } from './taskBadges';

const SAMPLE_TASKS = [
  { title: 'Design landing page mockup', description: 'Create the hero section and pricing layout in Figma for client review.', status: 'In Progress', priority: 'High' },
  { title: 'Set up CI/CD pipeline', description: 'Configure automatic deployments to Vercel on every push to master.', status: 'To Do', priority: 'Medium' },
  { title: 'Write API documentation', description: 'Document all REST endpoints with request/response examples.', status: 'To Do', priority: 'Low' },
  { title: 'Fix mobile navbar overlap', description: 'Navbar links overlap the logo on screens under 400px wide.', status: 'Done', priority: 'High' },
  { title: 'Team sync meeting notes', description: 'Share weekly standup notes and blockers with the team.', status: 'Done', priority: 'Low' },
];

const PRIORITY_ORDER = { High: 0, Medium: 1, Low: 2 };

const filterSelectStyle = { width: 'auto', padding: '9px 12px', borderRadius: '8px', border: '1px solid #27272A', background: '#111113', color: '#E5E5E7', fontSize: '13px', outline: 'none', margin: 0 };

function AllItems() {
  const [items, setItems] = useState([]);
  const [loadingSamples, setLoadingSamples] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const { currentUser, userRole } = useAuth();
  const showToast = useToast();

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
      showToast('Task deleted');
      fetchItems();
    }
  };

  const loadSampleTasks = async () => {
    setLoadingSamples(true);
    try {
      for (const t of SAMPLE_TASKS) {
        await addDoc(collection(db, 'items'), {
          ...t,
          createdBy: currentUser.uid,
          createdByEmail: currentUser.email,
          createdAt: new Date().toISOString(),
        });
      }
      await fetchItems();
      showToast('Sample tasks loaded');
    } catch (err) {
      console.error('Error loading sample tasks:', err);
      showToast('Could not load sample tasks', 'error');
    }
    setLoadingSamples(false);
  };

  const visibleItems = useMemo(() => {
    let list = items;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (item) =>
          item.title?.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q)
      );
    }
    if (filterStatus !== 'All') list = list.filter((item) => item.status === filterStatus);
    if (filterPriority !== 'All') list = list.filter((item) => item.priority === filterPriority);

    return [...list].sort((a, b) => {
      if (sortBy === 'newest') return (b.createdAt || '').localeCompare(a.createdAt || '');
      if (sortBy === 'oldest') return (a.createdAt || '').localeCompare(b.createdAt || '');
      if (sortBy === 'priority') return (PRIORITY_ORDER[a.priority] ?? 3) - (PRIORITY_ORDER[b.priority] ?? 3);
      if (sortBy === 'dueDate') {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      }
      return 0;
    });
  }, [items, search, filterStatus, filterPriority, sortBy]);

  const hasFilters = search.trim() || filterStatus !== 'All' || filterPriority !== 'All';

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0B', padding: '30px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <h2 style={{ color: '#E5E5E7', margin: 0, fontSize: '22px', fontWeight: 600 }}>{userRole === 'admin' ? 'All Tasks' : 'My Tasks'}</h2>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link to="/board">
              <button style={{ padding: '10px 18px', background: '#1F1F23', color: '#E5E5E7', border: '1px solid #27272A', borderRadius: '8px', fontWeight: 500, fontSize: '14px', cursor: 'pointer' }}>
                Board view
              </button>
            </Link>
            <Link to="/create">
              <button style={{ padding: '10px 18px', background: '#2563EB', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>
                Create New
              </button>
            </Link>
          </div>
        </div>

        {/* Search / Filter / Sort bar */}
        {items.length > 0 && (
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ flex: 1, minWidth: '180px', padding: '9px 14px', borderRadius: '8px', border: '1px solid #27272A', background: '#111113', color: '#E5E5E7', fontSize: '13px', outline: 'none', margin: 0 }}
            />
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={filterSelectStyle}>
              <option value="All">All statuses</option>
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
            <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} style={filterSelectStyle}>
              <option value="All">All priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={filterSelectStyle}>
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="priority">By priority</option>
              <option value="dueDate">By due date</option>
            </select>
          </div>
        )}

        {items.length === 0 ? (
          <div style={{ background: '#111113', borderRadius: '12px', padding: '48px', textAlign: 'center', border: '1px solid #1F1F23' }}>
            <p style={{ color: '#71717A', fontSize: '15px', marginBottom: '20px' }}>No tasks found.</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <Link to="/create">
                <button style={{ padding: '10px 18px', background: '#2563EB', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '14px', cursor: 'pointer'}}>
                  Create First Task
                </button>
              </Link>
              <button onClick={loadSampleTasks} disabled={loadingSamples} style={{ padding: '10px 18px', background: 'transparent', color: '#A1A1AA', border: '1px solid #27272A', borderRadius: '8px', fontWeight: 500, fontSize: '14px', cursor: loadingSamples ? 'default' : 'pointer', opacity: loadingSamples ? 0.7 : 1 }}>
                {loadingSamples ? 'Loading...' : 'Load sample tasks'}
              </button>
            </div>
          </div>
        ) : visibleItems.length === 0 ? (
          <div style={{ background: '#111113', borderRadius: '12px', padding: '48px', textAlign: 'center', border: '1px solid #1F1F23' }}>
            <p style={{ color: '#71717A', fontSize: '15px', margin: 0 }}>
              {hasFilters ? 'No tasks match your filters.' : 'No tasks found.'}
            </p>
          </div>
        ) : (
          visibleItems.map((item) => {
            const due = dueDateInfo(item);
            return (
              <div key={item.id} style={{ background: '#111113', borderRadius: '12px', padding: '20px 24px', marginBottom: '14px', border: '1px solid #1F1F23', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ marginBottom: '10px' }}>
                    <Badge label={item.status} colors={STATUS_COLORS[item.status]} />
                    <Badge label={item.priority} colors={PRIORITY_COLORS[item.priority]} />
                    {due && <Badge label={due.label} colors={due.colors} />}
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
            );
          })
        )}
      </div>
    </div>
  );
}

export default AllItems;
