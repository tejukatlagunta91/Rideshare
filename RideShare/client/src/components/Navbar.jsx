import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  return (
    <>
      {user && (
        <button onClick={handleLogout} className="btn-secondary logout-btn">
          Logout
        </button>
      )}

      <nav className="sidebar glass">
        <Link to="/" className="sidebar-logo">
          Ride<span className="accent-text">Share</span>
        </Link>
        
        <ul className="sidebar-menu">
          <li className="nav-item">
            <Link to="/" className={`sidebar-link ${location.pathname === '/' ? 'active' : ''}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              Home
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/rides" className={`sidebar-link ${location.pathname === '/rides' ? 'active' : ''}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              Find a Ride
            </Link>
          </li>
          
          {user ? (
            <>
              <li className="nav-item">
                <Link to="/post-ride" className={`sidebar-link ${location.pathname === '/post-ride' ? 'active' : ''}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>
                  Offer a Ride
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/bookings" className={`sidebar-link ${location.pathname === '/bookings' ? 'active' : ''}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                  My Bookings
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/driver-bookings" className={`sidebar-link ${location.pathname === '/driver-bookings' ? 'active' : ''}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="12" r="2"/><circle cx="15" cy="12" r="2"/></svg>
                  Drive Requests
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/report" className={`sidebar-link ${location.pathname === '/report' ? 'active' : ''}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  Report Issue
                </Link>
              </li>
              {user.role === 'admin' && (
                <li className="nav-item">
                  <Link to="/admin" className={`sidebar-link ${location.pathname === '/admin' ? 'active' : ''}`} style={{ borderLeft: '2px solid var(--accent)' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    Admin Dashboard
                  </Link>
                </li>
              )}
            </>
          ) : (
            <div style={{ marginTop: 'auto' }}>
              <li className="nav-item" style={{ marginBottom: '10px' }}>
                <Link to="/login" className={`sidebar-link ${location.pathname === '/login' ? 'active' : ''}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  Log In
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/register" className="btn-primary" style={{ width: '100%', display: 'block', textAlign: 'center' }}>
                  Sign Up
                </Link>
              </li>
            </div>
          )}
        </ul>
      </nav>
    </>
  );
};

export default Navbar;
