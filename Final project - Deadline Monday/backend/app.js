const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 48000;

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Connect to MongoDB (optional for portfolio)
mongoose.connect('mongodb://localhost:27017/portfolio', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

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
  password: String, // Note: In production, hash passwords!
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

const Contact = mongoose.model('Contact', contactSchema);
const Register = mongoose.model('Register', registerSchema);
const Post = mongoose.model('Post', postSchema);

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

// Registration form submission
app.post('/api/register', async (req, res) => {
  try {
    const { fullname, username, password, dob, experience, gender, accountType, terms } = req.body;

    // Prevent admin registration through normal registration
    if (accountType === 'admin') {
      return res.status(400).json({ success: false, message: 'Admin accounts cannot be created through registration' });
    }

    const newUser = new Register({ fullname, username, password, dob, experience, gender, accountType, terms });
    await newUser.save();

    // Generate token for auto-login after registration
    const token = `token_${newUser._id}_${Date.now()}`;

    res.json({
      success: true,
      message: 'Registration successful!',
      token: token,
      user: {
        id: newUser._id,
        username: newUser.username,
        fullname: newUser.fullname,
        accountType: newUser.accountType
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error registering user' });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check for admin login
    if (username === 'admin' && password === 'admin123') {
      const token = `admin_token_${Date.now()}`;
      return res.json({
        success: true,
        message: 'Admin login successful!',
        token: token,
        user: {
          id: 'admin',
          username: 'admin',
          fullname: 'Administrator',
          accountType: 'admin'
        }
      });
    }

    const user = await Register.findOne({ username, password }); // Note: In production, hash passwords!

    if (user) {
      // Generate a simple token (in production, use JWT)
      const token = `token_${user._id}_${Date.now()}`;
      res.json({
        success: true,
        message: 'Login successful!',
        token: token,
        user: {
          id: user._id,
          username: user.username,
          fullname: user.fullname,
          accountType: user.accountType
        }
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid username or password' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error logging in' });
  }
});

// Posts routes
app.post('/api/posts', upload.single('image'), async (req, res) => {
  try {
    // Check authentication
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const token = authHeader.substring(7);
    let userId, user;

    if (token.startsWith('admin_token_')) {
      userId = 'admin';
      user = { username: 'admin', fullname: 'Administrator' };
    } else if (token.startsWith('token_')) {
      userId = token.split('_')[1];
      user = await Register.findById(userId);
      if (!user || !user.active) {
        return res.status(401).json({ success: false, message: 'User not found or inactive' });
      }
    } else {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    const { title, content, tags } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const newPost = new Post({
      title,
      content,
      tags: tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
      imageUrl,
      authorId: userId === 'admin' ? null : userId,
      authorName: user.fullname || user.username
    });

    await newPost.save();

    res.json({
      success: true,
      message: 'Post created successfully!',
      post: newPost
    });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ success: false, message: 'Error creating post' });
  }
});

app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find({}).sort({ createdAt: -1 });
    res.json({ success: true, posts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching posts' });
  }
});

app.get('/api/posts/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    res.json({ success: true, post });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching post' });
  }
});

app.put('/api/posts/:id', upload.single('image'), async (req, res) => {
  try {
    // Check authentication
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const token = authHeader.substring(7);
    let userId, user;

    if (token.startsWith('admin_token_')) {
      userId = 'admin';
      user = { username: 'admin', fullname: 'Administrator' };
    } else if (token.startsWith('token_')) {
      userId = token.split('_')[1];
      user = await Register.findById(userId);
      if (!user || !user.active) {
        return res.status(401).json({ success: false, message: 'User not found or inactive' });
      }
    } else {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Check if user can edit this post (admin can edit any, regular users can edit their own)
    if (userId !== 'admin' && post.authorId.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'You can only edit your own posts' });
    }

    const { title, content, tags } = req.body;
    const updateData = {
      title,
      content,
      tags: tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
      updatedAt: new Date()
    };

    if (req.file) {
      updateData.imageUrl = `/uploads/${req.file.filename}`;
      // Optionally delete old image file
      if (post.imageUrl && post.imageUrl.startsWith('/uploads/')) {
        const oldImagePath = path.join(__dirname, post.imageUrl);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }

    const updatedPost = await Post.findByIdAndUpdate(req.params.id, updateData, { new: true });

    res.json({
      success: true,
      message: 'Post updated successfully!',
      post: updatedPost
    });
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ success: false, message: 'Error updating post' });
  }
});

app.delete('/api/posts/:id', async (req, res) => {
  try {
    // Check authentication
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const token = authHeader.substring(7);
    let userId;

    if (token.startsWith('admin_token_')) {
      userId = 'admin';
    } else if (token.startsWith('token_')) {
      userId = token.split('_')[1];
      const user = await Register.findById(userId);
      if (!user || !user.active) {
        return res.status(401).json({ success: false, message: 'User not found or inactive' });
      }
    } else {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Check if user can delete this post (admin can delete any, regular users can delete their own)
    if (userId !== 'admin' && post.authorId.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'You can only delete your own posts' });
    }

    // Delete associated image file
    if (post.imageUrl && post.imageUrl.startsWith('/uploads/')) {
      const imagePath = path.join(__dirname, post.imageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await Post.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting post' });
  }
});
app.get('/api/admin/users', async (req, res) => {
  try {
    // Check if admin token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const token = authHeader.substring(7);
    if (!token.startsWith('admin_token_')) {
      return res.status(401).json({ success: false, message: 'Admin access required' });
    }

    const users = await Register.find({}, { password: 0 }); // Exclude passwords
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching users' });
  }
});

app.delete('/api/admin/users/:id', async (req, res) => {
  try {
    // Check if admin token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const token = authHeader.substring(7);
    if (!token.startsWith('admin_token_')) {
      return res.status(401).json({ success: false, message: 'Admin access required' });
    }

    const userId = req.params.id;
    if (userId === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot delete admin account' });
    }

    await Register.findByIdAndDelete(userId);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting user' });
  }
});

app.post('/api/admin/users', async (req, res) => {
  try {
    // Check if admin token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const token = authHeader.substring(7);
    if (!token.startsWith('admin_token_')) {
      return res.status(401).json({ success: false, message: 'Admin access required' });
    }

    const { fullname, username, password, dob, experience, gender, accountType, terms } = req.body;

    // Prevent creating another admin
    if (accountType === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot create admin accounts' });
    }

    const newUser = new Register({ fullname, username, password, dob, experience, gender, accountType, terms });
    await newUser.save();

    res.json({
      success: true,
      message: 'User created successfully!',
      user: {
        id: newUser._id,
        username: newUser.username,
        fullname: newUser.fullname,
        accountType: newUser.accountType
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating user' });
  }
});

app.get('/api/admin/contacts', async (req, res) => {
  try {
    // Check if admin token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const token = authHeader.substring(7);
    if (!token.startsWith('admin_token_')) {
      return res.status(401).json({ success: false, message: 'Admin access required' });
    }

    const contacts = await Contact.find({}).sort({ createdAt: -1 }); // Sort by newest first
    res.json({ success: true, contacts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching contacts' });
  }
});

app.delete('/api/admin/contacts/:id', async (req, res) => {
  try {
    // Check if admin token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const token = authHeader.substring(7);
    if (!token.startsWith('admin_token_')) {
      return res.status(401).json({ success: false, message: 'Admin access required' });
    }

    const contactId = req.params.id;
    await Contact.findByIdAndDelete(contactId);
    res.json({ success: true, message: 'Contact message deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting contact message' });
  }
});

// Serve static files from the React app build directory
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});