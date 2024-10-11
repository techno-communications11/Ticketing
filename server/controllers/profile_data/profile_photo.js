import { validationResult } from 'express-validator';
import uploadImages from '../../multer/imageUpload.js';
import fs from 'fs';
import prisma from '../lib/prisma.js';

const profilePhoto = async (req, res) => {
    uploadImages.single('profilePhoto')(req, res, async (err) => {
        if (err) {
            console.error('Upload Error:', err);
            return res.status(500).json({ error: err.message });
        }

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
         console.log(req.file)
        const profilePhotoFilename = req.file ? req.file.filename : null;

        if (!profilePhotoFilename) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        try {
            const userId = req.user.id; 
            console.log(userId, "user"); // Ensure req.user.id is available

            // Check if the user already has a profile photo record
            const existingPhoto = await prisma.profilePhoto.findUnique({
                where: { userId } // Change to use userId for lookup
            });

            // If a record exists, update it; otherwise, create a new one
            const savedPhoto = existingPhoto 
                ? await prisma.profilePhoto.update({
                    where: { userId },
                    data: { fileName: profilePhotoFilename }
                })
                : await prisma.profilePhoto.create({
                    data: {
                        fileName: profilePhotoFilename, // Ensure fileName is provided
                        user: { connect: { id: userId } } // Connect to the user
                    }
                });

            // Optionally, save the profile photo information to a JSON file
            fs.writeFileSync('profileData.json', JSON.stringify(savedPhoto, null, 2));

            res.json({ message: 'Profile updated successfully', data: savedPhoto });
        } catch (dbError) {
            console.error('Database error:', dbError);
            return res.status(500).json({ error: 'Failed to save profile photo' });
        }
    });
};

export default profilePhoto;
