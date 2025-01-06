import prisma from "../lib/prisma.js";

const requestReopenTicket = async (req, res) => {
  const { ticketId } = req.body; // Get ticketId from the request body

  // Check if ticketId is provided
  if (!ticketId) {
    return res.status(400).json({ error: "ticketId is required" });
  }

  try {
    // Attempt to update the ticket and handle the case where the ticket doesn't exist
    const updatedTicket = await prisma.createTicket.update({
      where: { ticketId: ticketId },
      data: { requestreopen: true },
    });

    // Return the updated ticket after successful update
    return res.status(200).json(updatedTicket);
  } catch (error) {
    // Handle the case where the ticket doesn't exist (RecordNotFoundError)
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Ticket not found" });
    }

    // General error handling
    console.error("Error requesting to reopen ticket:", error);
    return res.status(500).json({ error: "Failed to request reopen ticket" });
  }
};

export default requestReopenTicket;
