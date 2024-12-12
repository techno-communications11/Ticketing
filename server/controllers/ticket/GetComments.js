import prisma from '../lib/prisma.js';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({ region: 'eu-north-1' }); // Set your AWS region

const getcomment = async (req, res) => {
  const { ticketId } = req.query;

  try {
    const ticketWithComments = await prisma.createTicket.findUnique({
      where: { ticketId:ticketId },
      include: {
        comments: true,
      },
    });
    console.log(ticketWithComments, "tickcomments");

    if (!ticketWithComments) {
      return res.status(404).json({ message: 'Ticket not found.' });
    }

    // Generate signed URLs for commented files
    const commentsWithSignedUrls = await Promise.all(
      ticketWithComments.comments.map(async (comment) => {
        if (comment.commentedfiles && comment.commentedfiles.length > 0) {
          const signedUrls = await Promise.all(
            comment.commentedfiles.map(async (file) => {
              const filePath = file;  // Example: 'profilePhotos/1731954973951-logo.png.jpeg'

              const getObjectParams = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: filePath, // Use only the relative path here
              };

              const command = new GetObjectCommand(getObjectParams);
              const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
              return url; // URL expires in 1 hour
            })
          );
          return { ...comment, commentedfiles: signedUrls };
        }
        return comment;
      })
    );

    console.log(commentsWithSignedUrls, "comments with signed URLs");
    res.status(200).json(commentsWithSignedUrls);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Error fetching comments.' });
  }
};

export default getcomment;
