import { useState, useEffect } from 'react';
import { eventsAPI } from '../api/api';

export default function LiveEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joinedEvents, setJoinedEvents] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    loadEvents();
    
    // Update time every minute for live countdown
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const loadEvents = async () => {
    try {
      const data = await eventsAPI.getAll();
      setEvents(data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading events:', error);
      setLoading(false);
    }
  };

  const getEventStatus = (event) => {
    const now = currentTime;
    const start = event.startTime ? new Date(event.startTime) : null;
    const end = event.endTime ? new Date(event.endTime) : null;

    if (!start) {
      return { status: 'upcoming', label: '📅 Upcoming', color: '#3498db' };
    }

    if (start <= now && (!end || now <= end)) {
      const diff = Math.floor((now - start) / 60000);
      return { status: 'live', label: '🔴 LIVE NOW', color: '#e74c3c' };
    } else if (start > now) {
      const diff = Math.floor((start - now) / 60000);
      if (diff < 60) {
        return { status: 'soon', label: `⏰ Starting in ${diff}m`, color: '#f39c12' };
      }
      return { status: 'soon', label: `⏰ Starting soon`, color: '#f39c12' };
    } else {
      return { status: 'ended', label: '✓ Ended', color: '#95a5a6' };
    }
  };

  const getTimeRemaining = (event) => {
    const now = currentTime;
    const end = event.endTime ? new Date(event.endTime) : null;
    
    if (!end) return 'No end time set';
    if (end < now) return 'Event has ended';
    
    const diff = Math.floor((end - now) / 60000);
    if (diff < 60) {
      return `${diff} minutes left`;
    } else {
      const hours = Math.floor(diff / 60);
      const mins = diff % 60;
      return `${hours}h ${mins}m left`;
    }
  };

  const handleJoinEvent = async (eventId) => {
    if (joinedEvents.includes(eventId)) {
      alert('✅ You already joined this event!');
      return;
    }

    try {
      await eventsAPI.join(eventId);
      setJoinedEvents([...joinedEvents, eventId]);
      loadEvents(); // Reload to update attendee count
      alert('✅ You joined the event! See you there!');
    } catch (error) {
      alert('❌ Error: ' + error.message);
    }
  };

  const handleRemindMe = (eventId) => {
    if (reminders.includes(eventId)) {
      alert('🔔 You already set a reminder for this event!');
      return;
    }

    setReminders([...reminders, eventId]);
    const event = events.find(e => e._id === eventId);
    alert(`🔔 Reminder set!\n\nYou'll be notified before "${event.title}" starts.`);
  };

  const addToCalendar = (event) => {
    const startDate = event.startTime ? new Date(event.startTime).toISOString().split('T')[0] : 'TBD';
    const startTime = event.startTime ? new Date(event.startTime).toTimeString().split(' ')[0] : 'TBD';
    const endTime = event.endTime ? new Date(event.endTime).toTimeString().split(' ')[0] : 'TBD';
    
    alert(`✅ Added to calendar!\n\nEvent: ${event.title}\nDate: ${startDate}\nTime: ${startTime} - ${endTime}\nLocation: Room ${event.room}, Block ${event.block}`);
  };

  const liveEvents = events.filter(e => getEventStatus(e).status === 'live');
  const upcomingEvents = events.filter(e => getEventStatus(e).status === 'soon');

  if (loading) {
    return (
      <div className="page">
        <h1>🔴 Live & Upcoming Events</h1>
        <p>Loading events...</p>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>🔴 Live & Upcoming Events</h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>Current time: {currentTime.toLocaleTimeString()}</p>

      {/* LIVE NOW SECTION */}
      {liveEvents.length > 0 && (
        <div style={{ marginBottom: '3rem' }}>
          <h2 style={{ color: '#e74c3c', marginBottom: '1rem' }}>🔴 Events Happening Now! ({liveEvents.length})</h2>
          <div className="grid">
            {liveEvents.map((event) => {
              const eventStatus = getEventStatus(event);
              const hasJoined = joinedEvents.includes(event._id);
              
              return (
                <div key={event._id} className="card" style={{ borderLeft: `4px solid ${eventStatus.color}` }}>
                  <div style={{ 
                    display: 'inline-block', 
                    backgroundColor: eventStatus.color, 
                    color: 'white', 
                    padding: '0.5rem 1rem', 
                    borderRadius: '20px',
                    marginBottom: '1rem',
                    fontSize: '0.9rem',
                    fontWeight: 'bold',
                    animation: 'pulse 2s infinite',
                  }}>
                    {eventStatus.label}
                  </div>

                  <h3>{event.title}</h3>
                  <p><strong>📍 Location:</strong> Room {event.room}, Block {event.block}</p>
                  <p><strong>🏷️ Category:</strong> {event.category}</p>
                  <p><strong>📝 Description:</strong> {event.description}</p>
                  
                  {/* Timeline */}
                  {event.startTime && event.endTime && (
                    <div style={{
                      padding: '1rem',
                      backgroundColor: '#f9f9f9',
                      borderRadius: '8px',
                      marginBottom: '1rem',
                    }}>
                      <p style={{ margin: '0.5rem 0', fontSize: '0.9rem', color: '#666' }}>
                        <strong>⏱️ Started:</strong> {new Date(event.startTime).toLocaleTimeString()}
                      </p>
                      <p style={{ margin: '0.5rem 0', fontSize: '0.9rem', color: '#666' }}>
                        <strong>⏰ Ends:</strong> {new Date(event.endTime).toLocaleTimeString()}
                      </p>
                      <p style={{ 
                        margin: '0.5rem 0', 
                        fontSize: '1rem', 
                        fontWeight: 'bold',
                        color: '#e74c3c',
                      }}>
                        ⏳ {getTimeRemaining(event)}
                      </p>
                    </div>
                  )}

                  <p style={{ 
                    backgroundColor: '#3498db', 
                    color: 'white', 
                    padding: '0.5rem', 
                    borderRadius: '4px', 
                    textAlign: 'center', 
                    marginBottom: '1rem' 
                  }}>
                    👥 {event.attendees} attending
                  </p>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      className="btn btn-primary" 
                      style={{ 
                        flex: 1,
                        backgroundColor: hasJoined ? '#95a5a6' : '#27ae60'
                      }}
                      onClick={() => handleJoinEvent(event._id)}
                      disabled={hasJoined}
                    >
                      {hasJoined ? '✓ Joined' : '✓ Join Now'}
                    </button>
                    <button 
                      className="btn btn-primary" 
                      style={{ flex: 1, backgroundColor: '#9b59b6' }}
                      onClick={() => addToCalendar(event)}
                    >
                      📅 Calendar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STARTING SOON SECTION */}
      {upcomingEvents.length > 0 && (
        <div style={{ marginBottom: '3rem' }}>
          <h2 style={{ color: '#f39c12', marginBottom: '1rem' }}>⏰ Starting Soon ({upcomingEvents.length})</h2>
          <div className="grid">
            {upcomingEvents.map((event) => {
              const eventStatus = getEventStatus(event);
              const hasReminder = reminders.includes(event._id);
              
              return (
                <div key={event._id} className="card" style={{ borderLeft: `4px solid ${eventStatus.color}` }}>
                  <div style={{ 
                    display: 'inline-block', 
                    backgroundColor: eventStatus.color, 
                    color: 'white', 
                    padding: '0.5rem 1rem', 
                    borderRadius: '20px',
                    marginBottom: '1rem',
                    fontSize: '0.9rem',
                    fontWeight: 'bold',
                  }}>
                    {eventStatus.label}
                  </div>

                  <h3>{event.title}</h3>
                  <p><strong>📍 Location:</strong> Room {event.room}, Block {event.block}</p>
                  <p><strong>🏷️ Category:</strong> {event.category}</p>
                  <p><strong>📝 Description:</strong> {event.description}</p>
                  
                  {/* Timeline */}
                  {event.startTime && (
                    <div style={{
                      padding: '1rem',
                      backgroundColor: '#f9f9f9',
                      borderRadius: '8px',
                      marginBottom: '1rem',
                    }}>
                      <p style={{ margin: '0.5rem 0', fontSize: '0.9rem' , color: '#666'}}>
                        <strong>🕐 Starts:</strong> {new Date(event.startTime).toLocaleTimeString()}
                      </p>
                      {event.endTime && (
                        <p style={{ margin: '0.5rem 0', fontSize: '0.9rem', color: '#666' }}>
                          <strong>🕑 Ends:</strong> {new Date(event.endTime).toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                  )}

                  <p style={{ 
                    backgroundColor: '#3498db', 
                    color: 'white', 
                    padding: '0.5rem', 
                    borderRadius: '4px', 
                    textAlign: 'center', 
                    marginBottom: '1rem' 
                  }}>
                    👥 {event.attendees} planning to attend
                  </p>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      className="btn btn-primary" 
                      style={{ 
                        flex: 1,
                        backgroundColor: hasReminder ? '#95a5a6' : '#f39c12'
                      }}
                      onClick={() => handleRemindMe(event._id)}
                      disabled={hasReminder}
                    >
                      {hasReminder ? '🔔 Reminder Set' : '🔔 Remind Me'}
                    </button>
                    <button 
                      className="btn btn-primary" 
                      style={{ flex: 1, backgroundColor: '#27ae60' }}
                      onClick={() => addToCalendar(event)}
                    >
                      📅 Calendar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* NO EVENTS */}
      {liveEvents.length === 0 && upcomingEvents.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#f0f0f0', borderRadius: '8px' }}>
          <p style={{ fontSize: '1.2rem', color: '#666' }}>😴 No events live or starting soon</p>
          <p style={{ color: '#999' }}>All events need start/end times to show here. Create events with timestamps!</p>
        </div>
      )}
    </div>
  );
}
