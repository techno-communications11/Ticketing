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
        const users = await prisma.user.findMany({
            select: {
                id: true,
                ntid: true,
                fullname: true,
                DoorCode: true,
                department: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        // Extract unique door codes from users
        const doorCodes = [...new Set(users.map(user => user.DoorCode).filter(Boolean))];

        // Fetch market data based on door codes
        const marketData = await prisma.marketStructure.findMany({
            where: {
                doorCode: { in: doorCodes },
            },
            select: {
                doorCode: true,
                dmName: true,
                market: {
                    select: { market: true },
                },
            },
        });

        // Fetch profile photos for the users
        const profilePhotos = await prisma.profilePhoto.findMany({
            where: {
                userId: { in: users.map(user => user.id) },
            },
            select: {
                userId: true,
                fileName: true,
            },
        });

        // Function to generate a signed URL for profile images
        const getImageUrl = async (fileName) => {
            if (!fileName) return null;
            try {
                const command = new GetObjectCommand({
                    Bucket: process.env.AWS_BUCKET_NAME,
                    Key: fileName,
                });
                return await getSignedUrl(client, command, { expiresIn: 3600 });
            } catch (error) {
                console.error("Error generating signed URL:", error);
                return null;
            }
        };

        // Enrich user data with market data and profile image URLs
        const enrichedData = await Promise.all(
            users.map(async (user) => {
                const marketInfo = marketData.find(market => market.doorCode === user.DoorCode) || {};
                const profilePhoto = profilePhotos.find(photo => photo.userId === user.id) || {};
                const profileImageUrl = await getImageUrl(profilePhoto.fileName);

                return {
                    ...user,
                    market: marketInfo.market || null,
                    dmName: marketInfo.dmName || null,
                    profileImage: profileImageUrl || null,
                };
            })
        );

        // Send the enriched user data as a response
        res.status(200).json(enrichedData);
    } catch (error) {
        console.error("Error fetching user data:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export default userData;
