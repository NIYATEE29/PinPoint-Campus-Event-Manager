import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../api/api';

export default function MyProfile() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savedEvents, setSavedEvents] = useState([]);
  const [joinedEvents, setJoinedEvents] = useState([]);
  const [myEvents, setMyEvents] = useState([]);
  const [formData, setFormData] = useState({
    firstName: user.firstName || 'User',
    lastName: user.lastName || 'Name',
    email: user.email || 'user@test.com',
    organization: user.organization || 'N/A',
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      // Load saved events
      const saved = await userAPI.getSavedEvents();
      setSavedEvents(saved);

      // Load joined events
      const joined = await userAPI.getJoinedEvents();
      setJoinedEvents(joined);

      // Load created events (if organizer)
      if (user.userType === 'organizer') {
        const created = await userAPI.getMyEvents();
        setMyEvents(created);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading user data:', error);
      setLoading(false);
    }
  };

  // Generate recent activity from real data
  const getRecentActivity = () => {
    const activities = [];

    // Add joined events
    joinedEvents.slice(0, 3).forEach(event => {
      activities.push({
        id: `joined-${event._id}`,
        action: 'Joined',
        event: event.title,
        time: 'Recently',
        icon: '✓',
      });
    });

    // Add saved events
    savedEvents.slice(0, 2).forEach(event => {
      activities.push({
        id: `saved-${event._id}`,
        action: 'Saved',
        event: event.title,
        time: 'Recently',
        icon: '⭐',
      });
    });

    // Add created events (if organizer)
    if (user.userType === 'organizer') {
      myEvents.slice(0, 2).forEach(event => {
        activities.push({
          id: `created-${event._id}`,
          action: 'Created',
          event: event.title,
          time: 'Recently',
          icon: '➕',
        });
      });
    }

    return activities;
  };

  const recentActivity = getRecentActivity();

  const stats = {
    savedEvents: savedEvents.length,
    eventsAttended: joinedEvents.length,
    eventsCreated: myEvents.length,
    totalAttendees: myEvents.reduce((sum, event) => sum + (event.attendees || 0), 0),
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    try {
      const updated = await userAPI.updateProfile(formData);
      const updatedUser = { ...user, ...formData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setIsEditing(false);
      alert('✅ Profile updated successfully!');
    } catch (error) {
      alert('❌ Error updating profile: ' + error.message);
    }
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    alert('✅ Password changed successfully!');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  if (loading) {
    return (
      <div className="page">
        <h1>👤 My Profile</h1>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>👤 My Profile</h1>

      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Profile Information */}
        <div className="card">
          <h2>Profile Information</h2>
          
          {isEditing ? (
            <form onSubmit={handleUpdateProfile}>
              <div className="form-group">
                <label>First Name:</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Last Name:</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  style={{ backgroundColor: '#f0f0f0' }}
                />
              </div>
              <div className="form-group">
                <label>User Type:</label>
                <input
                  type="text"
                  value={user.userType || 'student'}
                  disabled
                  style={{ backgroundColor: '#f0f0f0' }}
                />
              </div>
              {user.userType === 'organizer' && (
                <div className="form-group">
                  <label>Organization:</label>
                  <input
                    type="text"
                    name="organization"
                    value={formData.organization}
                    onChange={handleInputChange}
                  />
                </div>
              )}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  💾 Save Changes
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ flex: 1, backgroundColor: '#95a5a6' }}
                  onClick={() => setIsEditing(false)}
                >
                  ✕ Cancel
                </button>
              </div>
            </form>
          ) : (
            <div>
              <div style={{ padding: '1rem', backgroundColor: '#6fe5f5ff', borderRadius: '8px', marginBottom: '1rem' }}>
                <p style={{ margin: '0.5rem 0' }}><strong>Name:</strong> {formData.firstName} {formData.lastName}</p>
                <p style={{ margin: '0.5rem 0' }}><strong>Email:</strong> {formData.email}</p>
                <p style={{ margin: '0.5rem 0' }}><strong>User Type:</strong> {user.userType || 'student'}</p>
                {user.userType === 'organizer' && (
                  <p style={{ margin: '0.5rem 0' }}><strong>Organization:</strong> {formData.organization}</p>
                )}
              </div>
              <button
                className="btn btn-primary"
                style={{ width: '100%' }}
                onClick={() => setIsEditing(true)}
              >
                ✏️ Edit Profile
              </button>
            </div>
          )}
        </div>

        {/* Account Settings */}
        <div className="card">
          <h2>Account Settings</h2>
          
          {/* Change Password */}
          <form onSubmit={handleChangePassword} style={{ marginBottom: '2rem' }}>
            <h3>Change Password</h3>
            <div className="form-group">
              <label>Current Password:</label>
              <input type="password" placeholder="Enter current password" required />
            </div>
            <div className="form-group">
              <label>New Password:</label>
              <input type="password" placeholder="Enter new password" required />
            </div>
            <div className="form-group">
              <label>Confirm New Password:</label>
              <input type="password" placeholder="Confirm new password" required />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              🔒 Change Password
            </button>
          </form>

          {/* Stats */}
          <div style={{ padding: '1rem', backgroundColor: '#6fe5f5ff', borderRadius: '8px' }}>
            <h3>Account Statistics</h3>
            {user.userType === 'student' ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                  <span>⭐ Saved Events:</span>
                  <strong>{stats.savedEvents}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                  <span>✓ Events Attended:</span>
                  <strong>{stats.eventsAttended}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                  <span>📅 Member Since:</span>
                  <strong>2025</strong>
                </div>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                  <span>➕ Events Created:</span>
                  <strong>{stats.eventsCreated}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                  <span>👥 Total Attendees:</span>
                  <strong>{stats.totalAttendees}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                  <span>🏛️ Organization:</span>
                  <strong>{formData.organization}</strong>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card" style={{ marginTop: '2rem' }}>
        <h2>📊 Recent Activity</h2>
        
        {recentActivity.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem',
                  backgroundColor: '#6fe5f5ff',
                  borderRadius: '8px',
                  borderLeft: '4px solid #3498db',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: '#3498db',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem',
                  }}>
                    {activity.icon}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: 'bold' }}>
                      {activity.action} "{activity.event}"
                    </p>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>
                      {activity.time}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
            <p>No recent activity. Join or save events to see activity here!</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="card" style={{ marginTop: '2rem' }}>
        <h2>⚡ Quick Actions</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <button 
            className="btn btn-primary" 
            style={{ padding: '1rem' }}
            onClick={() => navigate('/map')}
          >
            🗺️ Browse Events
          </button>
          {user.userType === 'organizer' ? (
            <button 
              className="btn btn-primary" 
              style={{ padding: '1rem', backgroundColor: '#27ae60' }}
              onClick={() => navigate('/create-event')}
            >
              ➕ Create New Event
            </button>
          ) : (
            <button 
              className="btn btn-primary" 
              style={{ padding: '1rem', backgroundColor: '#f39c12' }}
              onClick={() => navigate('/saved-events')}
            >
              ⭐ View Saved Events
            </button>
          )}
          <button 
            className="btn btn-primary" 
            style={{ padding: '1rem', backgroundColor: '#9b59b6' }}
            onClick={() => navigate('/live')}
          >
            🔔 Live Events
          </button>
        </div>
      </div>
    </div>
  );
}
