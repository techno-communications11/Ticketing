import prisma from "../lib/prisma.js";

const requestReopenTicket = async (req, res) => {
  const { ticketId } = req.body; // Use req.body to get the ticketId
  console.log(ticketId, "yyyyyyyyyyy");

  try {
    // Update the ticket's requestReopen status
    const updatedTicket = await prisma.createTicket.update({
      where: { ticketId: ticketId },
      data: { requestreopen: true } // Ensure the field name matches your model
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
