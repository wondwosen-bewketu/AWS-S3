import { Request, Response } from 'express';
import multer from 'multer';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// Initialize S3 client with LocalStack endpoint
const s3 = new S3Client({
  endpoint: process.env.AWS_ENDPOINT || 'http://localhost:4566', // Default to LocalStack URL
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'test',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'test',
  },
  // Add this line if your S3 client version supports it
  forcePathStyle: true, // Required for LocalStack to correctly handle bucket names
});

// Set up multer to use memory storage
const upload = multer({ storage: multer.memoryStorage() });

// Middleware to handle file upload
export const uploadFile = upload.single('file'); // 'file' should match the field name in Postman

// Handler to process the uploaded file
export const uploadHandler = async (req: Request, res: Response) => {
  console.log('Headers:', req.headers); // Debugging log
  console.log('File:', req.file);       // Debugging log

  if (!req.file) return res.status(400).send('No file uploaded.');

  const buffer = req.file.buffer;
  const key = `${Date.now()}_${req.file.originalname}`;

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME || 'my-bucket', // Default to 'my-test-bucket' if env variable is not set
    Key: key,
    Body: buffer,
    ContentType: req.file.mimetype,
  };

  console.log('S3 Upload Params:', params); // Debugging log

  try {
    await s3.send(new PutObjectCommand(params));
    res.status(200).json({ key });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).send('Error uploading file.');
  }
};
