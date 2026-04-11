import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import LogoutConfirmation from './LogoutConfirmation';

function AuthenticatedNavbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState('user');
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    setUserRole(role || 'user');
  }, []);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('profilePicture');

    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event('authChange'));

    setShowLogoutModal(false);
    navigate('/login');
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  return (
    <header>
      <div className="headersection">
        <div className="logo">
          <Link to="/home">WebDev</Link>
        </div>
        <nav>
          <ul>
            <li>
              <Link to="/home" className={location.pathname === '/home' ? 'active' : ''}>
                Home Page
              </Link>
            </li>
            <li>
              <Link to="/about" className={location.pathname === '/about' ? 'active' : ''}>
                About Page
              </Link>
            </li>
            {userRole !== 'admin' && (
              <li>
                <Link to="/contact" className={location.pathname === '/contact' ? 'active' : ''}>
                  Contact Page
                </Link>
              </li>
            )}
            <li>
              <Link to="/write-post" className={location.pathname === '/write-post' ? 'active' : ''}>
                Write Post
              </Link>
            </li>
            {userRole === 'admin' && (
              <li>
                <Link to="/admin" className={location.pathname === '/admin' ? 'active' : ''}>
                  Admin Panel
                </Link>
              </li>
            )}
            <li>
              <Link to="/profile" className={location.pathname === '/profile' ? 'active' : ''}>
                Profile
              </Link>
            </li>
            <li>
              <button onClick={handleLogoutClick} className="logout-btn-small">
                Logout
              </button>
            </li>
          </ul>
        </nav>
      </div>
      {showLogoutModal && (
        <LogoutConfirmation
          onConfirm={handleLogoutConfirm}
          onCancel={handleLogoutCancel}
        />
      )}
    </header>
  );
}

export default AuthenticatedNavbar;