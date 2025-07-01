import express from 'express';
import asyncHandler from 'express-async-handler';
import Submission from '../models/Submission.js';
import { protect } from './auth.js';

const router = express.Router();

const getRandomStatus = () => {
  const statuses = ['Accepted', 'Rejected', 'Pending'];
  return statuses[Math.floor(Math.random() * statuses.length)];
};

router.post('/', protect, asyncHandler(async (req, res) => {
  const { formType, formData } = req.body;
  if (!formType || !formData) {
    res.status(400);
    throw new Error('Form type and data are required');
  }

  const status = getRandomStatus();
  const rejectionReason = status === 'Rejected' ? 'Mock rejection reason: data mismatch' : '';

  const submission = new Submission({
    user: req.user._id,
    formType,
    formData,
    status,
    rejectionReason,
  });

  await submission.save();

  res.json({
    message: 'Form submitted',
    submissionId: submission._id,
    status,
    rejectionReason,
  });
}));

router.get('/status/:id', protect, asyncHandler(async (req, res) => {
  const submission = await Submission.findById(req.params.id);
  if (!submission) {
    res.status(404);
    throw new Error('Submission not found');
  }
  if (submission.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to view this submission');
  }
  res.json({
    status: submission.status,
    rejectionReason: submission.rejectionReason,
    submittedAt: submission.submittedAt,
    updatedAt: submission.updatedAt,
  });
}));

router.get('/user', protect, asyncHandler(async (req, res) => {
  const submissions = await Submission.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(submissions);
}));

export default router;