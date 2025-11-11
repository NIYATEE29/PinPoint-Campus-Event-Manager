import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');


  return (
    <div className="page">
      <div className="hero">
        <h1>Discover Campus Events</h1>
        <p>Your guide to all campus activities - visually on a map!</p>
        <button onClick={() => navigate('/map')} className="btn btn-primary">
          Explore Events
        </button>
        <button onClick={() => navigate('/register')} className="btn btn-secondary" style={{marginLeft: '1rem'}}>
          Sign Up
        </button>
      </div>

      <div className="grid">
        <div className="card" style={{ cursor: 'pointer' }} onClick={() => navigate('/map')}>
          <h3>🗺️ Interactive Map</h3>
          <p>See all events happening on campus with their exact locations.</p>
          <button className="btn btn-primary" style={{ marginTop: '1rem', width: '100%' }}>
            View Map
          </button>
        </div>

        <div className="card" style={{ cursor: 'pointer' }} onClick={() => navigate('/live')}>
          <h3>⏰ Real-Time Updates</h3>
          <p>Filter events by time - happening now, today, or this week.</p>
          <button className="btn btn-primary" style={{ marginTop: '1rem', width: '100%', backgroundColor: '#f39c12' }}>
            See Live Events
          </button>
        </div>

        <div className="card" style={{ cursor: 'pointer' }} onClick={() => navigate('/register')}>
          <h3>⭐ Save Favorites</h3>
          <p>Bookmark events you don't want to miss and access them later.</p>
          <button className="btn btn-primary" style={{ marginTop: '1rem', width: '100%', backgroundColor: '#27ae60' }}>
            Get Started
          </button>
        </div>
      </div>

      {/* Additional Features Section */}
      <div style={{ marginTop: '3rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>✨ More Features</h2>
        <div className="grid">
          <div className="card" style={{ cursor: 'pointer' }} onClick={() => navigate('/clubs')}>
            <h3>🏛️ Club Directory</h3>
            <p>Discover all clubs and their upcoming events.</p>
            <button className="btn btn-primary" style={{ marginTop: '1rem', width: '100%', backgroundColor: '#9b59b6' }}>
              Browse Clubs
            </button>
          </div>

          {user && user.userType === 'organizer' && (
            <div className="card" style={{ cursor: 'pointer' }} onClick={() => navigate('/map?addEvent=1')}>
              <h3>➕ Create Events</h3>
              <p>Organizers can create and manage campus events.</p>
              <button className="btn btn-primary" style={{ marginTop: '1rem', width: '100%', backgroundColor: '#e74c3c' }}>
                Create Event
              </button>
            </div>
          )}



          <div className="card" style={{ cursor: 'pointer' }} onClick={() => navigate('/about')}>
            <h3>ℹ️ Learn More</h3>
            <p>Find out how PinPoint works and how to use it.</p>
            <button className="btn btn-primary" style={{ marginTop: '1rem', width: '100%', backgroundColor: '#34495e' }}>
              About PinPoint
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
