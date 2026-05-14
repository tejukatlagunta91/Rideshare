import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

const DriverBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [unreadCounts, setUnreadCounts] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDriverBookings = async () => {
      try {
        const res = await api.get('/bookings/driver');
        setBookings(res.data.data);
      } catch (err) {
        setError('Failed to fetch your received bookings');
      } finally {
        setLoading(false);
      }
    };
    fetchDriverBookings();

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

  const handleApprove = async (bookingId) => {
    try {
      await api.put(`/bookings/${bookingId}/approve`);
      const res = await api.get('/bookings/driver');
      setBookings(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve');
    }
  };

  const handleReject = async (bookingId) => {
    try {
      await api.put(`/bookings/${bookingId}/reject`);
      const res = await api.get('/bookings/driver');
      setBookings(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject');
    }
  };

  const handleCancelRide = async (rideId) => {
    if(!window.confirm("Are you sure you want to cancel this entire ride? All passengers will be cancelled.")) return;
    try {
      await api.put(`/rides/${rideId}/cancel`);
      const res = await api.get('/bookings/driver');
      setBookings(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel ride');
    }
  };

  const handleStartRide = async (rideId) => {
    try {
      await api.put(`/rides/${rideId}/start`);
      const res = await api.get('/bookings/driver');
      setBookings(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start ride');
    }
  };

  const handleEndRide = async (rideId) => {
    try {
      await api.put(`/rides/${rideId}/end`);
      const res = await api.get('/bookings/driver');
      setBookings(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to end ride');
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>
      <h2 style={{ fontSize: '2.5rem', marginBottom: '30px', color: 'var(--text-primary)' }}>My Ride Bookings</h2>
      
      {error && <div style={{color: 'white', background: '#e74c3c', padding: '15px', borderRadius: '8px', marginBottom: '20px'}}>{error}</div>}
      
      {loading ? (
        <p style={{ color: 'var(--text-secondary)' }}>Loading bookings...</p>
      ) : bookings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', background: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--surface-border)' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>No one has booked your rides yet.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {bookings.map((booking) => (
            <div key={booking._id} className="glass" style={{ padding: '24px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
              <div>
                {booking.rideId ? (
                  <>
                    <h3 style={{ fontSize: '1.4rem', color: 'var(--primary)', marginBottom: '8px' }}>
                      {booking.rideId.departure} ➔ {booking.rideId.destination}
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      📅 {booking.rideId.date} at {booking.rideId.time}
                    </p>
                  </>
                ) : (
                  <h3 style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Ride details unavailable</h3>
                )}
                
                <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                  <p style={{ margin: 0, fontWeight: 'bold' }}>👤 Passenger: {booking.passengerId?.name || 'Unknown'}</p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>✉️ {booking.passengerId?.email}</p>
                  <p style={{ margin: '8px 0 0 0', color: 'var(--primary)' }}>🪑 Seats Booked: <strong>{booking.seatsBooked}</strong></p>
                </div>
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
                
                {booking.rideId && (
                  <span style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center',
                    gap: '6px',
                    marginLeft: '8px',
                    padding: '6px 12px', 
                    borderRadius: '20px', 
                    fontSize: '0.8rem', 
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
                )}
                <p style={{ marginTop: '10px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  Booked on: {new Date(booking.createdAt).toLocaleDateString()}
                </p>
                
                {booking.status === 'pending' && (
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '12px' }}>
                    <button onClick={() => handleApprove(booking._id)} className="btn-primary" style={{ padding: '6px 12px', fontSize: '0.85rem', background: 'rgba(46, 204, 113, 0.1)', color: '#2ecc71', borderColor: 'rgba(46, 204, 113, 0.3)' }}>Approve</button>
                    <button onClick={() => handleReject(booking._id)} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.85rem', background: 'rgba(231, 76, 60, 0.1)', color: '#e74c3c', borderColor: 'rgba(231, 76, 60, 0.3)' }}>Reject</button>
                  </div>
                )}
                {booking.passengerId && (
                  <button 
                    onClick={() => navigate(`/chat/${booking.passengerId._id}`, { state: { name: booking.passengerId.name }})} 
                    className="btn-secondary" 
                    style={{ marginTop: '12px', padding: '8px 16px', fontSize: '0.9rem', border: '1px solid var(--primary)', color: 'var(--primary)', display: 'block', width: '100%', marginBottom: '8px', position: 'relative' }}
                  >
                    Chat with Passenger
                    {unreadCounts[booking.passengerId._id] > 0 && (
                      <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: 'red', width: '10px', height: '10px', borderRadius: '50%' }}></span>
                    )}
                  </button>
                )}
                {booking.rideId && booking.rideId.status !== 'cancelled' && booking.status !== 'cancelled' && (
                  <button 
                    onClick={() => handleCancelRide(booking.rideId._id)} 
                    className="btn-secondary" 
                    style={{ padding: '8px 16px', fontSize: '0.9rem', border: '1px solid #e74c3c', color: '#e74c3c', background: 'transparent', display: 'block', width: '100%' }}
                  >
                    Cancel Entire Ride
                  </button>
                )}
                {booking.rideId && booking.rideId.status === 'upcoming' && (
                  <button 
                    onClick={() => handleStartRide(booking.rideId._id)} 
                    className="btn-primary" 
                    style={{ marginTop: '12px', padding: '8px 16px', fontSize: '0.9rem', display: 'block', width: '100%', marginBottom: '8px', backgroundColor: '#3498db', borderColor: '#3498db' }}
                  >
                    Start Ride
                  </button>
                )}
                {booking.rideId && booking.rideId.status === 'started' && (
                  <button 
                    onClick={() => handleEndRide(booking.rideId._id)} 
                    className="btn-primary" 
                    style={{ marginTop: '12px', padding: '8px 16px', fontSize: '0.9rem', display: 'block', width: '100%', marginBottom: '8px', backgroundColor: '#e67e22', borderColor: '#e67e22' }}
                  >
                    End Ride
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DriverBookings;
