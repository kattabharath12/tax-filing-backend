import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import fileRoutes from './routes/file.js';
import formRoutes from './routes/forms.js';
import taxRoutes from './routes/tax.js';
import submissionRoutes from './routes/submission.js';
import paymentRoutes from './routes/payment.js';
import dashboardRoutes from './routes/dashboard.js';
import adminRoutes from './routes/admin.js';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Create uploads folder if not exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

app.use('/uploads', express.static(uploadsDir));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/forms', formRoutes);
app.use('/api/tax', taxRoutes);
app.use('/api/submit', submissionRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.send('Tax Filing Backend API Running - Full Version!');
});

app.get('/test', (req, res) => {
  res.json({ 
    message: 'Tax Filing API - Complete Version!', 
    database: 'MongoDB Atlas Connected',
    timestamp: new Date().toISOString(),
    availableEndpoints: [
      'POST /api/auth/register - Register user',
      'POST /api/auth/login - Login user',
      'GET /api/auth/me - Get current user',
      'GET /api/forms/:type - Get form template',
      'POST /api/forms/:type/save - Save form data',
      'GET /api/forms/:type/data - Get saved form data',
      'POST /api/tax/calculate - Calculate taxes',
      'POST /api/submit - Submit tax form',
      'GET /api/submit/user - Get user submissions',
      'GET /api/submit/status/:id - Get submission status',
      'POST /api/payments/charge - Process payment',
      'GET /api/payments/status/:id - Get payment status',
      'GET /api/payments/user - Get user payments',
      'GET /api/dashboard - Get user dashboard',
      'GET /api/dashboard/stats - Get user statistics',
      'GET /api/admin/submissions - Admin: Get all submissions',
      'GET /api/admin/payments - Admin: Get all payments',
      'GET /api/admin/users - Admin: Get all users',
      'GET /api/admin/stats - Admin: Get system statistics'
    ]
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🎉 Tax Filing API - Complete Version!`);
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Test the API at: http://localhost:${PORT}`);
  console.log(`📋 Available endpoints:`);
  console.log(`   - Auth: http://localhost:${PORT}/api/auth`);
  console.log(`   - Forms: http://localhost:${PORT}/api/forms`);
  console.log(`   - Tax: http://localhost:${PORT}/api/tax`);
  console.log(`   - Submit: http://localhost:${PORT}/api/submit`);
  console.log(`   - Payments: http://localhost:${PORT}/api/payments`);
  console.log(`   - Dashboard: http://localhost:${PORT}/api/dashboard`);
  console.log(`   - Admin: http://localhost:${PORT}/api/admin`);
});