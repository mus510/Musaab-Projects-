// server.js - Esports Event Backend

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const express = require('express');
const path = require('path');
;
const port = 3000;

// Serve static files from project root
app.use(express.static(path.join(__dirname)));

// Handle all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'Esport-Event', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
const app = express();
const PORT = process.env.PORT || 5000;

// Security Middleware
app.use(helmet());
app.use(xss());
app.use(hpp());
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json({ limit: '10kb' }));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100
});
app.use(limiter);

// Database Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// Schemas
const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
});

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

const TeamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  game: { type: String, required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  created_at: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
const Team = mongoose.model('Team', TeamSchema);

// Authentication Middleware
const auth = (roles = []) => (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Invalid token' });
    if (roles.length && !roles.includes(decoded.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    req.user = decoded;
    next();
  });
};

// Routes
app.post('/api/auth/register', [
  body('username').trim().isLength({ min: 3 }),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const user = await User.create(req.body);
    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1h' }
    );
    res.status(201).json({ token });
  } catch (err) {
    res.status(400).json({ message: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { id: user._id, role: user.role }, 
    process.env.JWT_SECRET, 
    { expiresIn: '1h' }
  );
  res.json({ token });
});

app.get('/api/teams', auth(), async (req, res) => {
  const teams = await Team.find().populate('members');
  res.json(teams);
});

app.post('/api/teams', auth(), [
  body('name').trim().isLength({ min: 3 }),
  body('game').isIn(['valorant', 'cs2', 'dota2'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const team = await Team.create({ 
    ...req.body,
    members: [req.user.id]
  });
  res.status(201).json(team);
});

// Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Example Express.js CSRF Protection
app.use(csurf());
app.use((req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    next();
});

// Minimum 8 characters with mixed types
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// Example TOTP Verification
const speakeasy = require('speakeasy');
const verified = speakeasy.totp.verify({
    secret: user.totpSecret,
    encoding: 'base32',
    token: req.body.totp
});
