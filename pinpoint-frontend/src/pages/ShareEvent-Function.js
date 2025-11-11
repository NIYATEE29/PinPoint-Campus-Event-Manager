// Add this function to your MapPage.js

const handleShareEvent = (event) => {
  // Check if browser supports Web Share API
  if (navigator.share) {
    navigator.share({
      title: `Check out this event: ${event.title}`,
      text: `${event.description}\n\nLocation: Room ${event.room}, Block ${event.block}\nCampus: ${event.campus}`,
      url: window.location.href,
    })
    .then(() => console.log('Event shared successfully'))
    .catch((error) => console.log('Error sharing:', error));
  } else {
    // Fallback for browsers that don't support Web Share API
    const shareText = `Check out this event: ${event.title}!\n\n${event.description}\n\nLocation: Room ${event.room}, Block ${event.block}\nCampus: ${event.campus}\n\nVisit: ${window.location.href}`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      alert('✅ Event details copied to clipboard!\n\nYou can now paste and share it anywhere.');
    } else {
      alert(shareText);
    }
  }
};
