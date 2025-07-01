import express from 'express';
import asyncHandler from 'express-async-handler';
import Submission from '../models/Submission.js';
import Payment from '../models/Payment.js';
import { protect } from './auth.js';

const router = express.Router();

router.get('/', protect, asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const submissions = await Submission.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(5);

  const payments = await Payment.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(5);

  const totalSubmissions = await Submission.countDocuments({ user: userId });
  const acceptedSubmissions = await Submission.countDocuments({ user: userId, status: 'Accepted' });
  const totalPayments = await Payment.countDocuments({ user: userId });
  const successfulPayments = await Payment.countDocuments({ user: userId, paymentStatus: 'Succeeded' });

  const submissionProgress = totalSubmissions > 0 ? (acceptedSubmissions / totalSubmissions) * 100 : 0;
  const paymentSuccess = totalPayments > 0 ? (successfulPayments / totalPayments) * 100 : 0;

  // Calculate total amount paid
  const totalAmountPaid = await Payment.aggregate([
    { $match: { user: userId, paymentStatus: 'Succeeded' } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);

  res.json({
    user: {
      name: req.user.name,
      email: req.user.email
    },
    submissions: {
      recent: submissions,
      total: totalSubmissions,
      accepted: acceptedSubmissions,
      progress: submissionProgress.toFixed(2)
    },
    payments: {
      recent: payments,
      total: totalPayments,
      successful: successfulPayments,
      successRate: paymentSuccess.toFixed(2),
      totalAmountPaid: totalAmountPaid.length > 0 ? totalAmountPaid[0].total : 0
    },
    summary: {
      completionRate: submissionProgress.toFixed(2),
      lastActivity: submissions.length > 0 ? submissions[0].createdAt : null
    }
  });
}));

router.get('/stats', protect, asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Get submission stats by status
  const submissionStats = await Submission.aggregate([
    { $match: { user: userId } },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  // Get payment stats by method
  const paymentStats = await Payment.aggregate([
    { $match: { user: userId } },
    { $group: { _id: '$paymentMethod', count: { $sum: 1 }, total: { $sum: '$amount' } } }
  ]);

  // Get monthly activity
  const monthlySubmissions = await Submission.aggregate([
    { $match: { user: userId } },
    { 
      $group: { 
        _id: { 
          year: { $year: '$createdAt' }, 
          month: { $month: '$createdAt' } 
        }, 
        count: { $sum: 1 } 
      } 
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
    { $limit: 12 }
  ]);

  res.json({
    submissionsByStatus: submissionStats,
    paymentsByMethod: paymentStats,
    monthlyActivity: monthlySubmissions
  });
}));

export default router;