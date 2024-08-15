import { Request, Response } from 'express';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const download = async (req: Request, res: Response) => {
  const fileName = req.params.fileName;

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: fileName,
  };

  try {
    const data = await s3.send(new GetObjectCommand(params));
    const stream = data.Body as NodeJS.ReadableStream;

    res.setHeader('Content-Type', data.ContentType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    stream.pipe(res);
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).send('Error downloading file.');
  }
};
