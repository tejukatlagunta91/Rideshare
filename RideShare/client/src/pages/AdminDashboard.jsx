import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('Users');
  const [users, setUsers] = useState([]);
  const [rides, setRides] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const sections = [
    { name: 'Users', icon: '👥' },
    { name: 'Rides', icon: '🚗' },
    { name: 'Bookings', icon: '🎫' },
    { name: 'Reviews', icon: '⭐' },
    { name: 'Complaints', icon: '⚠️' },
    { name: 'Reports', icon: '📊' }
  ];

  useEffect(() => {
    if (activeSection === 'Users') {
      fetchUsers();
    } else if (activeSection === 'Rides') {
      fetchRides();
    } else if (activeSection === 'Bookings') {
      fetchBookings();
    } else if (activeSection === 'Reviews') {
      fetchReviews();
    } else if (activeSection === 'Complaints') {
      fetchComplaints();
    } else if (activeSection === 'Reports') {
      fetchReports();
    }
  }, [activeSection]);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await api.delete(`/admin/users/${id}`);
      setSuccessMsg('User deleted successfully');
      setTimeout(() => setSuccessMsg(''), 3000);
      setUsers(users.filter(u => u._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user');
      setTimeout(() => setError(''), 3000);
    }
  };

  const fetchRides = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/admin/rides');
      setRides(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch rides');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRide = async (id) => {
    if (!window.confirm('Are you sure you want to delete this ride?')) return;
    
    try {
      await api.delete(`/admin/rides/${id}`);
      setSuccessMsg('Ride deleted successfully');
      setTimeout(() => setSuccessMsg(''), 3000);
      setRides(rides.filter(r => r._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete ride');
      setTimeout(() => setError(''), 3000);
    }
  };

  const fetchBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/admin/bookings');
      setBookings(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/admin/reviews');
      setReviews(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    
    try {
      await api.delete(`/admin/reviews/${id}`);
      setSuccessMsg('Review deleted successfully');
      setTimeout(() => setSuccessMsg(''), 3000);
      setReviews(reviews.filter(r => r._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete review');
      setTimeout(() => setError(''), 3000);
    }
  };

  const fetchComplaints = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/admin/complaints');
      setComplaints(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch complaints');
    } finally {
      setLoading(false);
    }
  };

  const handleResolveComplaint = async (id) => {
    try {
      await api.put(`/admin/complaints/${id}`);
      setSuccessMsg('Complaint resolved successfully');
      setTimeout(() => setSuccessMsg(''), 3000);
      setComplaints(complaints.map(c => c._id === id ? { ...c, status: 'resolved' } : c));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resolve complaint');
      setTimeout(() => setError(''), 3000);
    }
  };

  const fetchReports = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/admin/reports');
      setReports(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 40px)', gap: '20px', padding: '0 20px', margin: '20px auto', maxWidth: '1400px' }}>
      
      {/* Admin Inner Sidebar */}
      <div className="glass" style={{ width: '250px', borderRadius: '16px', border: '1px solid var(--surface-border)', padding: '24px 0', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ padding: '0 24px', marginBottom: '20px', color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Admin Panel
        </h3>
        
        <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '0 12px' }}>
          {sections.map((section) => (
            <li key={section.name}>
              <button
                onClick={() => setActiveSection(section.name)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  background: activeSection === section.name ? 'rgba(90, 75, 218, 0.15)' : 'transparent',
                  color: activeSection === section.name ? 'var(--primary)' : 'var(--text-primary)',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: activeSection === section.name ? '600' : '400',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                  borderLeft: activeSection === section.name ? '3px solid var(--primary)' : '3px solid transparent'
                }}
              >
                <span>{section.icon}</span>
                {section.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Admin Main Content Area */}
      <div className="glass" style={{ flex: 1, borderRadius: '16px', border: '1px solid var(--surface-border)', padding: '30px' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '24px', color: 'var(--text-primary)', borderBottom: '1px solid var(--surface-border)', paddingBottom: '15px' }}>
          Manage {activeSection}
        </h2>
        
        {error && <div style={{ color: 'white', background: '#e74c3c', padding: '10px', borderRadius: '8px', marginBottom: '15px' }}>{error}</div>}
        {successMsg && <div style={{ color: 'white', background: '#2ecc71', padding: '10px', borderRadius: '8px', marginBottom: '15px' }}>{successMsg}</div>}

        {activeSection === 'Users' ? (
          loading ? (
            <p style={{ color: 'var(--text-secondary)' }}>Loading users...</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--surface-border)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '12px' }}>Name</th>
                    <th style={{ padding: '12px' }}>Email</th>
                    <th style={{ padding: '12px' }}>Role</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '12px', color: 'var(--text-primary)' }}>{user.name}</td>
                      <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{user.email}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ 
                          padding: '4px 8px', 
                          borderRadius: '12px', 
                          fontSize: '0.8rem',
                          background: user.role === 'admin' ? 'rgba(231, 76, 60, 0.15)' : 'rgba(52, 152, 219, 0.15)',
                          color: user.role === 'admin' ? '#e74c3c' : '#3498db'
                        }}>
                          {user.role.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        {user.role !== 'admin' && (
                          <button 
                            onClick={() => handleDeleteUser(user._id)}
                            style={{ 
                              background: 'rgba(231, 76, 60, 0.1)', 
                              color: '#e74c3c', 
                              border: '1px solid rgba(231, 76, 60, 0.3)',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => e.target.style.background = 'rgba(231, 76, 60, 0.2)'}
                            onMouseOut={(e) => e.target.style.background = 'rgba(231, 76, 60, 0.1)'}
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>No users found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )
        ) : activeSection === 'Rides' ? (
          loading ? (
            <p style={{ color: 'var(--text-secondary)' }}>Loading rides...</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--surface-border)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '12px' }}>Route</th>
                    <th style={{ padding: '12px' }}>Driver</th>
                    <th style={{ padding: '12px' }}>Date/Time</th>
                    <th style={{ padding: '12px' }}>Status</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rides.map(ride => (
                    <tr key={ride._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '12px', color: 'var(--text-primary)' }}>
                        <div style={{ fontWeight: '600' }}>{ride.departure}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>to {ride.destination}</div>
                      </td>
                      <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{ride.driverId?.name || 'Unknown'}</td>
                      <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>
                        <div>{ride.date}</div>
                        <div style={{ fontSize: '0.85rem' }}>{ride.time}</div>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ 
                          padding: '4px 8px', 
                          borderRadius: '12px', 
                          fontSize: '0.8rem',
                          background: ride.status === 'upcoming' ? 'rgba(46, 204, 113, 0.15)' : ride.status === 'started' ? 'rgba(243, 156, 18, 0.15)' : ride.status === 'completed' ? 'rgba(52, 152, 219, 0.15)' : 'rgba(231, 76, 60, 0.15)',
                          color: ride.status === 'upcoming' ? '#2ecc71' : ride.status === 'started' ? '#f39c12' : ride.status === 'completed' ? '#3498db' : '#e74c3c'
                        }}>
                          {ride.status.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <button 
                          onClick={() => handleDeleteRide(ride._id)}
                          style={{ 
                            background: 'rgba(231, 76, 60, 0.1)', 
                            color: '#e74c3c', 
                            border: '1px solid rgba(231, 76, 60, 0.3)',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseOver={(e) => e.target.style.background = 'rgba(231, 76, 60, 0.2)'}
                          onMouseOut={(e) => e.target.style.background = 'rgba(231, 76, 60, 0.1)'}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {rides.length === 0 && (
                    <tr>
                      <td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>No rides found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )
        ) : activeSection === 'Bookings' ? (
          loading ? (
            <p style={{ color: 'var(--text-secondary)' }}>Loading bookings...</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--surface-border)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '12px' }}>Ride Info</th>
                    <th style={{ padding: '12px' }}>Driver</th>
                    <th style={{ padding: '12px' }}>Passenger</th>
                    <th style={{ padding: '12px' }}>Seats</th>
                    <th style={{ padding: '12px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(booking => (
                    <tr key={booking._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '12px', color: 'var(--text-primary)' }}>
                        {booking.rideId ? (
                          <>
                            <div style={{ fontWeight: '600' }}>{booking.rideId.departure} ➔ {booking.rideId.destination}</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{booking.rideId.date} at {booking.rideId.time}</div>
                          </>
                        ) : (
                          <div style={{ color: 'var(--text-secondary)' }}>Ride Deleted</div>
                        )}
                      </td>
                      <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>
                        {booking.rideId?.driverId?.name || 'Unknown'}
                      </td>
                      <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>
                        <div style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{booking.passengerId?.name}</div>
                        <div style={{ fontSize: '0.85rem' }}>{booking.passengerId?.email}</div>
                      </td>
                      <td style={{ padding: '12px' }}>
                        {booking.seatsBooked}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ 
                          padding: '4px 8px', 
                          borderRadius: '12px', 
                          fontSize: '0.8rem',
                          background: booking.status === 'approved' ? 'rgba(46, 204, 113, 0.15)' : booking.status === 'rejected' || booking.status === 'cancelled' ? 'rgba(231, 76, 60, 0.15)' : 'rgba(241, 196, 15, 0.15)',
                          color: booking.status === 'approved' ? '#2ecc71' : booking.status === 'rejected' || booking.status === 'cancelled' ? '#e74c3c' : '#f1c40f'
                        }}>
                          {booking.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {bookings.length === 0 && (
                    <tr>
                      <td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>No bookings found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )
        ) : activeSection === 'Reviews' ? (
          loading ? (
            <p style={{ color: 'var(--text-secondary)' }}>Loading reviews...</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--surface-border)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '12px' }}>Rating</th>
                    <th style={{ padding: '12px' }}>Comment</th>
                    <th style={{ padding: '12px' }}>Reviewer</th>
                    <th style={{ padding: '12px' }}>Driver</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map(review => (
                    <tr key={review._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '12px', color: '#f1c40f', fontSize: '1.2rem' }}>
                        {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                      </td>
                      <td style={{ padding: '12px', color: 'var(--text-primary)', maxWidth: '300px', wordWrap: 'break-word' }}>
                        {review.comment || <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>No comment</span>}
                      </td>
                      <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{review.reviewerId?.name || 'Unknown'}</td>
                      <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{review.reviewedUserId?.name || 'Unknown'}</td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <button 
                          onClick={() => handleDeleteReview(review._id)}
                          style={{ 
                            background: 'rgba(231, 76, 60, 0.1)', 
                            color: '#e74c3c', 
                            border: '1px solid rgba(231, 76, 60, 0.3)',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseOver={(e) => e.target.style.background = 'rgba(231, 76, 60, 0.2)'}
                          onMouseOut={(e) => e.target.style.background = 'rgba(231, 76, 60, 0.1)'}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {reviews.length === 0 && (
                    <tr>
                      <td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>No reviews found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )
        ) : activeSection === 'Complaints' ? (
          loading ? (
            <p style={{ color: 'var(--text-secondary)' }}>Loading complaints...</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--surface-border)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '12px' }}>Date</th>
                    <th style={{ padding: '12px' }}>User</th>
                    <th style={{ padding: '12px' }}>Message</th>
                    <th style={{ padding: '12px' }}>Status</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.map(complaint => (
                    <tr key={complaint._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{new Date(complaint.createdAt).toLocaleDateString()}</td>
                      <td style={{ padding: '12px', color: 'var(--text-primary)' }}>{complaint.userId?.name || 'Unknown'}<br/><span style={{fontSize: '0.85rem', color: 'var(--text-secondary)'}}>{complaint.userId?.email}</span></td>
                      <td style={{ padding: '12px', color: 'var(--text-primary)', maxWidth: '300px', wordWrap: 'break-word' }}>{complaint.message}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ 
                          padding: '4px 8px', 
                          borderRadius: '12px', 
                          fontSize: '0.8rem',
                          background: complaint.status === 'open' ? 'rgba(231, 76, 60, 0.15)' : 'rgba(46, 204, 113, 0.15)',
                          color: complaint.status === 'open' ? '#e74c3c' : '#2ecc71'
                        }}>
                          {complaint.status.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        {complaint.status === 'open' ? (
                          <button 
                            onClick={() => handleResolveComplaint(complaint._id)}
                            style={{ 
                              background: 'rgba(46, 204, 113, 0.1)', 
                              color: '#2ecc71', 
                              border: '1px solid rgba(46, 204, 113, 0.3)',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => e.target.style.background = 'rgba(46, 204, 113, 0.2)'}
                            onMouseOut={(e) => e.target.style.background = 'rgba(46, 204, 113, 0.1)'}
                          >
                            Mark Resolved
                          </button>
                        ) : (
                          <span style={{ color: 'var(--text-secondary)' }}>Done</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {complaints.length === 0 && (
                    <tr>
                      <td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>No complaints found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )
        ) : activeSection === 'Reports' ? (
          loading || !reports ? (
            <p style={{ color: 'var(--text-secondary)' }}>Loading reports...</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
              <div style={{ background: 'rgba(52, 152, 219, 0.1)', border: '1px solid rgba(52, 152, 219, 0.3)', padding: '24px', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '3rem', marginBottom: '10px' }}>👥</span>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>Total Users</h3>
                <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#3498db' }}>{reports.totalUsers}</span>
              </div>
              
              <div style={{ background: 'rgba(155, 89, 182, 0.1)', border: '1px solid rgba(155, 89, 182, 0.3)', padding: '24px', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '3rem', marginBottom: '10px' }}>🚗</span>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>Total Rides</h3>
                <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#9b59b6' }}>{reports.totalRides}</span>
              </div>
              
              <div style={{ background: 'rgba(46, 204, 113, 0.1)', border: '1px solid rgba(46, 204, 113, 0.3)', padding: '24px', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '3rem', marginBottom: '10px' }}>🎫</span>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>Total Bookings</h3>
                <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#2ecc71' }}>{reports.totalBookings}</span>
              </div>
              
              <div style={{ background: 'rgba(241, 196, 15, 0.1)', border: '1px solid rgba(241, 196, 15, 0.3)', padding: '24px', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '3rem', marginBottom: '10px' }}>💰</span>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>Total Revenue</h3>
                <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#f1c40f' }}>${reports.totalRevenue.toFixed(2)}</span>
              </div>
            </div>
          )
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
              <span style={{ fontSize: '3rem', display: 'block', marginBottom: '15px' }}>
                {sections.find(s => s.name === activeSection)?.icon}
              </span>
              <p style={{ fontSize: '1.2rem' }}>{activeSection} management module loading...</p>
              <p style={{ marginTop: '10px', fontSize: '0.9rem' }}>Data table and actions will appear here.</p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default AdminDashboard;
