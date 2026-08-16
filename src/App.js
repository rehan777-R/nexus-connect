import './App.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import CreateItem from './components/CreateItem';
import AllItems from './components/AllItems';
import SingleItem from './components/SingleItem';
import EditItem from './components/EditItem';
import Login from './Login';
import Signup from './Signup';
import ForgotPassword from './ForgotPassword';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';
import { PrivateRoute, AdminRoute } from './ProtectedRoute';
import Chat from './components/Chat';
import Board from './components/Board';
import Assistant from './components/Assistant';
import Profile from './components/Profile';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={<PrivateRoute><UserDashboard /></PrivateRoute>} />
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

        {/* CRUD Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<PrivateRoute><CreateItem /></PrivateRoute>} />
        <Route path="/items" element={<PrivateRoute><AllItems /></PrivateRoute>} />
        <Route path="/items/:id" element={<PrivateRoute><SingleItem /></PrivateRoute>} />
        <Route path="/edit/:id" element={<PrivateRoute><EditItem /></PrivateRoute>} />

        {/* Chat Route */}
        <Route path="/chat" element={<PrivateRoute><Chat /></PrivateRoute>} />

        {/* Board, AI Assistant & Profile */}
        <Route path="/board" element={<PrivateRoute><Board /></PrivateRoute>} />
        <Route path="/assistant" element={<PrivateRoute><Assistant /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
      </Routes>
    </Router>
  );
}

export default App;