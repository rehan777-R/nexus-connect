import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Board from './Board';
import { onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { useAuth } from '../AuthContext';

vi.mock('../firebase', () => ({ db: {} }));
vi.mock('../AuthContext', () => ({ useAuth: vi.fn() }));
vi.mock('../Toast', () => ({ useToast: () => vi.fn() }));
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  onSnapshot: vi.fn(),
  updateDoc: vi.fn(),
  doc: vi.fn((_db, col, id) => `${col}/${id}`),
}));

const TASKS = [
  { id: 't1', title: 'Design mockup', description: 'Hero section', status: 'To Do', priority: 'High', createdBy: 'me' },
  { id: 't2', title: 'Ship release', description: 'v1.0', status: 'Done', priority: 'Medium', createdBy: 'me' },
  { id: 't3', title: 'Other user task', description: 'hidden', status: 'To Do', priority: 'Low', createdBy: 'someone-else' },
];

function stubSnapshot(tasks) {
  onSnapshot.mockImplementation((_ref, cb) => {
    cb({ docs: tasks.map((t) => ({ id: t.id, data: () => { const { id, ...rest } = t; return rest; } })) });
    return () => {};
  });
}

function dropOnColumn(columnName, taskId) {
  const heading = screen.getByRole('heading', { name: columnName });
  const column = heading.parentElement.parentElement;
  fireEvent.drop(column, { dataTransfer: { getData: () => taskId } });
}

function renderBoard() {
  return render(
    <MemoryRouter>
      <Board />
    </MemoryRouter>
  );
}

afterEach(() => vi.clearAllMocks());

describe('Board', () => {
  it('renders the three Kanban columns with the user\'s own tasks', () => {
    useAuth.mockReturnValue({ currentUser: { uid: 'me' }, userRole: 'user' });
    stubSnapshot(TASKS);
    renderBoard();

    expect(screen.getByRole('heading', { name: 'To Do' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'In Progress' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Done' })).toBeInTheDocument();
    expect(screen.getByText('Design mockup')).toBeInTheDocument();
    expect(screen.getByText('Ship release')).toBeInTheDocument();
    expect(screen.queryByText('Other user task')).not.toBeInTheDocument();
  });

  it('shows an admin tasks from every user', () => {
    useAuth.mockReturnValue({ currentUser: { uid: 'admin-uid' }, userRole: 'admin' });
    stubSnapshot(TASKS);
    renderBoard();
    expect(screen.getByText('Other user task')).toBeInTheDocument();
  });

  it('updates the task status in Firestore when dropped on another column', async () => {
    useAuth.mockReturnValue({ currentUser: { uid: 'me' }, userRole: 'user' });
    stubSnapshot(TASKS);
    renderBoard();

    dropOnColumn('In Progress', 't1');
    await waitFor(() => {
      expect(updateDoc).toHaveBeenCalledWith('items/t1', { status: 'In Progress' });
    });
    expect(doc).toHaveBeenCalledWith(expect.anything(), 'items', 't1');
  });

  it('does not write to Firestore when dropped on its current column', async () => {
    useAuth.mockReturnValue({ currentUser: { uid: 'me' }, userRole: 'user' });
    stubSnapshot(TASKS);
    renderBoard();

    dropOnColumn('To Do', 't1');
    await waitFor(() => expect(updateDoc).not.toHaveBeenCalled());
  });
});
