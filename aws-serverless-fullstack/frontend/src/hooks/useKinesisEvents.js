// In /frontend/src/hooks/useKinesisEvents.js
import { useState, useEffect } from 'react';
import { streamAPI } from '../api/stream.api';

export const useKinesisEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await streamAPI.getKinesisEvents();
      setEvents(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return { events, loading, error, refresh: fetchEvents };
};