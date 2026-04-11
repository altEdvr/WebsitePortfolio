import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AuthenticatedNavbar from './components/AuthenticatedNavbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Register from './pages/Register';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import SplashPage from './pages/SplashPage';
import PostPage from './pages/PostPage';
import EditPostPage from './pages/EditPostPage';
import WritePost from './pages/WritePost';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check initial authentication state
    const checkAuth = () => {
      const token = localStorage.getItem('authToken');
      setIsAuthenticated(!!token);
    };

    checkAuth();

    // Listen for storage changes (login/logout)
    const handleStorageChange = (e) => {
      if (e.key === 'authToken') {
        checkAuth();
      }
    };

    // Listen for custom auth events
    const handleAuthChange = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authChange', handleAuthChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, []);

  return (
    <Router>
      {isAuthenticated ? <AuthenticatedNavbar /> : <Navbar />}
      <Routes>
        {/* Public routes - accessible without authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={
          localStorage.getItem('userRole') === 'admin' ? <Navigate to="/home" replace /> : <Contact />
        } />
        <Route path="/post/:postId" element={<PostPage />} />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/write-post" element={
          <ProtectedRoute>
            <WritePost />
          </ProtectedRoute>
        } />
        <Route path="/write-post/:postId" element={
          <ProtectedRoute>
            <WritePost />
          </ProtectedRoute>
        } />
        <Route path="/edit-post/:postId" element={
          <ProtectedRoute>
            <EditPostPage />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute>
            <Admin />
          </ProtectedRoute>
        } />

        {/* Default route - redirect based on authentication */}
        <Route path="/" element={
          localStorage.getItem('authToken') ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />
        } />

        {/* Catch all - redirect to appropriate page */}
        <Route path="*" element={
          localStorage.getItem('authToken') ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />
        } />
      </Routes>
    </Router>
  );
}

export default App;    