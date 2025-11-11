export default function About() {
  return (
    <div className="page">
      <div className="card">
        <h1>About PinPoint</h1>
        <p>PinPoint is a real-time visual guide to all formal events happening at the university.</p>
        <p>It functions as a "Marauder's Map" for the campus, allowing students to see what's happening, where it's happening, and when.</p>
        
        <h2 style={{marginTop: '2rem', marginBottom: '1rem'}}>How It Works</h2>
        <ol>
          <li><strong>Browse the Map:</strong> See all events on an interactive campus map</li>
          <li><strong>Filter by Time:</strong> Find events happening now, today, or this week</li>
          <li><strong>Save Events:</strong> Bookmark events you don't want to miss</li>
          <li><strong>Get Details:</strong> Click any event to see full information</li>
        </ol>
      </div>
    </div>
  );
}
