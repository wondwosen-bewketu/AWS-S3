import express from 'express';
import { uploadFile, uploadHandler } from './handlers/upload';
import * as dotenv from 'dotenv';
dotenv.config();


const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route for file upload
app.post('/upload', uploadFile, uploadHandler);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});


