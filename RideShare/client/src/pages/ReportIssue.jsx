import React, { useState } from 'react';
import api from '../api/axios';

const ReportIssue = () => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      setError('Please provide a message');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await api.post('/complaints', { message });
      setSuccess('Your issue has been reported. We will look into it shortly.');
      setMessage('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '0 20px' }}>
      <h2 style={{ fontSize: '2.5rem', marginBottom: '10px', color: 'var(--text-primary)' }}>Report an Issue</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>Experiencing a problem? Let us know so we can fix it.</p>
      
      <div className="glass" style={{ padding: '30px', borderRadius: '16px', border: '1px solid var(--surface-border)' }}>
        {success && <div style={{ color: 'white', background: '#2ecc71', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>{success}</div>}
        {error && <div style={{ color: 'white', background: '#e74c3c', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px', color: 'var(--text-primary)' }}>Describe the issue</label>
            <textarea 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Please provide details about the problem you encountered..."
              style={{ width: '100%', minHeight: '150px', padding: '15px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--surface-border)', color: 'white', resize: 'vertical' }}
            />
          </div>
          
          <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '12px', background: '#e74c3c', boxShadow: '0 4px 14px 0 rgba(231, 76, 60, 0.39)' }}>
            {loading ? 'Submitting...' : 'Submit Report'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReportIssue;
