import { useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import MapComponent from '../components/MapComponent';

const RidesList = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  // Search fields state
  const [searchParams, setSearchParams] = useState({
    departure: '',
    destination: '',
    date: '',
    minPrice: '',
    maxPrice: '',
    seats: '',
    sort: 'dateAsc'
  });

  const [bookingRideId, setBookingRideId] = useState(null);
  const [seatsToBook, setSeatsToBook] = useState(1);
  
  // Driver reviews state
  const [driverReviews, setDriverReviews] = useState([]);
  const [viewingDriverId, setViewingDriverId] = useState(null);

  const fetchDriverReviews = async (driverId) => {
    if (viewingDriverId === driverId) {
       setViewingDriverId(null);
       return;
    }
    try {
      const res = await api.get(`/reviews/${driverId}`);
      setDriverReviews(res.data.data);
      setViewingDriverId(driverId);
    } catch (err) {
      console.error('Failed to fetch driver reviews', err);
    }
  };

  const renderStars = (rating) => {
    return (
      <span style={{ display: 'inline-flex', gap: '2px', color: '#f1c40f', fontSize: '1rem', letterSpacing: '1px' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} style={{ color: star <= Math.round(rating) ? '#f1c40f' : 'rgba(255,255,255,0.12)' }}>
            ★
          </span>
        ))}
      </span>
    );
  };

  const fetchRides = async (params = {}) => {
    setLoading(true);
    try {
      const isSearching = params.departure || params.destination || params.date;
      const url = isSearching ? '/rides/search' : '/rides';
      
      const res = await api.get(url, { params });
      setRides(res.data.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch rides');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRides();
  }, []);

  const onChange = (e) => {
    setSearchParams({ ...searchParams, [e.target.name]: e.target.value });
  };

  const onSearch = (e) => {
    e.preventDefault();
    fetchRides(searchParams);
  };

  const clearSearch = () => {
    setSearchParams({ departure: '', destination: '', date: '', minPrice: '', maxPrice: '', seats: '', sort: 'dateAsc' });
    fetchRides();
  };

  const startBooking = (rideId) => {
    setSuccessMsg('');
    setError('');
    setBookingRideId(rideId);
    setSeatsToBook(1);
  };

  const confirmBooking = async (rideId) => {
    try {
      const res = await api.post('/bookings', { rideId, seatsBooked: seatsToBook });

      if (res.data.success) {
        setSuccessMsg('Booking confirmed! Redirecting to history...');
        setBookingRideId(null);
        // We use navigate instead of alert, and timeout to let them see successMsg
        setTimeout(() => navigate('/bookings'), 1200);
      }
    } catch (err) {
      if (err.response?.status === 401) {
          setError('You must be logged in to book a ride.');
          setTimeout(() => navigate('/login'), 2000);
      } else {
          setError(err.response?.data?.message || 'Failed to book ride');
      }
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px' }}>
      <h2 style={{ fontSize: '2.5rem', marginBottom: '30px', color: 'var(--text-primary)' }}>Find a Ride</h2>
      
      {/* Search Form Banner */}
      <div className="glass" style={{ padding: '24px', borderRadius: '16px', marginBottom: '40px', border: '1px solid var(--surface-border)' }}>
        <form onSubmit={onSearch} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Departure</label>
            <input type="text" name="departure" value={searchParams.departure} onChange={onChange} placeholder="E.g. New York" style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--surface-border)', color: 'white' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Destination</label>
            <input type="text" name="destination" value={searchParams.destination} onChange={onChange} placeholder="E.g. Boston" style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--surface-border)', color: 'white' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Date</label>
            <input type="date" name="date" value={searchParams.date} onChange={onChange} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--surface-border)', color: 'white', colorScheme: 'dark' }} />
          </div>
          <div>
             <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Min Price ($)</label>
             <input type="number" name="minPrice" value={searchParams.minPrice} onChange={onChange} placeholder="Min" style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--surface-border)', color: 'white' }} />
          </div>
          <div>
             <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Max Price ($)</label>
             <input type="number" name="maxPrice" value={searchParams.maxPrice} onChange={onChange} placeholder="Max" style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--surface-border)', color: 'white' }} />
          </div>
          <div>
             <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Seats</label>
             <input type="number" name="seats" value={searchParams.seats} onChange={onChange} placeholder="1" min="1" style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--surface-border)', color: 'white' }} />
          </div>
          <div>
             <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Sort By</label>
             <select name="sort" value={searchParams.sort} onChange={onChange} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'var(--surface)', border: '1px solid var(--surface-border)', color: 'white', cursor: 'pointer' }}>
                 <option value="dateAsc">Date: Earliest First</option>
                 <option value="dateDesc">Date: Latest First</option>
                 <option value="priceAsc">Price: Low to High</option>
                 <option value="priceDesc">Price: High to Low</option>
             </select>
          </div>
          
          <div style={{ display: 'flex', gap: '10px', gridColumn: '1 / -1', marginTop: '5px' }}>
            <button type="submit" className="btn-primary" style={{ flex: 2, padding: '12px' }}>Search</button>
            <button type="button" onClick={clearSearch} className="btn-secondary" style={{ flex: 1, padding: '12px', border: '1px solid var(--surface-border)', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', color: 'white', cursor: 'pointer' }}>Clear</button>
          </div>
        </form>
      </div>
      
      {error && <div style={{color: 'white', background: '#e74c3c', padding: '15px', borderRadius: '8px', marginBottom: '20px'}}>{error}</div>}
      {successMsg && <div style={{color: 'white', background: '#2ecc71', padding: '15px', borderRadius: '8px', marginBottom: '20px'}}>{successMsg}</div>}
      
      {loading ? (
        <p style={{ color: 'var(--text-secondary)' }}>Searching amazing journeys...</p>
      ) : rides.filter(r => r.status !== 'cancelled' && r.availableSeats > 0 && r.date >= new Date().toISOString().split('T')[0]).length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', background: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--surface-border)' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>No rides match your search. Try different locations or dates!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {rides.filter(r => r.status !== 'cancelled' && r.availableSeats > 0 && r.date >= new Date().toISOString().split('T')[0]).map((ride) => {
            const isYourRide = user && ride.driverId && (ride.driverId._id === user._id || ride.driverId._id === user.id);
            const isViewingReviews = viewingDriverId === ride.driverId?._id;
            
            return (
            <div key={ride._id}>
              <div className="glass" style={{ padding: '24px', borderRadius: isViewingReviews ? '16px 16px 0 0' : '16px', borderBottom: isViewingReviews ? 'none' : '1px solid var(--surface-border)', border: isYourRide && !isViewingReviews ? '2px solid var(--primary)' : '1px solid var(--surface-border)', background: isYourRide ? 'rgba(90, 75, 218, 0.05)' : 'var(--surface)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <h3 style={{ fontSize: '1.4rem', color: 'var(--primary)', margin: 0 }}>
                        {ride.departure} ➔ {ride.destination}
                      </h3>
                      {isYourRide && <span style={{ background: 'var(--primary)', color: 'white', fontSize: '0.75rem', padding: '4px 8px', borderRadius: '12px', fontWeight: 'bold' }}>Your Ride</span>}
                      <span style={{ 
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px', 
                        borderRadius: '20px', 
                        fontSize: '0.8rem', 
                        fontWeight: '700', 
                        letterSpacing: '0.5px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        backgroundColor: ride.status === 'upcoming' ? 'rgba(46, 204, 113, 0.15)' : ride.status === 'started' ? 'rgba(243, 156, 18, 0.15)' : ride.status === 'completed' ? 'rgba(52, 152, 219, 0.15)' : 'rgba(231, 76, 60, 0.15)',
                        color: ride.status === 'upcoming' ? '#2ecc71' : ride.status === 'started' ? '#f39c12' : ride.status === 'completed' ? '#3498db' : '#e74c3c',
                        border: `1px solid ${ride.status === 'upcoming' ? 'rgba(46, 204, 113, 0.3)' : ride.status === 'started' ? 'rgba(243, 156, 18, 0.3)' : ride.status === 'completed' ? 'rgba(52, 152, 219, 0.3)' : 'rgba(231, 76, 60, 0.3)'}`
                      }}>
                        {ride.status === 'upcoming' && '🟢 '}
                        {ride.status === 'started' && '🚗 '}
                        {ride.status === 'completed' && '✅ '}
                        {ride.status === 'cancelled' && '❌ '}
                        {ride.status.toUpperCase()}
                      </span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      📅 {ride.date} at {ride.time}
                    </p>
                    <p style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      👤 Driver: 
                      <span 
                        style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 'bold' }} 
                        onClick={() => ride.driverId && fetchDriverReviews(ride.driverId._id)}
                      >
                        {ride.driverId ? ride.driverId.name : 'Unknown User'}
                      </span>
                      {ride.driverId && ride.driverId.reviewCount > 0 && (
                        <span 
                          style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px' }} 
                          onClick={() => fetchDriverReviews(ride.driverId._id)}
                        >
                          <span style={{color: 'rgba(255,255,255,0.2)'}}>|</span> {renderStars(ride.driverId.averageRating)} <span style={{ fontSize: '0.85rem', marginTop: '2px' }}>({ride.driverId.reviewCount})</span>
                        </span>
                      )}
                      <span style={{color: 'rgba(255,255,255,0.2)'}}>|</span> 🪑 {ride.availableSeats} seats left
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--accent)', marginBottom: '12px' }}>
                      ${ride.price} <span style={{fontSize: '1rem', fontWeight: 'normal', color: 'var(--text-secondary)'}}>/ seat</span>
                    </div>
                    
                    {isYourRide ? (
                      <button disabled className="btn-secondary" style={{ padding: '8px 16px', opacity: 0.7, cursor: 'not-allowed', color: 'var(--primary)', borderColor: 'var(--primary)' }}>You cannot book your own ride</button>
                    ) : ride.status === 'started' || ride.status === 'completed' ? (
                      <button disabled className="btn-secondary" style={{ padding: '8px 16px', opacity: 0.5, cursor: 'not-allowed' }}>{ride.status === 'started' ? 'Ride in Progress' : 'Ride Completed'}</button>
                    ) : bookingRideId === ride._id ? (
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                         <label style={{fontSize: '0.9rem', color: 'var(--text-primary)'}}>Seats:</label>
                         <input type="number" min="1" max={ride.availableSeats} value={seatsToBook} onChange={(e) => setSeatsToBook(Number(e.target.value))} style={{width: '60px', padding: '8px', borderRadius: '6px', background: 'var(--surface)', border: '1px solid var(--surface-border)', color: 'white'}} />
                         <button onClick={() => confirmBooking(ride._id)} className="btn-primary" style={{ padding: '8px 16px', background: '#2ecc71', borderColor: '#2ecc71', color: 'white' }}>Confirm</button>
                         <button onClick={() => setBookingRideId(null)} className="btn-secondary" style={{ padding: '8px 16px', background: 'transparent', color: 'white', border: '1px solid var(--surface-border)' }}>Cancel</button>
                      </div>
                    ) : (
                      ride.availableSeats > 0 ? (
                        <button onClick={() => startBooking(ride._id)} className="btn-primary" style={{ padding: '8px 16px' }}>Book Seat</button>
                      ) : (
                        <button disabled className="btn-secondary" style={{ padding: '8px 16px', opacity: 0.5, cursor: 'not-allowed' }}>Sold Out</button>
                      )
                    )}
                  </div>
                </div>
                
                {/* Google Map */}
                <MapComponent departure={ride.departure} destination={ride.destination} />
              </div>
              
              {/* Driver Reviews Expansion Pane */}
              {isViewingReviews && (
                <div className="glass" style={{ padding: '24px', borderRadius: '0 0 16px 16px', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h4 style={{ margin: 0, color: 'var(--primary)' }}>Driver Reviews for {ride.driverId.name}</h4>
                    <span onClick={() => setViewingDriverId(null)} style={{ cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '1.2rem' }}>✕</span>
                  </div>
                  
                  {driverReviews.length === 0 ? (
                     <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', margin: 0 }}>No reviews yet.</p>
                  ) : (
                    <div style={{ display: 'grid', gap: '12px' }}>
                      {driverReviews.map(rev => (
                        <div key={rev._id} style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <span style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontSize: '0.95rem' }}>{rev.reviewerId?.name || 'Passenger'}</span>
                            {renderStars(rev.rating)}
                          </div>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0, lineHeight: '1.5' }}>"{rev.comment}"</p>
                          <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', display: 'block', marginTop: '10px' }}>{new Date(rev.createdAt).toLocaleDateString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
            </div>
          );
        })}
        </div>
      )}
      
      <div style={{ marginTop: '40px', textAlign: 'center' }}>
        <Link to="/post-ride" style={{ 
          display: 'inline-block',
          padding: '12px 24px', 
          borderRadius: '8px', 
          border: '1px solid var(--primary)', 
          background: 'rgba(90, 75, 218, 0.1)', 
          color: 'var(--text-primary)', 
          textDecoration: 'none',
          fontWeight: '600',
          transition: 'all 0.3s'
        }}
        onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(90, 75, 218, 0.2)'; }}
        onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(90, 75, 218, 0.1)'; }}>
           Are you a driver? Offer a Ride
        </Link>
      </div>
    </div>
  );
};

export default RidesList;
