import express from 'express';
import multer from 'multer';
import path from 'path';
import Document from '../models/Document.js';
import { mockExtractData } from '../utils/ocrMock.js';
import asyncHandler from 'express-async-handler';
import { protect } from './auth.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  fileFilter(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.pdf' || ext === '.jpeg' || ext === '.jpg' || ext === '.png') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, JPEG, JPG, PNG files are allowed'));
    }
  },
});

router.post(
  '/upload',
  protect,
  upload.single('file'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      res.status(400);
      throw new Error('No file uploaded');
    }

    let fileType = 'Unknown';
    if (req.file.originalname.toLowerCase().includes('w-2')) fileType = 'W-2';
    else if (req.file.originalname.toLowerCase().includes('1099-nec')) fileType = '1099-NEC';
    else if (req.file.originalname.toLowerCase().includes('1099-misc')) fileType = '1099-MISC';

    const extractedData = mockExtractData(fileType);

    const document = new Document({
      user: req.user._id,
      fileName: req.file.originalname,
      fileType,
      filePath: req.file.path,
      extractedData,
    });

    await document.save();

    res.status(201).json({
      message: 'File uploaded and data extracted',
      document,
    });
  })
);

export default router;