import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI, eventsAPI } from '../api/api';

export default function MyEvents({ user }) {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMyEvents();
  }, []);

  const loadMyEvents = async () => {
    try {
      const data = await userAPI.getMyEvents();
      setEvents(data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading events:', error);
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      await eventsAPI.delete(eventId);
      alert('Event deleted successfully!');
      loadMyEvents(); 
    } catch (error) {
      alert(' Error deleting event: ' + error.message);
    }
  };

  if (!user || user.userType !== 'organizer') {
    return (
      <div className="page">
        <h1> Access Denied</h1>
        <p>Only organizers can view this page.</p>
        <button className="btn btn-primary" onClick={() => navigate('/')}>
          Go Home
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="page">
        <h1> My Events</h1>
        <p>Loading...</p>
      </div>
    );
  }

  const totalAttendees = events.reduce((sum, event) => sum + (event.attendees || 0), 0);

  return (
    <div className="page">
      <h1> My Events</h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        Events you've created and organized
      </p>

      {/* Stats */}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '2rem' }}>
        <div className="card" style={{ backgroundColor: '#3498db', color: 'white', textAlign: 'center' }}>
          <h2 style={{ margin: '0.5rem 0', fontSize: '2.5rem' }}>{events.length}</h2>
          <p style={{ margin: 0 }}>Total Events</p>
        </div>
        <div className="card" style={{ backgroundColor: '#27ae60', color: 'white', textAlign: 'center' }}>
          <h2 style={{ margin: '0.5rem 0', fontSize: '2.5rem' }}>{totalAttendees}</h2>
          <p style={{ margin: 0 }}>Total Attendees</p>
        </div>
        <div className="card" style={{ backgroundColor: '#f39c12', color: 'white', textAlign: 'center' }}>
          <h2 style={{ margin: '0.5rem 0', fontSize: '2.5rem' }}>
            {events.length > 0 ? Math.round(totalAttendees / events.length) : 0}
          </h2>
          <p style={{ margin: 0 }}>Avg per Event</p>
        </div>
      </div>

      {events.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '3rem', 
          backgroundColor: '#f0f0f0', 
          borderRadius: '8px' 
        }}>
          <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</p>
          <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '1rem' }}>
            No events created yet
          </p>
          <p style={{ color: '#999', marginBottom: '2rem' }}>
            Create your first event to get started!
          </p>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/create-event')}
            style={{ backgroundColor: '#27ae60' }}
          >
            ➕ Create Event
          </button>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <p style={{ color: '#666' }}>
              Showing {events.length} event{events.length !== 1 ? 's' : ''}
            </p>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/create-event')}
              style={{ backgroundColor: '#27ae60' }}
            >
              ➕ Create New Event
            </button>
          </div>
          
          <div className="grid">
            {events.map((event) => (
              <div key={event._id} className="card">
                <div style={{
                  display: 'inline-block',
                  backgroundColor: '#3498db',
                  color: 'white',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '12px',
                  fontSize: '0.85rem',
                  marginBottom: '1rem',
                }}>
                   Your Event
                </div>
                
                <h3>{event.title}</h3>
                <p><strong> Location:</strong> Room {event.room}, Block {event.block}</p>
                <p><strong> Campus:</strong> {event.campus}</p>
                <p><strong> Category:</strong> {event.category}</p>
                <p><strong> Description:</strong> {event.description}</p>
                
                {event.startTime && (
                  <div style={{ marginTop: '1rem' }}>
                    <p><strong> Starts:</strong> {new Date(event.startTime).toLocaleString()}</p>
                    {event.endTime && (
                      <p><strong> Ends:</strong> {new Date(event.endTime).toLocaleString()}</p>
                    )}
                  </div>
                )}
                
                <div style={{ 
                  backgroundColor: '#ecf0f1', 
                  padding: '0.75rem', 
                  borderRadius: '4px', 
                  marginTop: '1rem',
                  marginBottom: '1rem',
                  textAlign: 'center' 
                }}>
                  <p style={{ margin: 0 }}>👥 {event.attendees} people joined</p>
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
                    onClick={() => handleDeleteEvent(event._id)}
                  >
                     Delete
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
