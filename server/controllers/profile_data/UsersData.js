import prisma from "../lib/prisma.js";
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const userData = async (req, res) => {
    const client = new S3Client({ 
        region: process.env.BUCKET_REGION, 
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
    });

    try {
        // Fetch user data without passwords
        const responseData = await prisma.user.findMany({
            select: {
                id: true,
                ntid: true,
                fullname: true,
                DoorCode: true,
                password: false, // Exclude password field from the response
                department: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        // Extract door codes from the users
        const doorCodes = responseData.map(user => user.DoorCode).filter(Boolean);

        // Fetch market data based on door codes
        const additionalData = await prisma.marketStructure.findMany({
            where: {
                doorCode: {
                    in: doorCodes,
                },
            },
            select: {
                doorCode: true,
                dmName: true,
                market: {
                    select: { market: true }, // Fetch the market name
                },
            },
        });

        // Fetch profile photo file names for each user from the database
        const profileImages = await prisma.profilePhoto.findMany({
            where: {
                userId: {
                    in: responseData.map(user => user.id),
                }
            },
            select: {
                userId: true,
                fileName: true
            }
        });

        // Function to get the signed URL for a profile image
        const getImageUrl = async (fileName) => {
            if (!fileName) return null; // If no fileName, return null

            // Use the relative file path from the database
            const getObjectParams = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: fileName, // Use the relative path here
            };

            try {
                const command = new GetObjectCommand(getObjectParams);
                const url = await getSignedUrl(client, command, { expiresIn: 3600 }); // URL expires in 1 hour
                return url;
            } catch (error) {
                console.error("Error generating signed URL:", error);
                return null;
            }
        };

        // Merge user data with additional market data and AWS profile image URLs
        const data = await Promise.all(responseData.map(async (user) => {
            const additional = additionalData.find(add => add.doorCode === user.DoorCode);
            const profileImage = profileImages.find(image => image.userId === user.id);
            const profileImageUrl = await getImageUrl(profileImage ? profileImage.fileName : null); // Fetch image URL for the user

            return {
                ...user,
                market: additional ? additional.market : null,
                dmName: additional ? additional.dmName : null,
                profileimage: profileImageUrl, // Include the image URL
            };
        }));

        // Respond with user data excluding passwords
        res.status(200).json(data);
    } catch (error) {
        console.error("Error fetching user data:", error); // Log the error for debugging
        res.status(500).json({ error: 'Internal server error' });
    }
};

export default userData;
