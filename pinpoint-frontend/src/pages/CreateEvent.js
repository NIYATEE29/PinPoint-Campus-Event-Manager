import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { eventsAPI } from "../api/api";

const defaultCenter = { lat: 12.934350, lng: 77.535762 };
const mapContainerStyle = { width: "100%", height: "400px", borderRadius: "8px", border: "2px solid #3498db", marginBottom: "1rem" };

export default function CreateEvent({ token }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    room: "",
    block: "",
    campus: "Banashankari",
    description: "",
    category: "tech",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pin, setPin] = useState(defaultCenter);
console.log("PIN STATE", pin, typeof pin.lat, typeof pin.lng);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "API_KEY" 
  });

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleMapClick = (e) => {
    const newLat = typeof e.latLng.lat === "function" ? e.latLng.lat() : e.latLng.lat;
    const newLng = typeof e.latLng.lng === "function" ? e.latLng.lng() : e.latLng.lng;
    setPin({ lat: parseFloat(newLat), lng: parseFloat(newLng) });
  };

  const handleMarkerDragEnd = (e) => {
    const newLat = typeof e.latLng.lat === "function" ? e.latLng.lat() : e.latLng.lat;
    const newLng = typeof e.latLng.lng === "function" ? e.latLng.lng() : e.latLng.lng;
    setPin({ lat: parseFloat(newLat), lng: parseFloat(newLng) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const startDateTime =
        formData.startDate && formData.startTime
          ? new Date(`${formData.startDate}T${formData.startTime}`)
          : null;
      const endDateTime =
        formData.endDate && formData.endTime
          ? new Date(`${formData.endDate}T${formData.endTime}`)
          : null;

      const eventData = {
        title: formData.name,
        name: formData.name,
        room: formData.room,
        block: formData.block,
        campus: formData.campus,
        description: formData.description,
        category: formData.category,
        lat: pin.lat,
        lng: pin.lng,
        startTime: startDateTime,
        endTime: endDateTime,
      };

      await eventsAPI.create(eventData);
      alert("Event created successfully!");
      navigate("/my-events");
    } catch (error) {
      setError(error.message || "Error creating event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <h1>Create New Event</h1>
      <p style={{ marginBottom: "1rem", color: "#666" }}>
        Click on the map to place your event pin. Drag the pin to adjust location.
      </p>
      {error && (
        <div style={{
          padding: "1rem",
          backgroundColor: "#fee",
          color: "#c00",
          borderRadius: "4px",
          marginBottom: "1rem",
        }}>
          {error}
        </div>
      )}
      {/* MAP SECTION */}
      {isLoaded ? (
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={pin}
          zoom={17}
          onClick={handleMapClick}
        > 
        
          {(typeof pin.lat === "number" && typeof pin.lng === "number") && (
            <Marker
              position={{ lat: Number(pin.lat), lng: Number(pin.lng) }}
              draggable
              onDragEnd={handleMarkerDragEnd}
              icon={{
              url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
              scaledSize: new window.google.maps.Size(40, 40)
            }}
            />





          )}
        </GoogleMap>
      ) : (
        <div>Loading Map...</div>
      )}

      {/* EVENT FORM */}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Event Name:</label>
          <input type="text" name="name" value={formData.name} onChange={handleFormChange} required />
        </div>
        <div className="form-group">
          <label>Room:</label>
          <input type="text" name="room" value={formData.room} onChange={handleFormChange} required />
        </div>
        <div className="form-group">
          <label>Block:</label>
          <input type="text" name="block" value={formData.block} onChange={handleFormChange} required />
        </div>
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
        <div className="form-group">
          <label>Start Date:</label>
          <input type="date" name="startDate" value={formData.startDate} onChange={handleFormChange} />
        </div>
        <div className="form-group">
          <label>Start Time:</label>
          <input type="time" name="startTime" value={formData.startTime} onChange={handleFormChange} />
        </div>
        <div className="form-group">
          <label>End Date:</label>
          <input type="date" name="endDate" value={formData.endDate} onChange={handleFormChange} />
        </div>
        <div className="form-group">
          <label>End Time:</label>
          <input type="time" name="endTime" value={formData.endTime} onChange={handleFormChange} />
        </div>
        <div className="form-group">
          <label>Description:</label>
          <textarea name="description" value={formData.description} onChange={handleFormChange} rows="3" required />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Creating..." : "Create Event"}
        </button>
      </form>
    </div>
  );
}
