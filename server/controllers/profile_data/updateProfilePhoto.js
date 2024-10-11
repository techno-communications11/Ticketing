import { validationResult } from 'express-validator';
import uploadImages from '../../multer/imageUpload.js';
import fs from 'fs';
import prisma from '../lib/prisma.js';

const updateProfilePhoto = async (req, res) => {
    uploadImages.single('profilePhoto')(req, res, async (err) => {
        if (err) {
            console.error('Upload Error:', err);
            return res.status(500).json({ error: err.message });
        }

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const profilePhotoFilename = req.file ? req.file.filename : null;

        if (!profilePhotoFilename) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        try {
            const userId = req.user.id; // Assuming req.user.id is available

            // Update or create a new profile photo record
            const savedPhoto = await prisma.profilePhoto.upsert({
                where: { userId }, // Unique identifier for the user
                update: {
                    fileName: profilePhotoFilename,
                },
                create: {
                    fileName: profilePhotoFilename,
                    user: {
                        connect: { id: userId } // Connect to the existing user
                    }
                }
            });

            // Optionally, save the profile photo information to a JSON file
            fs.writeFileSync('profileData.json', JSON.stringify(savedPhoto, null, 2));

            res.json({ message: 'Profile updated successfully', data: savedPhoto });
        } catch (dbError) {
            console.error('Database Error:', dbError);
            return res.status(500).json({ error: 'Failed to save profile photo' });
        }
    });
};

export default updateProfilePhoto;
