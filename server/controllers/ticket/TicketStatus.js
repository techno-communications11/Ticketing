import prisma from "../lib/prisma.js";
import { Resend } from "resend";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const resend = new Resend(process.env.RESEND_API_KEY);
const s3Client = new S3Client({ region: "eu-north-1" });

const validTransitions = {
  "1": ["2"],
  "2": ["3", "4"],
  "3": ["4"],
  "4": ["5"],
  "5": ["3", "4", "1"],
};

const TicketStatus = async (req, res) => {
  const { statusId, ticketId, usersId } = req.query;

  if (!statusId || !ticketId || !usersId) {
    return res.status(400).json({
      message: "Status ID, ticket ID, and user ID are required.",
    });
  }

  try {
    // Fetch the ticket and user info in one query
    const ticket = await prisma.createTicket.findUnique({
      where: { ticketId },
      select: {
        userId: true,
        ntid: true,
        status: { select: { id: true, name: true } },
        assignedTo: true,
        department: { select: { id: true, name: true } },
        openedBy: true,
      },
    });

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found." });
    }

    const currentStatus = String(ticket.status.id);
    const requestedStatus = String(statusId);

    if (!validTransitions[currentStatus]?.includes(requestedStatus)) {
      return res.status(400).json({
        message: `Invalid status transition from ${currentStatus} to ${requestedStatus}.`,
      });
    }

    const departmentId = ticket.assignedTo ? "19" : ticket.department.id;
    const updateData = {
      statusId: requestedStatus,
      ...(requestedStatus === "4" && { completedAt: new Date(), requestreopen: null, openedBy: usersId }),
      ...(requestedStatus === "3" && { completedAt: null, requestreopen: null, openedBy: null }),
      ...(requestedStatus === "2" && { openedBy: usersId }),
      ...(requestedStatus === "5" && {
        completedAt: null,
        isSettled: null,
        assignToTeam: null,
        openedBy: null,
        requestreopen: null,
        departmentId,
      }),
    };

    // Update ticket status
    await prisma.createTicket.update({
      where: { ticketId },
      data: updateData,
    });

    // Fetch updated ticket with the comments and user details in parallel
    const [updatedTicket, ticketComments] = await Promise.all([
      prisma.createTicket.findUnique({
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
      }),
      prisma.comment.findMany({
        where: { ticketId },
        select: {
          comment: true,
          commentedfiles: true,
          createdAt: true,
          createdBy: true,
        },
      }),
    ]);

    if (!updatedTicket.ntid) {
      return res.status(400).json({ message: "Ticket owner email (ntid) is missing." });
    }

    let openedByName = "";
    if (updatedTicket.openedBy) {
      const user = await prisma.user.findUnique({
        where: { id: updatedTicket.openedBy },
        select: { fullname: true },
      });
      openedByName = user?.fullname || "Unknown";
    }

    // Parallelize fetching signed URLs for the commented files
    const commentsWithSignedUrls = await Promise.all(
      ticketComments.map(async (comment) => {
        if (comment.commentedfiles?.length > 0) {
          const signedUrls = await Promise.all(
            comment.commentedfiles.map((file) => {
              const command = new GetObjectCommand({
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: file,
              });
              return getSignedUrl(s3Client, command, { expiresIn: 3600 });
            })
          );
          return { ...comment, commentedfiles: signedUrls };
        }
        return comment;
      })
    );

    const emailBody = `
      <h1 style="font-family: Arial, sans-serif; color: #333;">TECHNO-COMMUNICATIONS LLC</h1>
      <img src="https://ticketing.techno-communications.com/logoT.webp" alt="Logo" style="width:150px;height:auto;">
      <p>Dear User,</p>
      <p>Your ticket with ID <strong>${ticketId}</strong> has been updated to the status: <strong>${updatedTicket.status?.name || "Unknown"}</strong>.</p>
      <p>Currently handled by: <strong>${openedByName}</strong></p>
      <p>Department: <strong>${updatedTicket.department?.name || "Unknown"}</strong></p>
      ${commentsWithSignedUrls.length > 0 ? `<h3>Comments:</h3><ul>${commentsWithSignedUrls.map((c) => `<li>${c.comment}</li>`).join("")}</ul>` : "<p>No comments available.</p>"}
      <p>Thank you!</p>
      <a href="https://ticketing.techno-communications.com/" style="padding:10px 20px;background-color:#007BFF;color:white;border-radius:5px;text-decoration:none;">Open Ticket</a>
    `;

    try {
      await resend.emails.send({
        from: "ticketing@techno-communications.com",
        to: updatedTicket.ntid,
        subject: `Ticket #${ticketId} Updated`,
        html: emailBody,
      });
    } catch (emailError) {
      console.error("Error sending email:", emailError.message);
    }

    return res.status(200).json({
      message: "Ticket status updated and email sent successfully.",
    });
  } catch (error) {
    console.error("Error updating ticket status:", error.message);
    return res.status(500).json({ message: "Failed to update ticket status." });
  }
};

export default TicketStatus;
