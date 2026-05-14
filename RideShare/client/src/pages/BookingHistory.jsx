import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

const BookingHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [unreadCounts, setUnreadCounts] = useState({});
  const navigate = useNavigate();

  // Review states
  const [reviewingRideId, setReviewingRideId] = useState(null);
  const [reviewedDriverId, setReviewedDriverId] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewMsg, setReviewMsg] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const [authoredReviews, setAuthoredReviews] = useState([]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await api.get('/bookings');
        setBookings(res.data.data);
      } catch (err) {
        setError('Failed to fetch bookings');
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
    
    const fetchAuthoredReviews = async () => {
      try {
        const res = await api.get('/reviews/authored');
        setAuthoredReviews(res.data.data.map(r => r.rideId));
      } catch (err) {
        console.error('Failed to fetch authored reviews');
      }
    };
    fetchAuthoredReviews();
    
    const fetchUnreadCounts = async () => {
      try {
        const res = await api.get('/messages/unread');
        setUnreadCounts(res.data.data);
      } catch (err) {
        console.error('Failed to fetch unread counts');
      }
    };
    fetchUnreadCounts();

    const userStr = localStorage.getItem('user');
    let socket;
    if (userStr) {
      const user = JSON.parse(userStr);
      socket = io('http://localhost:5000');
      socket.emit('join', user.id);
      socket.on('receive_message', (msg) => {
        if (msg.receiverId === user.id) {
          setUnreadCounts(prev => ({
            ...prev,
            [msg.senderId]: (prev[msg.senderId] || 0) + 1
          }));
        }
      });
    }

    return () => {
      if (socket) socket.disconnect();
    };
  }, []);

  const submitReview = async () => {
    try {
      await api.post('/reviews', { 
        rideId: reviewingRideId, 
        reviewedUserId: reviewedDriverId, 
        rating, 
        comment 
      });
      setReviewMsg('Review submitted successfully!');
      setAuthoredReviews(prev => [...prev, reviewingRideId]);
      setTimeout(() => { 
        setReviewMsg(''); 
        setReviewingRideId(null); 
        setRating(5);
        setComment('');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review');
      setTimeout(() => setError(''), 3000);
      setReviewingRideId(null);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      await api.put(`/bookings/${bookingId}/cancel`);
      const res = await api.get('/bookings');
      setBookings(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel booking');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>
      <h2 style={{ fontSize: '2.5rem', marginBottom: '30px', color: 'var(--text-primary)' }}>Your Bookings</h2>
      
      {error && <div style={{color: '#fff', background: '#ff4785', padding: '12px', borderRadius: '8px', marginBottom: '20px'}}>{error}</div>}
      
      {loading ? (
        <p style={{ color: 'var(--text-secondary)' }}>Loading history...</p>
      ) : bookings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', background: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--surface-border)' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>You haven't booked any rides yet.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {bookings.map((booking) => (
            <div key={booking._id}>
              <div className="glass" style={{ padding: '24px', borderRadius: reviewingRideId === booking.rideId?._id ? '16px 16px 0 0' : '16px', borderBottom: reviewingRideId === booking.rideId?._id ? 'none' : '1px solid var(--surface-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  {booking.rideId ? (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <h3 style={{ fontSize: '1.4rem', color: 'var(--primary)', margin: 0 }}>
                          {booking.rideId.departure} ➔ {booking.rideId.destination}
                        </h3>
                        <span style={{ 
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 10px', 
                          borderRadius: '20px', 
                          fontSize: '0.75rem', 
                          fontWeight: '700', 
                          letterSpacing: '0.5px',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                          backgroundColor: booking.rideId.status === 'upcoming' ? 'rgba(46, 204, 113, 0.15)' : booking.rideId.status === 'started' ? 'rgba(243, 156, 18, 0.15)' : booking.rideId.status === 'completed' ? 'rgba(52, 152, 219, 0.15)' : 'rgba(231, 76, 60, 0.15)',
                          color: booking.rideId.status === 'upcoming' ? '#2ecc71' : booking.rideId.status === 'started' ? '#f39c12' : booking.rideId.status === 'completed' ? '#3498db' : '#e74c3c',
                          border: `1px solid ${booking.rideId.status === 'upcoming' ? 'rgba(46, 204, 113, 0.3)' : booking.rideId.status === 'started' ? 'rgba(243, 156, 18, 0.3)' : booking.rideId.status === 'completed' ? 'rgba(52, 152, 219, 0.3)' : 'rgba(231, 76, 60, 0.3)'}`
                        }}>
                          {booking.rideId.status === 'upcoming' && '🟢 '}
                          {booking.rideId.status === 'started' && '🚗 '}
                          {booking.rideId.status === 'completed' && '✅ '}
                          {booking.rideId.status === 'cancelled' && '❌ '}
                          RIDE: {booking.rideId.status.toUpperCase()}
                        </span>
                      </div>
                      <p style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>
                        📅 {booking.rideId.date} at {booking.rideId.time}
                      </p>
                      <p style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 'bold' }}>
                        💲 Total: ${booking.rideId.price * booking.seatsBooked} (${booking.rideId.price}/seat)
                      </p>
                    </>
                  ) : (
                    <h3 style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Ride details unavailable</h3>
                  )}
                  <p style={{ color: 'var(--text-secondary)' }}>
                    🪑 Seats booked: {booking.seatsBooked}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ 
                    display: 'inline-block', 
                    padding: '6px 12px', 
                    borderRadius: '20px', 
                    fontSize: '0.85rem', 
                    fontWeight: '600', 
                    backgroundColor: booking.status === 'approved' ? 'rgba(46, 204, 113, 0.2)' : booking.status === 'rejected' || booking.status === 'cancelled' ? 'rgba(231, 76, 60, 0.2)' : 'rgba(241, 196, 15, 0.2)',
                    color: booking.status === 'approved' ? '#2ecc71' : booking.status === 'rejected' || booking.status === 'cancelled' ? '#e74c3c' : '#f1c40f'
                  }}>
                    {booking.status.toUpperCase()}
                  </span>
                  <p style={{ marginTop: '10px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    Booked on: {new Date(booking.createdAt).toLocaleDateString()}
                  </p>
                  {booking.rideId && (
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '12px' }}>
                      <button 
                        onClick={() => navigate(`/chat/${booking.rideId.driverId}`)} 
                        className="btn-secondary" 
                        style={{ padding: '6px 12px', fontSize: '0.85rem', position: 'relative' }}
                      >
                        Chat
                        {unreadCounts[booking.rideId.driverId] > 0 && (
                          <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: 'red', width: '10px', height: '10px', borderRadius: '50%' }}></span>
                        )}
                      </button>
                      {booking.status === 'approved' && (
                        authoredReviews.includes(booking.rideId._id) ? (
                          <span style={{ padding: '6px 12px', fontSize: '0.85rem', color: 'var(--text-secondary)', border: '1px solid var(--surface-border)', borderRadius: '8px', cursor: 'not-allowed', display: 'inline-flex', alignItems: 'center' }}>
                            ✓ Reviewed
                          </span>
                        ) : (
                          <button 
                            onClick={() => { setReviewingRideId(booking.rideId._id); setReviewedDriverId(booking.rideId.driverId); }} 
                            className="btn-primary" 
                            style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                          >
                            ★ Rate Driver
                          </button>
                        )
                      )}
                      
                      {booking.status !== 'cancelled' && booking.status !== 'rejected' && (
                        <button 
                          onClick={() => handleCancelBooking(booking._id)} 
                          className="btn-secondary" 
                          style={{ padding: '6px 12px', fontSize: '0.85rem', border: '1px solid #e74c3c', color: '#e74c3c', background: 'transparent' }}
                        >
                          Cancel Booking
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Review Form Expansion Pane */}
              {reviewingRideId === booking.rideId?._id && (
                <div className="glass" style={{ padding: '24px', borderRadius: '0 0 16px 16px', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <h4 style={{ margin: '0 0 15px 0', color: 'var(--primary)' }}>Leave a Review for this Driver</h4>
                  
                  {reviewMsg && <div style={{ color: '#2ecc71', marginBottom: '15px', fontWeight: 'bold' }}>✓ {reviewMsg}</div>}
                  
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '15px' }}>
                    <label style={{ color: 'var(--text-secondary)', fontWeight: 'bold' }}>Rating:</label>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span 
                          key={star}
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          style={{
                            cursor: 'pointer',
                            fontSize: '1.8rem',
                            color: star <= (hoverRating || rating) ? '#f1c40f' : 'rgba(255,255,255,0.15)',
                            transition: 'color 0.2s',
                            lineHeight: '1'
                          }}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <textarea 
                    value={comment} 
                    onChange={(e) => setComment(e.target.value)} 
                    placeholder="Share your experience (e.g., 'Great driver, on time!')"
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--surface-border)', color: 'white', minHeight: '80px', marginBottom: '15px' }}
                  />
                  
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={submitReview} className="btn-primary" style={{ padding: '8px 20px', background: '#2ecc71', borderColor: '#2ecc71', color: 'white' }}>Submit Review</button>
                    <button onClick={() => setReviewingRideId(null)} className="btn-secondary" style={{ padding: '8px 20px', background: 'transparent', border: '1px solid var(--surface-border)', color: 'white' }}>Cancel</button>
                  </div>
                </div>
              )}

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookingHistory;
