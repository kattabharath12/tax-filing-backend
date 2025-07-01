import express from 'express';
import asyncHandler from 'express-async-handler';
import { calculateTax } from '../tax_engine/calculator.js';
import { protect } from './auth.js';

const router = express.Router();

// Public tax calculation endpoint (no auth required)
router.post('/calculate', asyncHandler(async (req, res) => {
  const formData = req.body;
  if (!formData) {
    res.status(400);
    throw new Error('Form data is required');
  }

  const result = calculateTax(formData);
  res.json(result);
}));

// Protected endpoint if needed later
router.post('/calculate-secure', protect, asyncHandler(async (req, res) => {
  const formData = req.body;
  if (!formData) {
    res.status(400);
    throw new Error('Form data is required');
  }

  const result = calculateTax(formData);
  res.json(result);
}));

export default router;