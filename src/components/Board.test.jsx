import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Board from './Board';
import { onSnapshot, updateDoc, doc, query, where } from 'firebase/firestore';
import { useAuth } from '../AuthContext';

vi.mock('../firebase', () => ({ db: {} }));
vi.mock('../AuthContext', () => ({ useAuth: vi.fn() }));
vi.mock('../Toast', () => ({ useToast: () => vi.fn() }));
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(() => 'items-ref'),
  query: vi.fn(() => 'scoped-query'),
  where: vi.fn(),
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
  it('renders the three Kanban columns with a query scoped to the user\'s own tasks', () => {
    useAuth.mockReturnValue({ currentUser: { uid: 'me' }, userRole: 'user' });
    stubSnapshot(TASKS.filter((t) => t.createdBy === 'me'));
    renderBoard();

    expect(screen.getByRole('heading', { name: 'To Do' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'In Progress' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Done' })).toBeInTheDocument();
    expect(screen.getByText('Design mockup')).toBeInTheDocument();
    expect(screen.getByText('Ship release')).toBeInTheDocument();
    expect(where).toHaveBeenCalledWith('createdBy', '==', 'me');
    expect(onSnapshot).toHaveBeenCalledWith('scoped-query', expect.any(Function));
  });

  it('subscribes an admin to every user\'s tasks', () => {
    useAuth.mockReturnValue({ currentUser: { uid: 'admin-uid' }, userRole: 'admin' });
    stubSnapshot(TASKS);
    renderBoard();
    expect(screen.getByText('Other user task')).toBeInTheDocument();
    expect(query).not.toHaveBeenCalled();
    expect(onSnapshot).toHaveBeenCalledWith('items-ref', expect.any(Function));
  });

  it('updates the task status in Firestore when dropped on another column', async () => {
    useAuth.mockReturnValue({ currentUser: { uid: 'me' }, userRole: 'user' });
    stubSnapshot(TASKS.filter((t) => t.createdBy === 'me'));
    renderBoard();

    dropOnColumn('In Progress', 't1');
    await waitFor(() => {
      expect(updateDoc).toHaveBeenCalledWith('items/t1', { status: 'In Progress' });
    });
    expect(doc).toHaveBeenCalledWith(expect.anything(), 'items', 't1');
  });

  it('does not write to Firestore when dropped on its current column', async () => {
    useAuth.mockReturnValue({ currentUser: { uid: 'me' }, userRole: 'user' });
    stubSnapshot(TASKS.filter((t) => t.createdBy === 'me'));
    renderBoard();

    dropOnColumn('To Do', 't1');
    await waitFor(() => expect(updateDoc).not.toHaveBeenCalled());
  });
});
