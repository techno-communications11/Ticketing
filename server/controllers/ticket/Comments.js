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

    if (!req.files || !req.body) {
      return res.status(400).send('No files or form data uploaded.');
    }

    const { ticketId, comment, createdBy } = req.body;
    const files = req.files;

    if (!ticketId || !comment || !createdBy) {
      return res.status(400).send("Missing form fields.");
    }

    try {
      let fileSystemFileUrls = [];
      if (files['commentedfiles']) {
        fileSystemFileUrls = await Promise.all(files['commentedfiles'].map(file => uploadToS3(file)));
      }

      // Create new comment
      const newComment = {
        comment,
        createdBy,
        createdAt: new Date(),
      };

      if (fileSystemFileUrls.length > 0) {
        newComment.commentedfiles = fileSystemFileUrls; // Store file URLs if present
      }

      // Update ticket with the new comment
      const updatedTicket = await prisma.createTicket.update({
        where: { ticketId: ticketId },
        data: {
          comments: {
            create: newComment, // Add the comment
          },
        },
        include: { comments: true }, // Include comments in the response
      });

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
