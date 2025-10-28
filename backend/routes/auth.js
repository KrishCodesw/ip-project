// We DO NOT need to load dotenv here, server.js does it.
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const User = require('../models/User');

// @route   POST api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists with this email' });
    }

    user = new User({
      username,
      email,
      password
    });

    await user.save();

    const payload = {
      user: {
        id: user.id,
      },
    };

    // Sign the token using the .env variable
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET, // This will work now
      { expiresIn: '1h' } 
    );
    
    res.json({ token }); 

  } catch (err) {
    console.error('Error in /register route:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token (Login)
// @access  Public
router.post('/login', async (req, res) => {
  console.log('Login request body:', req.body);  // Debug log
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email }).select('+password');
    console.log('Found user:', user ? 'Yes' : 'No');  // Debug log
    
    if (!user) {
      console.log('No user found with email:', email);  // Debug log
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', isMatch ? 'Yes' : 'No');  // Debug log
    
    if (!isMatch) {
      console.log('Password does not match');  // Debug log
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const payload = {
      user: {
        id: user.id,
      },
    };

    // Sign the token using the .env variable
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET, // This will work now
      { expiresIn: '10h' }
    );
    
    res.json({ token });

  } catch (err) {
    // This 'catch' block will no longer run
    console.error('Error in /login route:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/auth/user
// @desc    Get the logged-in user's data
// @access  Private
router.get('/user', auth, async (req, res) => {
  try {
    // This middleware will also work correctly now
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;

