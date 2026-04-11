import { Link, useLocation } from 'react-router-dom';

function Header() {
  const location = useLocation();

  return (
    <header>
      <div className="headersection">
        <div className="logo">WebDev.</div>
        <nav>
          <ul>
            <li><Link to="/" className={location.pathname === '/' ? 'active' : ''}>Home</Link></li>
            <li><Link to="/about" className={location.pathname === '/about' ? 'active' : ''}>About</Link></li>
            <li><Link to="/contact" className={location.pathname === '/contact' ? 'active' : ''}>Contact</Link></li>
            <li><Link to="/register" className={location.pathname === '/register' ? 'active' : ''}>Register</Link></li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;