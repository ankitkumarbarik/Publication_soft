const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, qualifications } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const validRoles = ['author', 'reviewer', 'publisher'];
    const userRole = validRoles.includes(role) ? role : 'author';

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: userRole,
      qualifications: userRole === 'reviewer' ? qualifications : '',
      reviewerStatus: userRole === 'reviewer' ? 'PENDING' : 'APPROVED' // Publishers/Authors auto-approve
    });

    await newUser.save();

    res.status(201).json({ 
        message: userRole === 'reviewer' 
            ? 'Registration successful. Account pending approval.' 
            : 'Registration successful. Please login.' 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (user.role === 'reviewer' && user.reviewerStatus !== 'APPROVED') {
       return res.status(403).json({ message: 'Account not approved yet.' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.registerAdmin = async (req, res) => { // Internal use/Dev only usually
    try {
        const { name, email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'User exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role: 'admin'
        });
        await newUser.save();
        res.status(201).json({ message: 'Admin created' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
