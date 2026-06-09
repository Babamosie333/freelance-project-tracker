require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { buildMongoUri } = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');

const app = express();

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://freelance-project-tracker.vercel.app/'
  ],
  credentials: true
}));

app.use(express.json());

app.use('/auth', authRoutes);
app.use('/projects', projectRoutes);
app.use('/tasks', taskRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'Freelance Tracker API is running',
    health: '/health'
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Freelance Tracker API is running' });
});

const mongoUri = buildMongoUri();

if (!mongoose.connection.readyState) {
  mongoose.connect(mongoUri)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err.message));
}

module.exports = app;
