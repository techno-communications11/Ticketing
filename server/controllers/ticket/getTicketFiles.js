import prisma from '../lib/prisma.js'; // Import Prisma client
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'; // Import necessary AWS SDK classes
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'; // Import the getSignedUrl function

const getTicketFiles = async (req, res) => {
    const client = new S3Client({
        region: process.env.BUCKET_REGION,
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
    });

    try {
        const { ticketId } = req.params;
        console.log(ticketId, "ticketId in API");

        if (!ticketId) {
            return res.status(400).json({ error: 'Ticket ID is required' });
        }

        // Fetch the ticket with associated files from the database
        const ticket = await prisma.createTicket.findFirst({
            where: { ticketId: ticketId },
        });

        console.log('Fetched ticket:', ticket); // Log the ticket to check its contents

        if (!ticket) {
            return res.status(404).json({ error: 'Ticket not found for this ID' });
        }

        const filesfetched = [];

        // Iterate through the files and push them into filesfetched array
        for (let key in ticket.files) {
            if (ticket.files.hasOwnProperty(key)) {
                let value = ticket.files[key]; // Assign 'value' here
                console.log('Key:', key);
                console.log('Value:', value);

                if (Array.isArray(value)) {
                    if (value.length > 0) {
                        value.forEach((file, index) => {
                            filesfetched.push(file); // Add the file to the array
                            console.log(`File ${index + 1}: ${file}`);
                        });
                    } else {
                        console.log('No files in this array');
                    }
                }
            }
        }

        console.log('Files fetched:', filesfetched);

        // Generate signed URLs for each file in the filesfetched array
        const signedUrls = await Promise.all(filesfetched.map(async (filePath) => {
            const getObjectParams = {
                Bucket: process.env.AWS_BUCKET_NAME, // Ensure the bucket name is correct
                Key: filePath, // Use only the relative path here
            };

            const command = new GetObjectCommand(getObjectParams);
            const url = await getSignedUrl(client, command, { expiresIn: 3600 });
            // console.log(url,'rrrrrrrrrrr') // 3600 seconds = 1 hour
            return url; // Return the signed URL
        }));

        // Return the signed URLs as a response
        console.log(signedUrls,"ssssssssss")

        return res.status(200).json({ signedUrls });

    } catch (error) {
        console.error('Error fetching ticket files:', error);
        res.status(500).json({ error: 'Failed to fetch ticket files', details: error.message });
    }
};

export default getTicketFiles;
