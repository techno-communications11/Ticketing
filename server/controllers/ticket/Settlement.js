import prisma from "../lib/prisma.js";

const Settlement = async (req, res) => {
  const { ticketId } = req.body;

  // Check if ticketId is provided
  if (!ticketId) {
    return res.status(400).json({ error: "ticketId is required" });
  }

  try {
    // Attempt to update the ticket's settlement status directly
    const updatedTicket = await prisma.createTicket.update({
      where: { ticketId: ticketId },
      data: { isSettled: true },
    });

    // Return the updated ticket after successful update
    return res.status(200).json(updatedTicket);
  } catch (error) {
    // Handle the case where the ticket doesn't exist (RecordNotFoundError)
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Ticket not found" });
    }

    // General error handling
    console.error("Error settling ticket:", error);
    return res.status(500).json({ error: "Failed to settle ticket" });
  }
};

export default Settlement;
