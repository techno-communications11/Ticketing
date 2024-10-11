import prisma from '../lib/prisma.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const getProfilePhoto = async (req, res) => {
    try {
        const userId = req.user.id;

        // Ensure the user ID is valid
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        const photo = await prisma.profilePhoto.findUnique({
            where: { userId: userId } // Change 'id' to 'userId' if that is the correct field
        });

        if (!photo || !photo.fileName) {
            return res.status(404).json({ error: 'Profile photo not found' });
        }

        res.json({ path: photo.fileName });
    } catch (error) {
        console.error('Error retrieving profile photo:', error);
        res.status(500).json({ error: 'Failed to retrieve profile photo' });
    }
};

export default getProfilePhoto;
