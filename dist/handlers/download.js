"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.download = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3 = new client_s3_1.S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});
const download = async (req, res) => {
    const fileName = req.params.fileName;
    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileName,
    };
    try {
        const data = await s3.send(new client_s3_1.GetObjectCommand(params));
        const stream = data.Body;
        res.setHeader('Content-Type', data.ContentType || 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
        stream.pipe(res);
    }
    catch (error) {
        console.error('Error downloading file:', error);
        res.status(500).send('Error downloading file.');
    }
};
exports.download = download;
