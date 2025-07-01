import mongoose from 'mongoose';

const SubmissionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  formType: { type: String, required: true },
  formData: { type: Object, required: true },
  status: { type: String, enum: ['Pending', 'Accepted', 'Rejected'], default: 'Pending' },
  submittedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  rejectionReason: { type: String, default: '' },
}, { timestamps: true });

const Submission = mongoose.model('Submission', SubmissionSchema);
export default Submission;