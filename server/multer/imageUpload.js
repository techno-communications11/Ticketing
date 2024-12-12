import multer from 'multer';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import sharp from 'sharp';

dotenv.config();

// Configure AWS S3 Client
const s3 = new S3Client({
    region: process.env.BUCKET_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

// Multer configuration for in-memory storage
const imageUpload = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'image/jpeg', 'image/png', 'image/gif', 'image/webp', // Image types
            'application/pdf', // PDF
            'text/plain', // Text files
            'application/msword', // Word document
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // Word document (.docx)
            'application/vnd.ms-excel', // Excel spreadsheet
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // Excel spreadsheet (.xlsx)
            'text/csv'
        ];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'), false);
        }
    },
});

// Function to upload image to S3 with resizing
export const uploadToS3 = async (file) => {
    const fileKey = `profilePhotos/${Date.now()}-${file.originalname}`; // Store only the relative path

    try {
        let fileBuffer = file.buffer;

        // Resize the image before uploading to S3 if it's an image
        if (['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.mimetype)) {
            fileBuffer = await sharp(file.buffer)
                .resize(500, 500, { 
                    fit: sharp.fit.cover,
                    position: sharp.strategy.entropy,
                })
                .toBuffer();
        }

        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: fileKey, // Use the relative file path
            Body: fileBuffer,  // Use fileBuffer here
            ContentType: file.mimetype,
        };

        const command = new PutObjectCommand(params);
        await s3.send(command); // Execute the S3 command

        // Return only the relative path of the file, not the full URL
        return fileKey;
    } catch (err) {
        throw new Error('Failed to upload image to S3: ' + err.message);
    }
};

export default imageUpload;
