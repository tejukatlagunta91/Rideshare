import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import './Home.css';

const Home = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="home-container">
      <div style={{ maxWidth: '1200px', margin: '30px auto 0', padding: '0 20px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', color: 'var(--text-primary)' }}>
          {user ? `Welcome back, ${user.name || 'User'} 👋` : 'Welcome to RideShare'}
        </h2>
      </div>

      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Share the journey. <br/>
            <span className="gradient-text">Cut the cost.</span>
          </h1>
          <p className="hero-subtitle">
            Find reliable drivers, book your seat, and travel comfortably with our modern ride-sharing platform. Connecting you to where you need to be.
          </p>
          <div className="hero-cta">
            <Link to="/rides" className="btn-primary">Find a Ride</Link>
            <Link to="/post-ride" className="btn-secondary">Offer a Ride</Link>
          </div>
        </div>
        <div className="hero-visual">
          <div className="floating-card user-card">
            <div className="card-avatar"></div>
            <div className="card-info">
              <h4>Sarah J.</h4>
              <p>Driver • 4.9⭐</p>
            </div>
          </div>
          <div className="floating-card route-card">
            <h4>📍 Downtown ➔ Airport</h4>
            <p>Today at 3:00 PM • $15</p>
          </div>
          <div className="abstract-shape"></div>
        </div>
      </section>
    </div>
  );
};

export default Home;
