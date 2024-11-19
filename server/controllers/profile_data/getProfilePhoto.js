import prisma from '../lib/prisma.js';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'; // Import necessary AWS SDK classes
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'; // Import the getSignedUrl function

const getProfilePhoto = async (req, res) => {
    const client =  new S3Client({ 
        region: process.env.BUCKET_REGION, 
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
    });

    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required or user is not authenticated' });
        }

        // Fetch the profile photo record from the database
        const photo = await prisma.profilePhoto.findUnique({
            where: { userId },
        });

        if (!photo || !photo.fileName) {
            return res.status(404).json({ error: 'Profile photo not found' });
        }

        // Use the relative file path from the database
        const filePath = photo.fileName;  // Example: 'profilePhotos/1731954973951-logo.png.jpeg'

        const getObjectParams = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: filePath, // Use only the relative path here
        };

        const command = new GetObjectCommand(getObjectParams);
        const url = await getSignedUrl(client, command, { expiresIn: 3600 }); // 1-hour expiration

        // Return the signed URL
        res.json({ fileUrl: url });
    } catch (error) {
        console.error('Error fetching profile photo:', error);
        res.status(500).json({ error: 'Failed to fetch profile photo', details: error.message });
    }
};





export default getProfilePhoto; 