import prisma from '../lib/prisma.js';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const getProfilePhoto = async (req, res) => {
  // Initialize the S3 client
  const s3Client = new S3Client({
    region: process.env.BUCKET_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  try {
    const userId = req.user?.id;

    // Validate the user ID
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required or user is not authenticated' });
    }

    // Fetch the profile photo from the database
    const photo = await prisma.profilePhoto.findUnique({
      where: { userId },
    });

    if (!photo?.fileName) {
      return res.status(404).json({ error: 'Profile photo not found' });
    }

    const filePath = photo.fileName; // Example: 'profilePhotos/1731954973951-logo.png.jpeg'

    // Generate the S3 GetObject command
    const getObjectParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: filePath,
    };

    const command = new GetObjectCommand(getObjectParams);

    // Generate a signed URL
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // URL valid for 1 hour

    // Send the signed URL as the response
    res.status(200).json({ fileUrl: signedUrl });
  } catch (error) {
    console.error('Error fetching profile photo:', error);

    // Send a generic error message with details for debugging
    res.status(500).json({
      error: 'Failed to fetch profile photo',
      details: error.message || 'Unknown error occurred',
    });
  }
};

export default getProfilePhoto;
