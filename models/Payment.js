import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  paymentMethod: { type: String, enum: ['Stripe', 'PayPal'], required: true },
  paymentStatus: { type: String, enum: ['Pending', 'Succeeded', 'Failed'], default: 'Pending' },
  paymentIntentId: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

const Payment = mongoose.model('Payment', PaymentSchema);
export default Payment;