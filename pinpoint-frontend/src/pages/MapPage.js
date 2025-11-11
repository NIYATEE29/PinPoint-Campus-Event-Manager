import { useState, useEffect } from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { eventsAPI } from '../api/api';

const mapContainerStyle = { width: '100%', height: '600px', borderRadius: '8px', border: '3px solid #3498db' };
const campusCenter = { lat: 12.9345, lng: 77.5357 };

export default function MapPage({ user }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [showAddEventForm, setShowAddEventForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [joinedEvents, setJoinedEvents] = useState([]);
  const [pinPosition, setPinPosition] = useState(campusCenter);
  const [formData, setFormData] = useState({
    name: '',
    room: '',
    block: '',
    campus: 'Banashankari',
    description: '',
    category: 'tech',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
  });

  const categories = [
    { value: 'all', label: 'All Categories', emoji: '🎯' },
    { value: 'tech', label: 'Technology', emoji: '💻' },
    { value: 'sports', label: 'Sports', emoji: '⚽' },
    { value: 'cultural', label: 'Cultural', emoji: '🎭' },
    { value: 'art', label: 'Art', emoji: '🎨' },
    { value: 'music', label: 'Music', emoji: '🎵' },
    { value: 'academic', label: 'Academic', emoji: '📚' },
  ];

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: 'AIzaSyB8RYyytUJTQHVJG1hDiAYF22xI2nltX0A',
  });

  useEffect(() => {
    loadEvents();
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

  const handleMapClick = (e) => {
    if (!showAddEventForm) return;
    setPinPosition({
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    if (!user || user.userType !== 'organizer') {
      alert('Only organizers can create events!');
      return;
    }
    try {
      const startDateTime = formData.startDate && formData.startTime ? new Date(`${formData.startDate}T${formData.startTime}`) : null;
      const endDateTime = formData.endDate && formData.endTime ? new Date(`${formData.endDate}T${formData.endTime}`) : null;
      const eventData = {
        title: formData.name,
        name: formData.name,
        room: formData.room,
        block: formData.block,
        campus: formData.campus,
        description: formData.description,
        category: formData.category,
        lat: pinPosition.lat,
        lng: pinPosition.lng,
        startTime: startDateTime,
        endTime: endDateTime,
      };
      await eventsAPI.create(eventData);
      alert('Event created successfully!');
      loadEvents();
      setShowAddEventForm(false);
      setFormData({
        name: '',
        room: '',
        block: '',
        campus: 'Banashankari',
        description: '',
        category: 'tech',
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: '',
      });
      setPinPosition(campusCenter);
    } catch (error) {
      alert('Error creating event: ' + error.message);
    }
  };

  const handleAttendEvent = async (eventId) => {
    if (!user) {
      alert(' Please login to join events!');
      return;
    }
    if (joinedEvents.includes(eventId)) {
      alert(' You already joined this event!');
      return;
    }
    try {
      await eventsAPI.join(eventId);
      setJoinedEvents([...joinedEvents, eventId]);
      loadEvents();
      alert(' You joined the event!');
    } catch (error) {
      alert(' Error joining event: ' + error.message);
    }
  };

  const handleShareEvent = (event) => {
    if (navigator.share) {
      navigator.share({
        title: `Check out this event: ${event.title}`,
        text: `${event.description}\n\nLocation: Room ${event.room}, Block ${event.block}\nCampus: ${event.campus}`,
        url: window.location.href,
      });
    } else {
      const shareText = `Check out this event: ${event.title}!\n\n${event.description}\n\nLocation: Room ${event.room}, Block ${event.block}\nCampus: ${event.campus}`;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(shareText);
        alert(' Event details copied to clipboard!');
      } else {
        alert(shareText);
      }
    }
  };

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.block.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || event.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading || !isLoaded) {
    return (
      <div className="page">
        <h1>Loading Map & Events...</h1>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>🗺️ PES University Banashankari - Event Map</h1>

      {/* SEARCH BAR */}
      <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: '1', minWidth: '300px' }}>
          <input
            type="text"
            placeholder=" Search events by name, block, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              border: '2px solid #ddd',
              borderRadius: '8px',
              fontSize: '1rem',
            }}
          />
        </div>
        {user && user.userType === 'organizer' && (
          <button
            className="btn btn-primary"
            onClick={() => setShowAddEventForm(!showAddEventForm)}
            style={{ whiteSpace: 'nowrap' }}
          >
            {showAddEventForm ? ' Cancel' : '➕ Add Event'}
          </button>
        )}
      </div>

      {/* CATEGORY FILTERS */}
      <div style={{ marginBottom: '2rem' }}>
        <h3>Filter by Category:</h3>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              style={{
                padding: '0.5rem 1rem',
                border: selectedCategory === cat.value ? '2px solid #3498db' : '1px solid #ddd',
                backgroundColor: selectedCategory === cat.value ? '#3498db' : 'white',
                color: selectedCategory === cat.value ? 'white' : '#333',
                borderRadius: '20px',
                cursor: 'pointer',
                fontWeight: selectedCategory === cat.value ? 'bold' : 'normal',
                transition: 'all 0.3s',
              }}
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>
        <p style={{ marginTop: '0.5rem', color: '#666' }}>
          Showing {filteredEvents.length} of {events.length} events
        </p>
      </div>

      {/* ADD EVENT FORM */}
      {showAddEventForm && user && user.userType === 'organizer' && (
        <div className="card" style={{ marginBottom: '2rem', backgroundColor: '#33476aff', border: '2px solid #2d404cff' }}>
          <h3>➕ Create New Event</h3>
          <form onSubmit={handleAddEvent}>
            <div className="form-group">
              <label>Event Name:</label>
              <input type="text" name="name" value={formData.name} onChange={handleFormChange} required />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Room:</label>
                <input type="text" name="room" value={formData.room} onChange={handleFormChange} required />
              </div>
              <div className="form-group">
                <label>Block:</label>
                <input type="text" name="block" value={formData.block} onChange={handleFormChange} required />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Campus:</label>
                <select name="campus" value={formData.campus} onChange={handleFormChange}>
                  <option value="Banashankari">Banashankari</option>
                  <option value="RR Nagar">RR Nagar</option>
                  <option value="Electronic City">Electronic City</option>
                </select>
              </div>
              <div className="form-group">
                <label>Category:</label>
                <select name="category" value={formData.category} onChange={handleFormChange}>
                  <option value="tech">Technology</option>
                  <option value="sports">Sports</option>
                  <option value="cultural">Cultural</option>
                  <option value="art">Art</option>
                  <option value="music">Music</option>
                  <option value="academic">Academic</option>
                </select>
              </div>
            </div>
            {/* Start Date/Time */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Start Date:</label>
                <input type="date" name="startDate" value={formData.startDate || ''} onChange={handleFormChange} />
              </div>
              <div className="form-group">
                <label>Start Time:</label>
                <input type="time" name="startTime" value={formData.startTime || ''} onChange={handleFormChange} />
              </div>
            </div>
            {/* End Date/Time */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>End Date:</label>
                <input type="date" name="endDate" value={formData.endDate || ''} onChange={handleFormChange} />
              </div>
              <div className="form-group">
                <label>End Time:</label>
                <input type="time" name="endTime" value={formData.endTime || ''} onChange={handleFormChange} />
              </div>
            </div>
            <div className="form-group">
              <label>Description:</label>
              <textarea name="description" value={formData.description} onChange={handleFormChange} rows="3" required />
            </div>
            <div style={{ margin: "1rem 0" }}>
              <b>Click on the map to place your event pin, or drag the new blue pin to desired spot.</b>
            </div>
            <button type="submit" className="btn btn-primary">✅ Create Event</button>
          </form>
        </div>
      )}

      {/* GOOGLE MAP */}
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={campusCenter}
        zoom={17}
        onClick={handleMapClick}
      >
        {filteredEvents.map((event) => (
          <Marker
            key={event._id}
            position={{ lat: event.lat, lng: event.lng }}
            onClick={() => setSelectedMarker(event)}
            title={event.title}
          />
        ))}
        {/* New event pin */}
        {showAddEventForm && (
          <Marker
            position={pinPosition.lat ? pinPosition : campusCenter}
            icon={{
              url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
              scaledSize: { width: 40, height: 40 }
            }}
            draggable
            onDragEnd={(e) =>
              setPinPosition({ lat: e.latLng.lat(), lng: e.latLng.lng() })
            }
          />
        )}
      </GoogleMap>

      {/* EVENT DETAILS */}
      {selectedMarker && (
        <div className="card" style={{ marginBottom: '2rem', backgroundColor: '#f0f8ff', borderLeft: '4px solid #3498db' }}>
          <h2>{selectedMarker.title}</h2>
          <p><strong>Location:</strong> Room {selectedMarker.room}, Block {selectedMarker.block}</p>
          <p><strong>Campus:</strong> {selectedMarker.campus}</p>
          <p><strong>Category:</strong> {selectedMarker.category}</p>
          <p><strong>Description:</strong> {selectedMarker.description}</p>
          <p style={{ backgroundColor: '#3498db', color: 'white', padding: '0.5rem', borderRadius: '4px', textAlign: 'center' }}>
            👥 {selectedMarker.attendees} attending
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            <button
              className="btn btn-primary"
              disabled={joinedEvents.includes(selectedMarker._id)}
              style={{
                flex: 1,
                backgroundColor: joinedEvents.includes(selectedMarker._id) ? '#95a5a6' : '#27ae60'
              }}
              onClick={() => handleAttendEvent(selectedMarker._id)}
            >
              {joinedEvents.includes(selectedMarker._id) ? '✓ Joined' : '✓ Join Event'}
            </button>
            <button
              className="btn btn-primary"
              style={{ flex: 1, backgroundColor: '#9b59b6' }}
              onClick={() => handleShareEvent(selectedMarker)}
            >
              Share
            </button>
          </div>
        </div>
      )}

      {/* EVENTS LIST */}
      <div style={{ marginTop: '2rem' }}>
        <h3>📋 All Events ({filteredEvents.length})</h3>
        {filteredEvents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
            <p>No events found. {user?.userType === 'organizer' && 'Create one to get started!'}</p>
          </div>
        ) : (
          <div className="grid">
            {filteredEvents.map((event) => (
              <div key={event._id} className="card">
                <h4>{event.title}</h4>
                <p>
                  <strong>Category:</strong>{" "}
                  {categories.find((c) => c.value === event.category)?.emoji}{" "}
                  {categories.find((c) => c.value === event.category)?.label}
                </p>
                <p>
                  <strong>Location:</strong> Room {event.room}, Block {event.block}
                </p>
                <p>
                  <strong>Description:</strong> {event.description}
                </p>
                <div
                  style={{
                    backgroundColor: "#ecf0f1",
                    padding: "0.75rem",
                    borderRadius: "4px",
                    marginBottom: "1rem",
                    textAlign: "center"
                  }}
                >
                  <p style={{ margin: 0 ,color: '#999'}}>👥 {event.attendees} attending</p>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    className="btn btn-primary"
                    onClick={() => setSelectedMarker(event)}
                    style={{ flex: 1 }}
                  >
                     View on Map
                  </button>
                  <button
                    className="btn btn-primary"
                    disabled={joinedEvents.includes(event._id)}
                    style={{
                      flex: 1,
                      backgroundColor: joinedEvents.includes(event._id) ? "#95a5a6" : "#27ae60"
                    }}
                    onClick={() => handleAttendEvent(event._id)}
                  >
                    {joinedEvents.includes(event._id) ? "✓ Joined" : "✓ Join"}
                  </button>
                  <button
                    className="btn btn-primary"
                    style={{ flex: 1, backgroundColor: "#9b59b6" }}
                    onClick={() => handleShareEvent(event)}
                  >
                    📤 Share
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
