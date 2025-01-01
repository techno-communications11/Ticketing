import prisma from "../lib/prisma.js";

const Settlement = async (req, res) => {
  const { ticketId } = req.body; 
  console.log(ticketId, "yyyyyyyyyyy");

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

    // Update the ticket's settlement status
    const updatedTicket = await prisma.createTicket.update({
      where: { ticketId: ticketId },
      data: { isSettled: true }
    });

    console.log(updatedTicket);
    return res.status(200).json(updatedTicket);
  } catch (error) {
    console.error("Error settling ticket:", error);
    return res.status(500).json({ error: "Failed to settle ticket" });
  }
};

export default Settlement;
