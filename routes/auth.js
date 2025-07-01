import express from 'express';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

router.post('/register', asyncHandler(async (req, res) => {
  const { email, password, name, ssn, dob, address, state } = req.body;
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }
  const user = await User.create({ email, password, name, ssn, dob, address, state });
  if (user) {
    res.status(201).json({
      _id: user._id,
      email: user.email,
      name: user.name,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
}));

router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      email: user.email,
      name: user.name,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
}));

const protect = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }
  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

router.get('/me', protect, asyncHandler(async (req, res) => {
  res.json(req.user);
}));

router.post('/logout', protect, (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

export { protect };
export default router;