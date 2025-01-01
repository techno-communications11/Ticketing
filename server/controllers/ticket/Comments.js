import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

import uploadImages from "../../multer/imageUpload.js";
import { uploadToS3 } from "../../multer/imageUpload.js";

const comments = async (req, res) => {
  uploadImages.fields([{ name: 'commentedfiles' }])(req, res, async (err) => {
    if (err) {
      console.error("Multer error: ", err);
      return res.status(400).send('Error uploading files.');
    }

    // Check for missing files or form data
    if (!req.files || !req.body) {
      return res.status(400).send('No files or form data uploaded.');
    }

    const { ticketId, comment, createdBy } = req.body;
    const files = req.files;

    // Validate required form fields
    if (!ticketId || !comment || !createdBy) {
      return res.status(400).send("Missing required fields: ticketId, comment, or createdBy.");
    }

    try {
      // Initialize file system file URLs array
      let fileSystemFileUrls = [];
      
      // Upload files to S3 if they exist
      if (files['commentedfiles']) {
        fileSystemFileUrls = await Promise.all(files['commentedfiles'].map(async (file) => {
          try {
            return await uploadToS3(file); // upload each file to S3
          } catch (uploadError) {
            console.error("File upload error: ", uploadError);
            return null; // You can choose to handle this differently
          }
        }));
      }

      // Filter out any failed file uploads
      fileSystemFileUrls = fileSystemFileUrls.filter(url => url);

      // Create new comment object
      const newComment = {
        comment,
        createdBy,
        createdAt: new Date(),
        commentedfiles: fileSystemFileUrls.length > 0 ? fileSystemFileUrls : undefined, // Include files only if there are valid URLs
      };

      // Update ticket with the new comment
      const updatedTicket = await prisma.createTicket.update({
        where: { ticketId },
        data: {
          comments: {
            create: newComment,
          },
        },
        include: { comments: true }, // Include comments in the response
      });

      // Respond with success
      res.json({
        message: "Comment created successfully",
        updatedTicket,
      });
    } catch (error) {
      console.error("Error uploading files or updating ticket:", error);
      res.status(500).send("Internal server error.");
    }
  });
};

export default comments;
