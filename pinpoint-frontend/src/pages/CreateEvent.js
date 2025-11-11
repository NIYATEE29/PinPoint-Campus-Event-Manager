import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventsAPI } from '../api/api';

export default function CreateEvent({ user }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    room: '',
    block: '',
    campus: 'Banashankari',
    category: 'tech',
    description: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user || user.userType !== 'organizer') {
      alert('❌ Only organizers can create events!');
      return;
    }

    setLoading(true);

    try {
      // Combine date and time
      const startDateTime = formData.startDate && formData.startTime 
        ? new Date(`${formData.startDate}T${formData.startTime}`)
        : null;
      
      const endDateTime = formData.endDate && formData.endTime
        ? new Date(`${formData.endDate}T${formData.endTime}`)
        : null;

      const eventData = {
        title: formData.name,
        name: formData.name,
        room: formData.room,
        block: formData.block,
        campus: formData.campus,
        category: formData.category,
        description: formData.description,
        lat: 13.0079 + Math.random() * 0.01,
        lng: 77.5735 + Math.random() * 0.01,
        startTime: startDateTime,
        endTime: endDateTime,
      };

      await eventsAPI.create(eventData);
      
      alert('✅ Event created successfully!');
      navigate('/map');
    } catch (error) {
      alert('❌ Error creating event: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.userType !== 'organizer') {
    return (
      <div className="page">
        <h1>❌ Access Denied</h1>
        <p>Only organizers can create events.</p>
        <button className="btn btn-primary" onClick={() => navigate('/')}>
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>➕ Create New Event</h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        Fill in the details to create an event
      </p>

      <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <form onSubmit={handleSubmit}>
          {/* Event Name */}
          <div className="form-group">
            <label>Event Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Tech Workshop 2025"
              required
            />
          </div>

          {/* Location */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Room *</label>
              <input
                type="text"
                name="room"
                value={formData.room}
                onChange={handleInputChange}
                placeholder="e.g., 101"
                required
              />
            </div>
            <div className="form-group">
              <label>Block *</label>
              <input
                type="text"
                name="block"
                value={formData.block}
                onChange={handleInputChange}
                placeholder="e.g., A"
                required
              />
            </div>
            <div className="form-group">
              <label>Campus *</label>
              <select name="campus" value={formData.campus} onChange={handleInputChange}>
                <option value="Banashankari">Banashankari</option>
                <option value="RR Nagar">RR Nagar</option>
                <option value="Electronic City">Electronic City</option>
              </select>
            </div>
          </div>

          {/* Category */}
          <div className="form-group">
            <label>Category *</label>
            <select name="category" value={formData.category} onChange={handleInputChange}>
              <option value="tech">💻 Technology</option>
              <option value="sports">⚽ Sports</option>
              <option value="cultural">🎭 Cultural</option>
              <option value="art">🎨 Art</option>
              <option value="music">🎵 Music</option>
              <option value="academic">📚 Academic</option>
            </select>
          </div>

          {/* Start Date & Time */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Start Date</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Start Time</label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* End Date & Time */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>End Date</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>End Time</label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label>Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="4"
              placeholder="Describe your event..."
              required
            ></textarea>
          </div>

          {/* Submit Button */}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ flex: 1, backgroundColor: '#27ae60' }}
              disabled={loading}
            >
              {loading ? 'Creating...' : '✅ Create Event'}
            </button>
            <button
              type="button"
              className="btn btn-primary"
              style={{ flex: 1, backgroundColor: '#95a5a6' }}
              onClick={() => navigate('/map')}
            >
              ✕ Cancel
            </button>
          </div>
        </form>
      </div>

      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f0f8ff', borderRadius: '8px', maxWidth: '800px', margin: '2rem auto' }}>
        <h3>💡 Tips:</h3>
        <ul>
          <li>Add start/end times to show your event in "Live Events"</li>
          <li>Choose the right category for better discoverability</li>
          <li>Write a clear description to attract attendees</li>
          <li>Include specific room and block information</li>
        </ul>
      </div>
    </div>
  );
}
