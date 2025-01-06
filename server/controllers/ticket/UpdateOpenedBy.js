  import prisma from "../lib/prisma.js";

  const updateOpenedBy = async (req, res) => {
    const { ticketId, usersId } = req.body;

    try {
      // Fetch the ticket to check the current status and openedBy field
      const ticket = await prisma.createTicket.findUnique({
        where: { ticketId },
        select: { openedBy: true, statusId: true }, // Fetch `openedBy` and `statusId`
      });

      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }

      // Check if `openedBy` is already set or if the status is inappropriate (e.g., closed)
      if (ticket.openedBy) {
        return res.status(400).json({ message: "Ticket is already opened" });
      }

      // You can also check the ticket status to ensure it's openable
      if (ticket.statusId === 'closed') { // Assuming 'closed' status is represented as 'closed'
        return res.status(400).json({ message: "Cannot open a closed ticket" });
      }

      // Proceed to update if `openedBy` is null and ticket is not closed
      const updatedTicket = await prisma.createTicket.update({
        where: { ticketId },
        data: {
          openedBy: usersId, // Update the `openedBy` field with the user's ID
        },
      });

      console.log("Ticket updated:", updatedTicket);

      // Return the updated ticket and success message
      res.status(200).json({
        message: "Ticket opened successfully",
        ticket: updatedTicket,
      });
    } catch (error) {
      console.error("Error updating ticket:", error.message);
      res.status(500).json({ message: "Failed to update the ticket" });
    }
  };

  export default updateOpenedBy;
