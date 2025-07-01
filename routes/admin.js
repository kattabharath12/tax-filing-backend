import express from 'express';
import asyncHandler from 'express-async-handler';
import Submission from '../models/Submission.js';
import Payment from '../models/Payment.js';
import User from '../models/User.js';
import { protect } from './auth.js';
import { admin } from '../middleware/admin.js';

const router = express.Router();

// Get all submissions with filters
router.get('/submissions', protect, admin, asyncHandler(async (req, res) => {
  const { status, userId, formType, page = 1, limit = 10 } = req.query;
  const filter = {};
  
  if (status) filter.status = status;
  if (userId) filter.user = userId;
  if (formType) filter.formType = formType;

  const submissions = await Submission.find(filter)
    .populate('user', 'email name')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Submission.countDocuments(filter);

  res.json({
    submissions,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    total
  });
}));

// Update submission status
router.put('/submissions/:id', protect, admin, asyncHandler(async (req, res) => {
  const { status, rejectionReason } = req.body;
  
  const submission = await Submission.findById(req.params.id);
  if (!submission) {
    res.status(404);
    throw new Error('Submission not found');
  }

  submission.status = status || submission.status;
  submission.rejectionReason = rejectionReason || submission.rejectionReason;
  submission.updatedAt = Date.now();

  await submission.save();

  res.json({
    message: 'Submission updated successfully',
    submission
  });
}));

// Get all payments with filters
router.get('/payments', protect, admin, asyncHandler(async (req, res) => {
  const { paymentStatus, userId, paymentMethod, page = 1, limit = 10 } = req.query;
  const filter = {};
  
  if (paymentStatus) filter.paymentStatus = paymentStatus;
  if (userId) filter.user = userId;
  if (paymentMethod) filter.paymentMethod = paymentMethod;

  const payments = await Payment.find(filter)
    .populate('user', 'email name')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Payment.countDocuments(filter);

  res.json({
    payments,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    total
  });
}));

// Get all users
router.get('/users', protect, admin, asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search } = req.query;
  const filter = {};
  
  if (search) {
    filter.$or = [
      { email: { $regex: search, $options: 'i' } },
      { name: { $regex: search, $options: 'i' } }
    ];
  }

  const users = await User.find(filter)
    .select('-password')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await User.countDocuments(filter);

  res.json({
    users,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    total
  });
}));

// Update user role
router.put('/users/:id/role', protect, admin, asyncHandler(async (req, res) => {
  const { role } = req.body;
  
  if (!['user', 'admin'].includes(role)) {
    res.status(400);
    throw new Error('Invalid role');
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.role = role;
  await user.save();

  res.json({
    message: 'User role updated successfully',
    user: {
      _id: user._id,
      email: user.email,
      name: user.name,
      role: user.role
    }
  });
}));

// Admin dashboard stats
router.get('/stats', protect, admin, asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalSubmissions = await Submission.countDocuments();
  const totalPayments = await Payment.countDocuments();

  const submissionsByStatus = await Submission.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  const paymentsByStatus = await Payment.aggregate([
    { $group: { _id: '$paymentStatus', count: { $sum: 1 }, total: { $sum: '$amount' } } }
  ]);

  const recentActivity = await Submission.find()
    .populate('user', 'email name')
    .sort({ createdAt: -1 })
    .limit(10);

  res.json({
    overview: {
      totalUsers,
      totalSubmissions,
      totalPayments
    },
    submissionsByStatus,
    paymentsByStatus,
    recentActivity
  });
}));

export default router;