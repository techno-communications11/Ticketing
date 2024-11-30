import prisma from "../lib/prisma.js";

const Settlement = async (req, res) => {
  const { ticketId } = req.body; 
  // console.log(ticketId, "yyyyyyyyyyy");

  try {
    const updatedTicket = await prisma.createTicket.update({
      where: { ticketId: ticketId },
      data: { isSettled: true } 
    });
    // console.log(updatedTicket)
    return res.status(200).json(updatedTicket);
  } catch (error) {
    console.error("Error requesting to reopen ticket:", error);
    return res.status(500).json({ error: "Failed to request reopen ticket" });
  }
};

export default Settlement;
