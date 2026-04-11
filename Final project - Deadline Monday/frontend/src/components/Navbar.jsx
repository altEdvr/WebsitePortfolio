import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('user'); // 'user' or 'admin'

  useEffect(() => {
    // Check authentication status (you can replace this with your auth logic)
    const token = localStorage.getItem('authToken');
    const role = localStorage.getItem('userRole');
    setIsAuthenticated(!!token);
    setUserRole(role || 'user');
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    setIsAuthenticated(false);
    setUserRole('user');
    navigate('/login');
  };

  return (
    <header>
      <div className="headersection">
        <div className="logo">
          <Link to="/">WebDev</Link>
        </div>
        <nav>
          <ul>
            <li>
              <Link to="/home" className={location.pathname === '/home' ? 'active' : ''}>
                Home
              </Link>
            </li>
            <li>
              <Link to="/about" className={location.pathname === '/about' ? 'active' : ''}>
                About
              </Link>
            </li>
            <li>
              <Link to="/contact" className={location.pathname === '/contact' ? 'active' : ''}>
                Contact
              </Link>
            </li>
            <li>
              <Link to="/register" className={location.pathname === '/register' ? 'active' : ''}>
                Register
              </Link>
            </li>
            <li>
              <button onClick={() => navigate('/login')} className="signin-btn">
                Sign In
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;