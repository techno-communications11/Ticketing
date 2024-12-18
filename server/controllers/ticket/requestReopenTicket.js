import prisma from "../lib/prisma.js";

const requestReopenTicket = async (req, res) => {
  const { ticketId } = req.body; // Use req.body to get the ticketId

  try {
    // Update the ticket's requestReopen status
    const updatedTicket = await prisma.createTicket.update({
      where: { ticketId: ticketId },
      data: { requestreopen: true } 
    });
 console.log(updatedTicket)
    // Send back the updated ticket
    return res.status(200).json(updatedTicket);
  } catch (error) {
    console.error("Error requesting to reopen ticket:", error);
    return res.status(500).json({ error: "Failed to request reopen ticket" });
  }
};

export default requestReopenTicket;
