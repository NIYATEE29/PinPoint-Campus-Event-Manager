import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import MapPage from './pages/MapPage';
import EventDetails from './pages/EventDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import CreateEvent from './pages/CreateEvent';
import MyEvents from './pages/MyEvents';
import SavedEvents from './pages/SavedEvents';
import About from './pages/About';
import Contact from './pages/Contact';
import './styles.css';
import MyProfile from './pages/MyProfile';
import ClubDirectory from './pages/ClubDirectory';
import LiveEvents from './pages/LiveEvents';



function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('token', userToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="nav-container">
            <Link to="/" className="nav-logo"> PinPoint</Link>
            <div className="nav-links">
              <Link to="/">Home</Link>
              <Link to="/map">Map</Link>
              <Link to="/clubs">Clubs</Link>
              <Link to="/live"> Live Events</Link>
              <Link to="/profile">My Profile</Link>
              <Link to="/about">About</Link>
              <Link to="/contact">Contact</Link>
              
            </div>
            <div className="nav-auth">
              {user ? (
                <div className="user-menu">
                  <span className="user-name">{user.firstName}</span>
                  <div className="dropdown">
                    {user?.userType === 'organizer' && <Link to="/create-event">Create Event</Link>}
                    {user?.userType === 'organizer' && <Link to="/my-events">My Events</Link>}
                    {user?.userType === 'student' && <Link to="/saved-events">Saved Events</Link>}
                    <hr style={{ margin: '0.5rem 0', border: 'none', borderTop: '1px solid #ddd' }} />
                      <button 
                        onClick={handleLogout} 
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem',
                          backgroundColor: '#e74c3c',
                          color: 'white',
                          border: 'none',
                          cursor: 'pointer',
                          textAlign: 'left',
                          fontWeight: 'bold',
                        }}
                      >
                         Logout
                      </button>

                  </div>
                </div>
              ) : (
                <>
                  <Link to="/login" className="btn btn-primary">Login</Link>
                  <Link to="/register" className="btn btn-secondary">Register</Link>
                </>
              )}
            </div>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/map" element={<MapPage user={user} token={token} />} />
          <Route path="/event/:id" element={<EventDetails user={user} token={token} />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Register onLogin={handleLogin} />} />
          <Route path="/clubs" element={<ClubDirectory />} />
          <Route path="/create-event" element={user && user.userType === 'organizer' ? <CreateEvent token={token} /> : <Navigate to="/login" />} />
          <Route path="/my-events" element={user && user.userType === 'organizer' ? <MyEvents token={token} /> : <Navigate to="/login" />} />
          <Route path="/saved-events" element={user && user.userType === 'student' ? <SavedEvents token={token} /> : <Navigate to="/login" />} />
          <Route path="/about" element={<About />} />
          <Route path="/live" element={<LiveEvents />} />
          <Route path="/profile" element={user ? <MyProfile /> : <Navigate to="/login" />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
