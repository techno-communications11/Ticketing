import prisma from "../lib/prisma.js";

const requestReopenTicket = async (req, res) => {
  const { ticketId } = req.body; // Use req.body to get the ticketId

  // Check if ticketId is provided
  if (!ticketId) {
    return res.status(400).json({ error: "ticketId is required" });
  }

  try {
    // Check if ticket exists before attempting to update
    const ticketExists = await prisma.createTicket.findUnique({
      where: { ticketId: ticketId }
    });

    if (!ticketExists) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    // Update the ticket's requestReopen status
    const updatedTicket = await prisma.createTicket.update({
      where: { ticketId: ticketId },
      data: { requestreopen: true }
    });

    // Send back the updated ticket
    return res.status(200).json(updatedTicket);
  } catch (error) {
    console.error("Error requesting to reopen ticket:", error);
    return res.status(500).json({ error: "Failed to request reopen ticket" });
  }
};

export default requestReopenTicket;
