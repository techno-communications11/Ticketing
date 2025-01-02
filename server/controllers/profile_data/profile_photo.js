import imageUpload, { uploadToS3 } from '../../multer/imageUpload.js';
import { validationResult } from 'express-validator';
import prisma from '../lib/prisma.js';

const profilePhoto = async (req, res) => {
  imageUpload.single('profilePhoto')(req, res, async (err) => {
    if (err) {
      console.error('Multer Error:', err);
      return res.status(500).json({ error: 'File upload failed', details: err.message });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
      const userId = req.user?.id; // Ensure `req.user` is populated by authentication middleware
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      // Upload the file to S3
      const s3Url = await uploadToS3(req.file);

      // Upsert the profile photo record in the database
      const savedPhoto = await prisma.profilePhoto.upsert({
        where: { userId },
        update: { fileName: s3Url },
        create: {
          fileName: s3Url,
          user: { connect: { id: userId } },
        },
      });

      // Respond with success and the saved photo data
      return res.status(200).json({
        message: 'Profile photo updated successfully',
        data: savedPhoto,
      });
    } catch (dbError) {
      console.error('Database Error:', dbError);
      return res.status(500).json({ error: 'Failed to save profile photo', details: dbError.message });
    }
  });
};

export default profilePhoto;
