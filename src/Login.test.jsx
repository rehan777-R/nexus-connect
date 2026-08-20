import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Login from './Login';
import { useAuth } from './AuthContext';

vi.mock('./firebase', () => ({ db: {} }));
vi.mock('./AuthContext', () => ({ useAuth: vi.fn() }));
vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  setDoc: vi.fn(),
}));

function renderLogin() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<p>Dashboard page</p>} />
      </Routes>
    </MemoryRouter>
  );
}

afterEach(() => vi.clearAllMocks());

describe('Login', () => {
  it('logs in with email and password, then redirects to the dashboard', async () => {
    const login = vi.fn().mockResolvedValue({ user: { uid: 'u1', email: 'a@b.com' } });
    useAuth.mockReturnValue({ login, googleLogin: vi.fn() });
    renderLogin();

    await userEvent.type(screen.getByPlaceholderText('you@company.com'), 'a@b.com');
    await userEvent.type(screen.getByPlaceholderText('Enter your password'), 'secret123');
    await userEvent.click(screen.getByRole('button', { name: 'Login' }));

    expect(login).toHaveBeenCalledWith('a@b.com', 'secret123');
    expect(await screen.findByText('Dashboard page')).toBeInTheDocument();
  });

  it('shows an error message when credentials are rejected', async () => {
    const login = vi.fn().mockRejectedValue(new Error('auth/wrong-password'));
    useAuth.mockReturnValue({ login, googleLogin: vi.fn() });
    renderLogin();

    await userEvent.type(screen.getByPlaceholderText('you@company.com'), 'a@b.com');
    await userEvent.type(screen.getByPlaceholderText('Enter your password'), 'wrong');
    await userEvent.click(screen.getByRole('button', { name: 'Login' }));

    expect(await screen.findByText('Invalid email or password!')).toBeInTheDocument();
    expect(screen.queryByText('Dashboard page')).not.toBeInTheDocument();
  });

  it('supports Google sign-in', async () => {
    const googleLogin = vi.fn().mockResolvedValue({ user: { uid: 'u1', email: 'a@b.com' } });
    useAuth.mockReturnValue({ login: vi.fn(), googleLogin });
    renderLogin();

    await userEvent.click(screen.getByRole('button', { name: 'Sign in with Google' }));
    expect(googleLogin).toHaveBeenCalled();
    expect(await screen.findByText('Dashboard page')).toBeInTheDocument();
  });
});
