"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadHandler = exports.uploadFile = void 0;
const multer_1 = __importDefault(require("multer"));
const client_s3_1 = require("@aws-sdk/client-s3");
// Initialize S3 client with LocalStack endpoint
const s3 = new client_s3_1.S3Client({
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
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
// Middleware to handle file upload
exports.uploadFile = upload.single('file'); // 'file' should match the field name in Postman
// Handler to process the uploaded file
const uploadHandler = async (req, res) => {
    console.log('Headers:', req.headers); // Debugging log
    console.log('File:', req.file); // Debugging log
    if (!req.file)
        return res.status(400).send('No file uploaded.');
    const buffer = req.file.buffer;
    const key = `${Date.now()}_${req.file.originalname}`;
    const params = {
        Bucket: process.env.AWS_BUCKET_NAME || 'my-test-bucket', // Default to 'my-test-bucket' if env variable is not set
        Key: key,
        Body: buffer,
        ContentType: req.file.mimetype,
    };
    console.log('S3 Upload Params:', params); // Debugging log
    try {
        await s3.send(new client_s3_1.PutObjectCommand(params));
        res.status(200).json({ key });
    }
    catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).send('Error uploading file.');
    }
};
exports.uploadHandler = uploadHandler;
