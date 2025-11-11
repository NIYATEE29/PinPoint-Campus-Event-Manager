import { useParams } from 'react-router-dom';

export default function EventDetails() {
  const { id } = useParams();
  
  return (
    <div className="page">
      <div className="card">
        <h1>Event Details</h1>
        <p>Event ID: {id}</p>
        <p>Event details will be loaded from backend</p>
      </div>
    </div>
  );
}
