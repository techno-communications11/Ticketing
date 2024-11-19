import imageUpload, { uploadToS3 } from '../../multer/imageUpload.js';
import { validationResult } from 'express-validator';
import prisma from '../lib/prisma.js';

const profilePhoto = async (req, res) => {
    imageUpload.single('profilePhoto')(req, res, async (err) => {
        if (err) {
            console.error('Multer Error:', err);
            return res.status(500).json({ error: err.message });
        }

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        try {
            const userId = req.user.id; // Assuming req.user is populated by authentication middleware
            const s3Url = await uploadToS3(req.file); // Upload to S3

            // Use upsert to either update or create the profile photo entry in the database
            const savedPhoto = await prisma.profilePhoto.upsert({
                where: { userId },
                update: { fileName: s3Url },
                create: {
                    fileName: s3Url,
                    user: { connect: { id: userId } }
                }
            });

            res.json({ message: 'Profile photo updated successfully', data: savedPhoto });
        } catch (dbError) {
            console.error('Database Error:', dbError);
            res.status(500).json({ error: 'Failed to save profile photo' });
        }
    });
};

export default profilePhoto;
