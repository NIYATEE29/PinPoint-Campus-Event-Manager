import { useState, useEffect } from 'react';
import { clubsAPI, eventsAPI } from '../api/api';

export default function ClubDirectory() {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClub, setSelectedClub] = useState(null);
  const [clubEvents, setClubEvents] = useState({});

  useEffect(() => {
    loadClubs();
  }, []);

  const loadClubs = async () => {
    try {
      // Load all organizers
      const clubsData = await clubsAPI.getAll();
      setClubs(clubsData);
      
      // Load all events
      const eventsData = await eventsAPI.getAll();
      
      // Group events by organizer ID
      const eventsByOrganizer = {};
      eventsData.forEach(event => {
        // Handle both populated and non-populated organizerId
        const orgId = event.organizerId?._id || event.organizerId;
        
        if (!eventsByOrganizer[orgId]) {
          eventsByOrganizer[orgId] = [];
        }
        eventsByOrganizer[orgId].push(event);
      });
      
      setClubEvents(eventsByOrganizer);
      setLoading(false);
    } catch (error) {
      console.error('Error loading clubs:', error);
      setLoading(false);
    }
  };

  const filteredClubs = clubs.filter(club =>
    (club.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     club.organization?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     club.email?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatDate = (date) => {
    if (!date) return 'TBD';
    const d = new Date(date);
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return d.toLocaleDateString('en-US', options);
  };

  const getDaysUntil = (date) => {
    if (!date) return 'TBD';
    const now = new Date();
    const eventDate = new Date(date);
    const diff = Math.floor((eventDate - now) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    if (diff < 0) return 'Past event';
    return `In ${diff} days`;
  };

  if (loading) {
    return (
      <div className="page">
        <h1>🏛️ Club Directory</h1>
        <p>Loading clubs...</p>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>🏛️ Club Directory</h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        Discover all official clubs and their upcoming events
      </p>

      {/* Search */}
      <div style={{ marginBottom: '2rem' }}>
        <input
          type="text"
          placeholder="🔍 Search clubs by name, organization, or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            maxWidth: '600px',
            padding: '0.75rem 1rem',
            border: '2px solid #ddd',
            borderRadius: '8px',
            fontSize: '1rem',
          }}
        />
        <p style={{ marginTop: '0.5rem', color: '#666' }}>
          Found {filteredClubs.length} of {clubs.length} clubs
        </p>
      </div>

      {/* Clubs Grid */}
      {filteredClubs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#f0f0f0', borderRadius: '8px' }}>
          <p style={{ fontSize: '1.2rem', color: '#666' }}>
            {searchQuery ? 'No clubs found matching your search.' : 'No clubs registered yet. Register as an organizer to create one!'}
          </p>
        </div>
      ) : (
        <div className="grid">
          {filteredClubs.map((club) => {
            // Get events for this club using the club's _id
            const clubEventsList = clubEvents[club._id] || [];
            
            // Filter for upcoming events only
            const upcomingEvents = clubEventsList.filter(e => {
              if (!e.startTime) return false;
              return new Date(e.startTime) > new Date();
            });
            
            return (
              <div key={club._id} className="card">
                <div style={{ fontSize: '3rem', textAlign: 'center', marginBottom: '1rem' }}>
                  🏛️
                </div>
                <h3>{club.organization || `${club.firstName}'s Club`}</h3>
                <p><strong>Organizer:</strong> {club.firstName} {club.lastName || ''}</p>
                <p><strong>Email:</strong> {club.email}</p>
                <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.5rem' }}>
                  <strong>Total Events:</strong> {clubEventsList.length}
                </p>

                {/* Upcoming Events */}
                <div style={{ 
                  backgroundColor: '#f9f9f9', 
                  padding: '1rem', 
                  borderRadius: '8px',
                  marginTop: '1rem',
                  marginBottom: '1rem',
                  minHeight: '120px'
                }}>
                  <h4 style={{ marginBottom: '0.75rem', color: '#2c3e50' }}>
                    📅 Upcoming Events ({upcomingEvents.length})
                  </h4>
                  {upcomingEvents.length === 0 ? (
                    <p style={{ color: '#F4B37A', fontSize: '0.9rem', fontStyle: 'italic' }}>
                      No upcoming events scheduled
                    </p>
                  ) : (
                    upcomingEvents.slice(0, 3).map((event) => (
                      <div key={event._id} style={{ 
                        padding: '0.5rem',
                        marginBottom: '0.5rem',
                        backgroundColor: 'white',
                        borderRadius: '4px',
                        borderLeft: '3px solid #3498db'
                      }}>
                        <p style={{ margin: '0.25rem 0', fontWeight: 'bold', fontSize: '0.9rem', color: '#666' }}>
                          {event.title}
                        </p>
                        <p style={{ margin: '0.25rem 0', fontSize: '0.85rem', color: '#666' }}>
                          📍 Room {event.room}, Block {event.block}
                        </p>
                        {event.startTime && (
                          <p style={{ margin: '0.25rem 0', fontSize: '0.85rem', color: '#f39c12', fontWeight: 'bold' }}>
                            ⏰ {getDaysUntil(event.startTime)} • {formatDate(event.startTime)}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                  {upcomingEvents.length > 3 && (
                    <p style={{ fontSize: '0.85rem', color: '#3498db', marginTop: '0.5rem', cursor: 'pointer' }}
                       onClick={() => setSelectedClub({ ...club, events: upcomingEvents })}>
                      + {upcomingEvents.length - 3} more events
                    </p>
                  )}
                </div>

                <button
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: '0.5rem' }}
                  onClick={() => setSelectedClub({ ...club, events: upcomingEvents, allEvents: clubEventsList })}
                >
                  View All Events ({clubEventsList.length})
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal for All Club Events */}
      {selectedClub && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }} onClick={() => setSelectedClub(null)}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            maxWidth: '700px',
            maxHeight: '80vh',
            overflow: 'auto',
            position: 'relative',
          }} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedClub(null)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: '#2e5aadff',
              }}
            >
              ✕
            </button>
            
            <div style={{ fontSize: '3rem', textAlign: 'center', marginBottom: '1rem' }}>
              🏛️
            </div>
            <h2 style={{ textAlign: 'center', marginBottom: '0.5rem', color: '#666' }}>
              {selectedClub.organization || `${selectedClub.firstName}'s Club`}
            </h2>
            <p style={{ textAlign: 'center', color: '#666', marginBottom: '0.5rem' }}>
              Organized by {selectedClub.firstName} {selectedClub.lastName || ''}
            </p>
            <p style={{ textAlign: 'center', color: '#666', marginBottom: '2rem' }}>
              {selectedClub.email}
            </p>
            
            <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
              <div style={{ display: 'inline-block', backgroundColor: '#3498db', color: 'white', padding: '0.5rem 1rem', borderRadius: '20px', marginRight: '0.5rem' }}>
                📅 {selectedClub.allEvents?.length || 0} Total Events
              </div>
              <div style={{ display: 'inline-block', backgroundColor: '#27ae60', color: 'white', padding: '0.5rem 1rem', borderRadius: '20px' }}>
                ⏰ {selectedClub.events?.length || 0} Upcoming
              </div>
            </div>
            
            <h3 style={{ marginBottom: '1rem', color: '#666' }}>
              Upcoming Events ({selectedClub.events?.length || 0})
            </h3>
            
            {selectedClub.events?.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#F4B37A', padding: '2rem' }}>
                No upcoming events scheduled
              </p>
            ) : (
              selectedClub.events?.map((event) => (
                <div key={event._id} className="card" style={{ marginBottom: '1rem' }}>
                  <h4>{event.title}</h4>
                  <p><strong>📍 Location:</strong> Room {event.room}, Block {event.block}</p>
                  <p><strong>🏛️ Campus:</strong> {event.campus}</p>
                  <p><strong>🏷️ Category:</strong> {event.category}</p>
                  <p><strong>📝 Description:</strong> {event.description}</p>
                  {event.startTime && (
                    <>
                      <p><strong>📅 Date:</strong> {formatDate(event.startTime)}</p>
                      {event.startTime && (
                        <p><strong>🕐 Time:</strong> {new Date(event.startTime).toLocaleTimeString()}</p>
                      )}
                      <div style={{
                        display: 'inline-block',
                        backgroundColor: '#f39c12',
                        color: 'white',
                        padding: '0.5rem 1rem',
                        borderRadius: '20px',
                        fontSize: '0.9rem',
                        fontWeight: 'bold',
                        marginTop: '0.5rem'
                      }}>
                        ⏰ {getDaysUntil(event.startTime)}
                      </div>
                    </>
                  )}
                  <p style={{ marginTop: '0.5rem', color: '#F4B37A' }}>
                    <strong>👥</strong> {event.attendees || 0} people attending
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
