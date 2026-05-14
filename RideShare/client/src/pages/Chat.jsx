import { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import api from '../api/axios';
import { io } from 'socket.io-client';

let socket;

const Chat = () => {
  const { userId } = useParams();
  const location = useLocation();
  const userName = location.state?.name || 'Driver/Passenger';

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [myId, setMyId] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setMyId(user.id);
      
      // Initialize Socket
      socket = io('http://localhost:5000');
      socket.emit('join', user.id);

      socket.on('receive_message', (msg) => {
        setMessages((prev) => [...prev, msg]);
      });
    }

    return () => {
      if (socket) socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await api.get(`/messages/${userId}`);
        setMessages(res.data.data);
        await api.put(`/messages/read/${userId}`);
      } catch (err) {
        console.error('Failed to load chat history');
      }
    };
    fetchMessages();
  }, [userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !myId) return;

    const msgData = {
      senderId: myId,
      receiverId: userId,
      message: newMessage
    };

    socket.emit('send_message', msgData);
    setNewMessage('');
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', background: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--surface-border)', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '600px' }}>
      <div style={{ padding: '20px', borderBottom: '1px solid var(--surface-border)', background: 'rgba(255,255,255,0.02)' }}>
        <h2 style={{ fontSize: '1.2rem', margin: 0, color: 'var(--text-primary)' }}>Chat with {userName}</h2>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {messages.map((m, idx) => {
          const isMe = m.senderId === myId;
          return (
            <div key={idx} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '75%' }}>
              <div style={{ 
                padding: '12px 16px', 
                borderRadius: '16px', 
                background: isMe ? 'var(--primary)' : 'var(--surface-border)',
                color: 'white',
                borderBottomRightRadius: isMe ? '4px' : '16px',
                borderBottomLeftRadius: !isMe ? '4px' : '16px',
                fontSize: '0.95rem'
              }}>
                {m.message}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} style={{ padding: '20px', borderTop: '1px solid var(--surface-border)', display: 'flex', gap: '10px' }}>
        <input 
          type="text" 
          value={newMessage} 
          onChange={(e) => setNewMessage(e.target.value)} 
          placeholder="Type your message..." 
          style={{ flex: 1, padding: '12px', borderRadius: '24px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--surface-border)', color: 'white', outline: 'none' }}
        />
        <button type="submit" className="btn-primary" style={{ borderRadius: '24px', padding: '0 24px' }}>Send</button>
      </form>
    </div>
  );
};

export default Chat;
