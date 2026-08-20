import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { PrivateRoute, AdminRoute } from './ProtectedRoute';
import { useAuth } from './AuthContext';

vi.mock('./AuthContext', () => ({
  useAuth: vi.fn(),
}));

function renderWithRoutes(element) {
  return render(
    <MemoryRouter initialEntries={['/protected']}>
      <Routes>
        <Route path="/protected" element={element} />
        <Route path="/login" element={<p>Login page</p>} />
        <Route path="/dashboard" element={<p>User dashboard</p>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('PrivateRoute', () => {
  it('renders nothing while auth state is loading', () => {
    useAuth.mockReturnValue({ currentUser: null, loading: true });
    const { container } = renderWithRoutes(<PrivateRoute><p>Secret</p></PrivateRoute>);
    expect(container).toBeEmptyDOMElement();
  });

  it('redirects logged-out visitors to the login page', () => {
    useAuth.mockReturnValue({ currentUser: null, loading: false });
    renderWithRoutes(<PrivateRoute><p>Secret</p></PrivateRoute>);
    expect(screen.getByText('Login page')).toBeInTheDocument();
    expect(screen.queryByText('Secret')).not.toBeInTheDocument();
  });

  it('renders children for a logged-in user', () => {
    useAuth.mockReturnValue({ currentUser: { uid: 'u1' }, loading: false });
    renderWithRoutes(<PrivateRoute><p>Secret</p></PrivateRoute>);
    expect(screen.getByText('Secret')).toBeInTheDocument();
  });
});

describe('AdminRoute', () => {
  it('redirects logged-out visitors to the login page', () => {
    useAuth.mockReturnValue({ currentUser: null, userRole: null, loading: false });
    renderWithRoutes(<AdminRoute><p>Admin area</p></AdminRoute>);
    expect(screen.getByText('Login page')).toBeInTheDocument();
  });

  it('redirects non-admin users to their dashboard', () => {
    useAuth.mockReturnValue({ currentUser: { uid: 'u1' }, userRole: 'user', loading: false });
    renderWithRoutes(<AdminRoute><p>Admin area</p></AdminRoute>);
    expect(screen.getByText('User dashboard')).toBeInTheDocument();
    expect(screen.queryByText('Admin area')).not.toBeInTheDocument();
  });

  it('renders children for an admin', () => {
    useAuth.mockReturnValue({ currentUser: { uid: 'u1' }, userRole: 'admin', loading: false });
    renderWithRoutes(<AdminRoute><p>Admin area</p></AdminRoute>);
    expect(screen.getByText('Admin area')).toBeInTheDocument();
  });
});
