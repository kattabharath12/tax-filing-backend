import mongoose from 'mongoose';

const DocumentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fileName: { type: String, required: true },
  fileType: { type: String, required: true },
  filePath: { type: String, required: true },
  extractedData: { type: Object, default: {} },
  uploadDate: { type: Date, default: Date.now },
}, { timestamps: true });

const Document = mongoose.model('Document', DocumentSchema);
export default Document;