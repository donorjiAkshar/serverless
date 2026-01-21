import React, { useState, useEffect } from 'react';
import { notifyAPI } from '../api/notify.api';

const Notify = () => {
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [subscriptionStatus, setSubscriptionStatus] = useState('');
  const [subscribers, setSubscribers] = useState([]);

  const handleSendNotification = async () => {
    if (!message.trim()) {
      setError('Please enter a message');
      return;
    }

    setSending(true);
    setError('');
    setSuccess('');

    try {
      const response = await notifyAPI.sendNotification(message);
      setSuccess('Notification sent successfully!');
      setMessage('');
      
      // Update subscribers list from the response
      if (response?.data?.subscribers?.email) {
        setSubscribers(response.data.subscribers.email);
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to send notification. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setSubscribing(true);
    setError('');
    setSuccess('');

    try {
      await notifyAPI.subscribeEmail(email);
      setSubscriptionStatus(`Subscription request sent to ${email}. Please check your email to confirm.`);
      setEmail('');
      // Refresh subscribers list after a short delay
      setTimeout(() => {
        fetchSubscribers();
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to subscribe. Please try again.');
    } finally {
      setSubscribing(false);
    }
  };

  const fetchSubscribers = async () => {
    try {
      const response = await notifyAPI.getSubscribers();
      if (response?.data?.subscribers) {
        setSubscribers(response.data.subscribers.email || []);
      }
    } catch (error) {
      console.error('Error fetching subscribers:', error);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  return (
    <div className="section">
      <div className="notification-section">
        <h3>Email Subscriptions</h3>
        <form onSubmit={handleSubscribe} className="subscribe-form">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email to subscribe"
            disabled={subscribing}
            required
          />
          <button 
            type="submit" 
            className="btn"
            disabled={subscribing || !email.trim()}
          >
            {subscribing ? 'Subscribing...' : 'Subscribe'}
          </button>
        </form>
        {subscriptionStatus && <div className="info">{subscriptionStatus}</div>}
        
        {subscribers.length > 0 && (
          <div className="subscribers-list">
            <h4>Current Subscribers ({subscribers.length}):</h4>
            <ul>
              {subscribers.map((sub, index) => (
                <li key={index}>{sub}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="notification-section">
        <h3>Send Notification</h3>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter your notification message..."
          disabled={sending}
        />
        <button
          className="btn"
          onClick={handleSendNotification}
          disabled={sending || !message.trim()}
        >
          {sending ? 'Sending...' : 'Send Notification'}
        </button>
      </div>
      
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      
      <style jsx>{`
        .notification-section {
          margin-bottom: 2rem;
          padding: 1.5rem;
          background: #f8f9fa;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .subscribe-form {
          display: flex;
          gap: 10px;
          margin: 1rem 0;
        }
        input[type="email"] {
          flex: 1;
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }
        .subscribers-list {
          margin-top: 1rem;
          padding: 1rem;
          background: white;
          border-radius: 4px;
          border: 1px solid #eee;
        }
        .subscribers-list ul {
          list-style: none;
          padding: 0;
          margin: 0.5rem 0 0 0;
        }
        .subscribers-list li {
          padding: 4px 0;
          border-bottom: 1px solid #f0f0f0;
        }
        .info {
          color: #0c5460;
          background-color: #d1ecf1;
          border-color: #bee5eb;
          padding: 0.75rem 1.25rem;
          border: 1px solid transparent;
          border-radius: 0.25rem;
          margin: 0.5rem 0;
        }
      `}</style>
    </div>
  );
};

export default Notify;
