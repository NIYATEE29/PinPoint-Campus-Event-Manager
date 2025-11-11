import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../api/api';

export default function SavedEvents({ user }) {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSavedEvents();
  }, []);

  const loadSavedEvents = async () => {
    try {
      const data = await userAPI.getSavedEvents();
      setEvents(data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading saved events:', error);
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="page">
        <h1> Access Denied</h1>
        <p>Please login to view saved events.</p>
        <button className="btn btn-primary" onClick={() => navigate('/login')}>
          Login
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="page">
        <h1> My Saved Events</h1>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="page">
      <h1> My Saved Events</h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        Events you've bookmarked for later
      </p>

      {events.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '3rem', 
          backgroundColor: '#f0f0f0', 
          borderRadius: '8px' 
        }}>
          <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>⭐</p>
          <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '1rem' }}>
            No saved events yet
          </p>
          <p style={{ color: '#999', marginBottom: '2rem' }}>
            Save events from the map to see them here!
          </p>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/map')}
          >
            Browse Events
          </button>
        </div>
      ) : (
        <>
          <p style={{ color: '#666', marginBottom: '1rem' }}>
            You have {events.length} saved event{events.length !== 1 ? 's' : ''}
          </p>
          
          <div className="grid">
            {events.map((event) => (
              <div key={event._id} className="card">
                <div style={{
                  display: 'inline-block',
                  backgroundColor: '#f39c12',
                  color: 'white',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '12px',
                  fontSize: '0.85rem',
                  marginBottom: '1rem',
                }}>
                   Saved
                </div>
                
                <h3>{event.title}</h3>
                <p><strong> Location:</strong> Room {event.room}, Block {event.block}</p>
                <p><strong> Campus:</strong> {event.campus}</p>
                <p><strong> Category:</strong> {event.category}</p>
                <p><strong> Description:</strong> {event.description}</p>
                
                {event.startTime && (
                  <p><strong> Starts:</strong> {new Date(event.startTime).toLocaleString()}</p>
                )}
                
                <div style={{ 
                  backgroundColor: '#ecf0f1', 
                  padding: '0.75rem', 
                  borderRadius: '4px', 
                  marginTop: '1rem',
                  marginBottom: '1rem',
                  textAlign: 'center' 
                }}>
                  <p style={{ margin: 0 }}>👥 {event.attendees} attending</p>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    className="btn btn-primary"
                    onClick={() => navigate('/map')}
                    style={{ flex: 1 }}
                  >
                     View on Map
                  </button>
                  <button
                    className="btn btn-primary"
                    style={{ flex: 1, backgroundColor: '#e74c3c' }}
                    onClick={() => {
                      if (window.confirm('Remove from saved events?')) {
                        // TODO: Implement unsave
                        alert('Unsave feature coming soon!');
                      }
                    }}
                  >
                     Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
