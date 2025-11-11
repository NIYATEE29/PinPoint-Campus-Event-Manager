export default function Contact() {
  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Thank you for your message!');
  };

  return (
    <div className="form">
      <h2>Contact Us</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Name:</label>
          <input type="text" placeholder="Your name" required />
        </div>
        <div className="form-group">
          <label>Email:</label>
          <input type="email" placeholder="Your email" required />
        </div>
        <div className="form-group">
          <label>Subject:</label>
          <input type="text" placeholder="Message subject" required />
        </div>
        <div className="form-group">
          <label>Message:</label>
          <textarea placeholder="Your message" rows="5" required></textarea>
        </div>
        <button type="submit">Send Message</button>
      </form>
      
      <div style={{marginTop: '2rem', textAlign: 'center'}}>
        <h3> Contact Information</h3>
        <p><strong>Email:</strong> support@pinpoint.edu</p>
        <p><strong>Phone:</strong> +91 55512 34567</p>
        <p><strong>Office:</strong> Tech Building, Room 101</p>
      </div>
    </div>
  );
}
