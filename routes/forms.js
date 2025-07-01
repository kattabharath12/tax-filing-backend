import express from 'express';
import asyncHandler from 'express-async-handler';
import FormData from '../models/FormData.js';
import { protect } from './auth.js';

const router = express.Router();

const formTemplates = {
  '1040': {
    fields: [
      { name: 'firstName', label: 'First Name', type: 'text' },
      { name: 'lastName', label: 'Last Name', type: 'text' },
      { name: 'ssn', label: 'SSN', type: 'text' },
      { name: 'income', label: 'Income', type: 'number' },
    ],
  },
  'ScheduleA': {
    fields: [
      { name: 'medicalExpenses', label: 'Medical Expenses', type: 'number' },
      { name: 'stateTaxes', label: 'State Taxes', type: 'number' },
    ],
  },
};

router.get('/:type', protect, asyncHandler(async (req, res) => {
  const formType = req.params.type;
  const template = formTemplates[formType];
  if (!template) {
    res.status(404);
    throw new Error('Form template not found');
  }
  res.json(template);
}));

router.get('/:type/data', protect, asyncHandler(async (req, res) => {
  const formType = req.params.type;
  const formData = await FormData.findOne({ user: req.user._id, formType });
  if (!formData) {
    return res.json({ data: {} });
  }
  res.json({ data: formData.data });
}));

router.post('/:type/save', protect, asyncHandler(async (req, res) => {
  const formType = req.params.type;
  const { data } = req.body;
  let formData = await FormData.findOne({ user: req.user._id, formType });
  if (formData) {
    formData.data = data;
    formData.updatedAt = Date.now();
    await formData.save();
  } else {
    formData = new FormData({ user: req.user._id, formType, data });
    await formData.save();
  }
  res.json({ message: 'Form data saved successfully' });
}));

export default router;