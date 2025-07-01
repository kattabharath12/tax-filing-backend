import mongoose from 'mongoose';

const FormDataSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  formType: { type: String, required: true },
  data: { type: Object, default: {} },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

const FormData = mongoose.model('FormData', FormDataSchema);
export default FormData;