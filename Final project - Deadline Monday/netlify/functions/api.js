const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const multer = require('multer');
const serverless = require('serverless-http');

const app = express();

// Use memory storage instead of disk (Netlify functions are read-only)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolio';
let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;
  await mongoose.connect(MONGODB_URI);
  isConnected = true;
  console.log('MongoDB connected');
};

// Define Schemas
const contactSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
  createdAt: { type: Date, default: Date.now }
});

const registerSchema = new mongoose.Schema({
  fullname: String,
  username: String,
  password: String,
  dob: Date,
  experience: String,
  gender: String,
  accountType: String,
  terms: Boolean,
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const postSchema = new mongoose.Schema({
  title: String,
  content: String,
  tags: [String],
  imageUrl: String,
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Register' },
  authorName: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Contact = mongoose.models.Contact || mongoose.model('Contact', contactSchema);
const Register = mongoose.models.Register || mongoose.model('Register', registerSchema);
const Post = mongoose.models.Post || mongoose.model('Post', postSchema);

// Connect DB before each request
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database connection error' });
  }
});

// Routes
app.get('/api/test', (req, res) => {
  res.json({ message: 'Hello from backend!' });
});

// Contact form submission
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const newContact = new Contact({ name, email, message });
    await newContact.save();
    res.json({ success: true, message: 'Message sent successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error saving message' });
  }
});

// Registration
app.post('/api/register', async (req, res) => {
  try {
    const { fullname, username, password, dob, experience, gender, accountType, terms } = req.body;
    if (accountType === 'admin') {
      return res.status(400).json({ success: false, message: 'Admin accounts cannot be created through registration' });
    }
    const newUser = new Register({ fullname, username, password, dob, experience, gender, accountType, terms });
    await newUser.save();
    const token = `token_${newUser._id}_${Date.now()}`;
    res.json({
      success: true,
      message: 'Registration successful!',
      token,
      user: { id: newUser._id, username: newUser.username, fullname: newUser.fullname, accountType: newUser.accountType }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error registering user' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (username === 'admin' && password === 'admin123') {
      const token = `admin_token_${Date.now()}`;
      return res.json({
        success: true,
        message: 'Admin login successful!',
        token,
        user: { id: 'admin', username: 'admin', fullname: 'Administrator', accountType: 'admin' }
      });
    }
    const user = await Register.findOne({ username, password });
    if (user) {
      const token = `token_${user._id}_${Date.now()}`;
      res.json({
        success: true,
        message: 'Login successful!',
        token,
        user: { id: user._id, username: user.username, fullname: user.fullname, accountType: user.accountType }
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid username or password' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error logging in' });
  }
});

// Helper: authenticate request
const authenticate = async (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.substring(7);
  if (token.startsWith('admin_token_')) return { userId: 'admin', user: { username: 'admin', fullname: 'Administrator' } };
  if (token.startsWith('token_')) {
    const userId = token.split('_')[1];
    const user = await Register.findById(userId);
    if (!user || !user.active) return null;
    return { userId, user };
  }
  return null;
};

// Create post
app.post('/api/posts', upload.single('image'), async (req, res) => {
  try {
    const auth = await authenticate(req);
    if (!auth) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { title, content, tags } = req.body;
    // Note: file uploads stored as base64 in DB since Netlify has no persistent disk
    const imageUrl = req.file
      ? `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`
      : null;

    const newPost = new Post({
      title,
      content,
      tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      imageUrl,
      authorId: auth.userId === 'admin' ? null : auth.userId,
      authorName: auth.user.fullname || auth.user.username
    });
    await newPost.save();
    res.json({ success: true, message: 'Post created successfully!', post: newPost });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error creating post' });
  }
});

// Get all posts
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find({}).sort({ createdAt: -1 });
    res.json({ success: true, posts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching posts' });
  }
});

// Get single post
app.get('/api/posts/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    res.json({ success: true, post });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching post' });
  }
});

// Update post
app.put('/api/posts/:id', upload.single('image'), async (req, res) => {
  try {
    const auth = await authenticate(req);
    if (!auth) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    if (auth.userId !== 'admin' && post.authorId.toString() !== auth.userId) {
      return res.status(403).json({ success: false, message: 'You can only edit your own posts' });
    }

    const { title, content, tags } = req.body;
    const updateData = {
      title,
      content,
      tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      updatedAt: new Date()
    };
    if (req.file) {
      updateData.imageUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    }

    const updatedPost = await Post.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json({ success: true, message: 'Post updated successfully!', post: updatedPost });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating post' });
  }
});

// Delete post
app.delete('/api/posts/:id', async (req, res) => {
  try {
    const auth = await authenticate(req);
    if (!auth) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    if (auth.userId !== 'admin' && post.authorId.toString() !== auth.userId) {
      return res.status(403).json({ success: false, message: 'You can only delete your own posts' });
    }

    await Post.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting post' });
  }
});

// Admin: get users
app.get('/api/admin/users', async (req, res) => {
  try {
    const auth = await authenticate(req);
    if (!auth || auth.userId !== 'admin') return res.status(401).json({ success: false, message: 'Admin access required' });
    const users = await Register.find({}, { password: 0 });
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching users' });
  }
});

// Admin: delete user
app.delete('/api/admin/users/:id', async (req, res) => {
  try {
    const auth = await authenticate(req);
    if (!auth || auth.userId !== 'admin') return res.status(401).json({ success: false, message: 'Admin access required' });
    if (req.params.id === 'admin') return res.status(400).json({ success: false, message: 'Cannot delete admin account' });
    await Register.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting user' });
  }
});

// Admin: create user
app.post('/api/admin/users', async (req, res) => {
  try {
    const auth = await authenticate(req);
    if (!auth || auth.userId !== 'admin') return res.status(401).json({ success: false, message: 'Admin access required' });
    const { fullname, username, password, dob, experience, gender, accountType, terms } = req.body;
    if (accountType === 'admin') return res.status(400).json({ success: false, message: 'Cannot create admin accounts' });
    const newUser = new Register({ fullname, username, password, dob, experience, gender, accountType, terms });
    await newUser.save();
    res.json({
      success: true,
      message: 'User created successfully!',
      user: { id: newUser._id, username: newUser.username, fullname: newUser.fullname, accountType: newUser.accountType }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating user' });
  }
});

// Admin: get contacts
app.get('/api/admin/contacts', async (req, res) => {
  try {
    const auth = await authenticate(req);
    if (!auth || auth.userId !== 'admin') return res.status(401).json({ success: false, message: 'Admin access required' });
    const contacts = await Contact.find({}).sort({ createdAt: -1 });
    res.json({ success: true, contacts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching contacts' });
  }
});

// Admin: delete contact
app.delete('/api/admin/contacts/:id', async (req, res) => {
  try {
    const auth = await authenticate(req);
    if (!auth || auth.userId !== 'admin') return res.status(401).json({ success: false, message: 'Admin access required' });
    await Contact.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Contact message deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting contact message' });
  }
});

module.exports.handler = serverless(app);
