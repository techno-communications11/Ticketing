import prisma from "../lib/prisma.js";

const updateOpenedBy = async (req, res) => {
  const { ticketId,usersId } = req.body; 
  // const userId = req.user.id;

  try {

    // First, check if the ticket has statusId '3'
    const ticket = await prisma.createTicket.findUnique({
      where: { ticketId },
      select: { statusId: true }  // Only fetch the statusId field
    });

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    const updatedTicket = await prisma.createTicket.update({
      where: { ticketId },
      data: {
        openedBy: usersId,  // Update the openedBy field with the user's ID
      },
    });

    console.log("Ticket updated:", updatedTicket);

    res.status(200).json({ message: "Ticket opened successfully", ticket: updatedTicket });
  } catch (error) {
    console.error("Error updating ticket:", error);
    res.status(500).json({ message: "Failed to update the ticket" });
  }
};

export default updateOpenedBy;
