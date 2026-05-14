import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const PostRide = () => {
  const [formData, setFormData] = useState({
    departure: '',
    destination: '',
    date: '',
    time: '',
    price: '',
    availableSeats: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { departure, destination, date, time, price, availableSeats } = formData;

  const onChange = (e) => setFormData({ ...formData, [e.target.id]: e.target.value });

  const todayDate = new Date().toISOString().split('T')[0];
  const currentTime = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (date < todayDate) {
      setError('Cannot post ride in the past');
      setLoading(false);
      return;
    }

    if (date === todayDate && time < currentTime) {
      setError('Cannot post ride in the past');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/rides', formData);

      if (response.data.success) {
        navigate('/rides');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post ride');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-container">
      <div className="auth-card" style={{ maxWidth: '600px' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '8px', textAlign: 'center' }}>Offer a Ride</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '30px', textAlign: 'center' }}>
          Share your journey and split the costs.
        </p>

        {error && <div style={{background: '#e74c3c', color: 'white', padding: '10px', borderRadius: '8px', marginBottom: '15px'}}>{error}</div>}
        {success && <div style={{background: '#2ecc71', color: 'white', padding: '10px', borderRadius: '8px', marginBottom: '15px'}}>{success}</div>}

        <form onSubmit={onSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="form-group">
              <label htmlFor="departure">Departure</label>
              <input type="text" id="departure" value={departure} onChange={onChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="destination">Destination</label>
              <input type="text" id="destination" value={destination} onChange={onChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="date">Date</label>
              <input type="date" id="date" value={date} onChange={onChange} min={todayDate} required style={{ colorScheme: 'dark' }} />
            </div>
            <div className="form-group">
              <label htmlFor="time">Time</label>
              <input type="time" id="time" value={time} onChange={onChange} required style={{ colorScheme: 'dark' }} />
            </div>
            <div className="form-group">
              <label htmlFor="price">Price ($)</label>
              <input type="number" id="price" value={price} onChange={onChange} required min="0" />
            </div>
            <div className="form-group">
              <label htmlFor="availableSeats">Available Seats</label>
              <input type="number" id="availableSeats" value={availableSeats} onChange={onChange} required min="1" />
            </div>
          </div>
          
          <button type="submit" className="btn-primary full-width-btn" style={{ marginTop: '20px' }} disabled={loading}>
            {loading ? 'Posting...' : 'Post Ride'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PostRide;
