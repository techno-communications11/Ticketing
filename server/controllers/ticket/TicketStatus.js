import prisma from "../lib/prisma.js";
import { Resend } from "resend";
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({ region: 'eu-north-1' });
// Initialize Resend Email Service
const resend = new Resend(process.env.RESEND_API_KEY);

const TicketStatus = async (req, res) => {
  const { statusId, ticketId, usersId } = req.query;

  console.log("Request Data:", req.query);

  try {
    if (!statusId || !ticketId || !usersId) {
      return res.status(400).json({
        message: "Status ID, ticket ID, and user ID are required.",
      });
    }

    const ticket = await prisma.createTicket.findUnique({
      where: { ticketId },
      select: {
        userId: true,
        status: { select: { id: true, name: true } },
        assignedTo: true,
        department: { select: { name: true } },
      },
    });

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found." });
    }

    const requestedStatus = String(statusId);

    const validTransitions = {
      "1": ["2"],
      "2": ["3", "4"],
      "3": ["4"],
      "4": ["5"],
      "5": ["3", "4", "1"],
    };

    if (!validTransitions[ticket.status.id]?.includes(requestedStatus)) {
      return res.status(400).json({
        message: `Invalid status transition from ${ticket.status.id} to ${requestedStatus}.`,
      });
    }

    const departmentId = ticket.assignedTo === "" ? "11" : "19";

    let updateData = { statusId: requestedStatus };

    switch (requestedStatus) {
      case "4":
        updateData = { ...updateData, completedAt: new Date(), requestreopen: null, openedBy: usersId };
        break;
      case "3":
        updateData = { ...updateData, completedAt: null, requestreopen: null, openedBy: null };
        break;
      case "2":
        updateData.openedBy = usersId;
        break;
      case "5":
        updateData = { ...updateData, completedAt: null, isSettled: null, assignToTeam: null, openedBy: null, requestreopen: null, departmentId };
        break;
      default:
        break;
    }

    await prisma.createTicket.update({
      where: { ticketId },
      data: updateData,
    });

    const updatedTicket = await prisma.createTicket.findUnique({
      where: { ticketId },
      select: {
        userId: true,
        ntid: true,
        assignedTo: true,
        assignToTeam: true,
        openedBy: true,
        department: { select: { name: true } },
        status: { select: { name: true } },
      },
    });

    let openedByName = "";
    if (updatedTicket.openedBy) {
      const userData = await prisma.user.findUnique({
        where: { id: updatedTicket.openedBy },
        select: { fullname: true },
      });
      openedByName = userData.fullname;
    }

    if (!updatedTicket) {
      return res.status(404).json({ message: "Ticket not found." });
    }

    const ticketComments = await prisma.comment.findMany({
      where: { ticketId },
      select: {
        comment: true,
        commentedfiles: true,
        createdAt: true,
        createdBy: true,
      },
    });

    const commentsWithSignedUrls = await Promise.all(
      ticketComments.map(async (comment) => {
        if (comment.commentedfiles && comment.commentedfiles.length > 0) {
          const signedUrls = await Promise.all(
            comment.commentedfiles.map(async (file) => {
              const getObjectParams = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: file,
              };
              const command = new GetObjectCommand(getObjectParams);
              return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
            })
          );
          return { ...comment, commentedfiles: signedUrls };
        }
        return comment;
      })
    );

  

    const emailBody = `
    <h1 style="font-family: Arial, sans-serif; color: #333;">TECHNO-COMMUNICATIONS LLC</h1>
    <img src="https://ticketing.techno-communications.com/logo.webp" alt="Logo" style="width:150px;height:auto;">
    
    <p style="font-family: Arial, sans-serif; color: #333;">Dear User,</p>
    <p style="font-family: Arial, sans-serif; color: #333;">Your ticket with ID <strong>${ticketId}</strong> has been updated to the status: 
    <strong>${updatedTicket.status?.name || "Unknown"}</strong>.</p>
    <p style="font-family: Arial, sans-serif; color: #333;">currently Now at or completed By: <strong>${openedByName || "Unknown"}</strong></p>
    <p style="font-family: Arial, sans-serif; color: #333;">Current Department: <strong>${updatedTicket.department?.name || "Unknown"}</strong></p>
  
    ${commentsWithSignedUrls.length > 0 
      ? `<h3 style="font-family: Arial, sans-serif; color: #333;">Comments:</h3><ul style="font-family: Arial, sans-serif; color: #333;">${commentsWithSignedUrls.map(comment => `
          <li style="margin-bottom: 15px;">
            <p style="font-family: Arial, sans-serif; color: #333;"><strong>${comment.createdBy || "Unknown"}:</strong> ${comment.comment || "No comment provided"}</p>
            <p style="font-family: Arial, sans-serif; color: #777; font-size: 0.9em;"><em>Posted on: ${new Date(comment.createdAt).toLocaleString()}</em></p>
            
            <!-- Display images -->
            ${comment.commentedfiles && comment.commentedfiles.length > 0
              ? comment.commentedfiles.map((file, index) => `
                <p><img src="${file}" alt="Comment Image ${index + 1}" style="width:100px;height:auto; margin-top: 5px;"></p>
              `).join("") 
              : ""}
            
            <!-- Display documents as links -->
            ${comment.commentedfiles && comment.commentedfiles.length > 0
              ? comment.commentedfiles.map((file, index) => `
                <!-- If file is a document (not an image), show as a link -->
                ${isDocument(file)
                  ? `<p><a href="${file}" target="_blank" style="color: #007BFF; text-decoration: none;">Download Document ${index + 1}</a></p>`
                  : ""}
              `).join("")
              : ""}
          </li>
        `).join("")}</ul>`
      : "<p style='font-family: Arial, sans-serif; color: #333;'>No comments available for this ticket.</p>"
    }
  
    <p style="font-family: Arial, sans-serif; color: #333;">Thank you!</p>
    
    <a href="https://ticketing.techno-communications.com/" style="
      display: inline-block;
      padding: 10px 20px;
      background-color: #007BFF;
      color: white;
      text-decoration: none;
      border-radius: 5px;
      font-family: Arial, sans-serif;
      font-size: 16px;
      text-align: center;
      margin-top: 20px;
    ">Open Ticket</a>
  `;
  
  
  // Helper function to check if a file is a document based on the file extension
  function isDocument(file) {
    const fileExtension = file.split('.').pop().toLowerCase();
    return ['pdf', 'doc', 'docx', 'xls', 'xlsx'].includes(fileExtension);
  }
  
  
 



    if (!updatedTicket.ntid) {
      return res.status(400).json({ message: "Ticket owner email (ntid) is missing." });
    }

    try {
      const emailResponse = await resend.emails.send({
        from: "ticketing@techno-communications.com",
        to: updatedTicket.ntid,
        subject: `Ticket #${ticketId} Updated`,
        html: emailBody,
      });

      console.log("Email response:", emailResponse);
    } catch (emailError) {
      console.error("Error sending email:", emailError.message);
    }

    return res.status(200).json({ message: "Ticket status updated and email sent successfully." });
  } catch (error) {
    console.error("Error updating ticket status:", error.message);
    return res.status(500).json({ message: "Failed to update ticket status." });
  }
};

export default TicketStatus;
