import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import AllItems from './AllItems';
import { getDocs, query, where } from 'firebase/firestore';
import { useAuth } from '../AuthContext';

vi.mock('../firebase', () => ({ db: {} }));
vi.mock('../AuthContext', () => ({ useAuth: vi.fn() }));
vi.mock('../Toast', () => ({ useToast: () => vi.fn() }));
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(() => 'items-ref'),
  query: vi.fn(() => 'scoped-query'),
  where: vi.fn(),
  getDocs: vi.fn(),
  deleteDoc: vi.fn(),
  addDoc: vi.fn(),
  doc: vi.fn(),
}));

const TASKS = [
  { id: 't1', title: 'Fix navbar bug', description: 'Overlap on mobile', status: 'To Do', priority: 'High', createdBy: 'me', createdByEmail: 'me@x.com', createdAt: '2026-08-01T10:00:00Z' },
  { id: 't2', title: 'Write docs', description: 'API examples', status: 'Done', priority: 'Low', createdBy: 'me', createdByEmail: 'me@x.com', createdAt: '2026-08-05T10:00:00Z' },
  { id: 't3', title: 'Set up CI', description: 'GitHub Actions', status: 'In Progress', priority: 'Medium', createdBy: 'someone-else', createdByEmail: 'other@x.com', createdAt: '2026-08-03T10:00:00Z' },
];

function stubTasks(tasks) {
  getDocs.mockResolvedValue({
    docs: tasks.map((t) => ({ id: t.id, data: () => { const { id, ...rest } = t; return rest; } })),
  });
}

function renderPage() {
  return render(
    <MemoryRouter>
      <AllItems />
    </MemoryRouter>
  );
}

afterEach(() => vi.clearAllMocks());

describe('AllItems', () => {
  it('queries only the user\'s own tasks for a regular user', async () => {
    useAuth.mockReturnValue({ currentUser: { uid: 'me', email: 'me@x.com' }, userRole: 'user' });
    stubTasks(TASKS.filter((t) => t.createdBy === 'me'));
    renderPage();

    expect(await screen.findByText('Fix navbar bug')).toBeInTheDocument();
    expect(screen.getByText('Write docs')).toBeInTheDocument();
    expect(where).toHaveBeenCalledWith('createdBy', '==', 'me');
    expect(getDocs).toHaveBeenCalledWith('scoped-query');
    expect(screen.getByRole('heading', { name: 'My Tasks' })).toBeInTheDocument();
  });

  it('queries the whole collection for an admin', async () => {
    useAuth.mockReturnValue({ currentUser: { uid: 'admin-uid', email: 'admin@x.com' }, userRole: 'admin' });
    stubTasks(TASKS);
    renderPage();

    expect(await screen.findByText('Set up CI')).toBeInTheDocument();
    expect(screen.getByText('Fix navbar bug')).toBeInTheDocument();
    expect(query).not.toHaveBeenCalled();
    expect(getDocs).toHaveBeenCalledWith('items-ref');
    expect(screen.getByRole('heading', { name: 'All Tasks' })).toBeInTheDocument();
  });

  it('filters tasks by search text', async () => {
    useAuth.mockReturnValue({ currentUser: { uid: 'me', email: 'me@x.com' }, userRole: 'user' });
    stubTasks(TASKS.filter((t) => t.createdBy === 'me'));
    renderPage();
    await screen.findByText('Fix navbar bug');

    await userEvent.type(screen.getByPlaceholderText('Search tasks...'), 'docs');
    expect(screen.getByText('Write docs')).toBeInTheDocument();
    expect(screen.queryByText('Fix navbar bug')).not.toBeInTheDocument();
  });

  it('filters tasks by status', async () => {
    useAuth.mockReturnValue({ currentUser: { uid: 'me', email: 'me@x.com' }, userRole: 'user' });
    stubTasks(TASKS.filter((t) => t.createdBy === 'me'));
    renderPage();
    await screen.findByText('Fix navbar bug');

    await userEvent.selectOptions(screen.getByDisplayValue('All statuses'), 'Done');
    expect(screen.getByText('Write docs')).toBeInTheDocument();
    expect(screen.queryByText('Fix navbar bug')).not.toBeInTheDocument();
  });

  it('tells the user when no task matches the filters', async () => {
    useAuth.mockReturnValue({ currentUser: { uid: 'me', email: 'me@x.com' }, userRole: 'user' });
    stubTasks(TASKS.filter((t) => t.createdBy === 'me'));
    renderPage();
    await screen.findByText('Fix navbar bug');

    await userEvent.type(screen.getByPlaceholderText('Search tasks...'), 'zzz-no-match');
    expect(screen.getByText('No tasks match your filters.')).toBeInTheDocument();
  });

  it('offers sample tasks when the list is empty', async () => {
    useAuth.mockReturnValue({ currentUser: { uid: 'me', email: 'me@x.com' }, userRole: 'user' });
    stubTasks([]);
    renderPage();

    expect(await screen.findByText('No tasks found.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Load sample tasks' })).toBeInTheDocument();
  });
});
