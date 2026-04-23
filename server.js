import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Allow frontend to talk to this backend
app.use(express.json()); // Allow parsing JSON bodies

// 1. Connect to MongoDB
// You need to add MONGODB_URI="your_mongodb_connection_string" to your .env file
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/papyrus')
  .then(() => console.log('✅ Successfully connected to MongoDB'))
  .catch((error) => console.error('❌ Error connecting to MongoDB:', error));

// 2. Define a simple MongoDB Schema and Model (Example: User Data)
const UserDataSchema = new mongoose.Schema({
  email: String,
  role: String,
  createdAt: { type: Date, default: Date.now }
});

const UserData = mongoose.model('UserData', UserDataSchema);

// 3. API Endpoints

// GET all user data
app.get('/api/users', async (req, res) => {
  try {
    const users = await UserData.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error });
  }
});

// POST new user data
app.post('/api/users', async (req, res) => {
  try {
    const newUser = new UserData({
      email: req.body.email,
      role: req.body.role || 'user'
    });
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (error) {
    res.status(500).json({ message: 'Error saving user', error });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Backend server is running on http://localhost:${PORT}`);
});
