const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = 'mongodb://localhost:27017/pinpoint';
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err));

const JWT_SECRET = 'your-secret-key-change-this-in-production';

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  userType: { type: String, enum: ['student', 'organizer'], default: 'student' },
  organization: { type: String },
  savedEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
  joinedEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  name: { type: String, required: true },
  room: { type: String, required: true },
  block: { type: String, required: true },
  campus: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  startTime: { type: Date },
  endTime: { type: Date },
  attendees: { type: Number, default: 0 },
  organizerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});

const Event = mongoose.model('Event', eventSchema);

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// AUTH ROUTES
app.post('/api/auth/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, userType, organization } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      userType,
      organization,
    });
    await user.save();
    const token = jwt.sign(
      { id: user._id, email: user.email, userType: user.userType },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        userType: user.userType,
        organization: user.organization,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const token = jwt.sign(
      { id: user._id, email: user.email, userType: user.userType },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        userType: user.userType,
        organization: user.organization,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// EVENT ROUTES
app.get('/api/events', async (req, res) => {
  try {
    const events = await Event.find().populate('organizerId', 'firstName lastName organization');
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/events/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('organizerId', 'firstName lastName organization');
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/events', authenticateToken, async (req, res) => {
  try {
    const { title, name, room, block, campus, category, description, lat, lng, startTime, endTime } = req.body;
    const event = new Event({
      title,
      name,
      room,
      block,
      campus,
      category,
      description,
      lat,
      lng,
      startTime,
      endTime,
      organizerId: req.user.id,
    });
    await event.save();
    res.json({ message: 'Event created successfully', event });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/events/:id', authenticateToken, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    if (event.organizerId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this event' });
    }
    Object.assign(event, req.body);
    await event.save();
    res.json({ message: 'Event updated successfully', event });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/events/:id', authenticateToken, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    if (event.organizerId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this event' });
    }
    await event.deleteOne();
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/events/:id/join', authenticateToken, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    const user = await User.findById(req.user.id);
    if (user.joinedEvents.includes(event._id)) {
      return res.status(400).json({ error: 'Already joined this event' });
    }
    user.joinedEvents.push(event._id);
    event.attendees += 1;
    await user.save();
    await event.save();
    res.json({ message: 'Successfully joined event', event });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/events/:id/save', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const eventId = req.params.id;
    if (user.savedEvents.includes(eventId)) {
      return res.status(400).json({ error: 'Event already saved' });
    }
    user.savedEvents.push(eventId);
    await user.save();
    res.json({ message: 'Event saved successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// USER ROUTES
app.get('/api/user/saved-events', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('savedEvents');
    res.json(user.savedEvents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/user/joined-events', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('joinedEvents');
    res.json(user.joinedEvents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/user/my-events', authenticateToken, async (req, res) => {
  try {
    const events = await Event.find({ organizerId: req.user.id });
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const { firstName, lastName, organization } = req.body;
    const user = await User.findById(req.user.id);
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.organization = organization || user.organization;
    await user.save();
    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CLUBS ROUTE
app.get('/api/clubs', async (req, res) => {
  try {
    const clubs = await User.find({ userType: 'organizer' }).select('-password');
    res.json(clubs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// SERVER START
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📦 MongoDB connected to ${MONGODB_URI}`);
  console.log(`🔐 JWT authentication enabled`);
});
