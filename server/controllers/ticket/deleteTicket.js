import prisma from "../lib/prisma.js";

const deleteTicket = async (req, res) => {
  const { ticketId } = req.params;  // Use 'params' to get ticketId from URL

  // console.log(ticketId, "delete ticket");

  if (!ticketId) {
    return res.status(400).send('Ticket ID is required');
  }

  try {
    // Attempt to delete the ticket directly
    const deletedTicket = await prisma.createTicket.delete({
      where: { ticketId: ticketId },
    });

    // console.log(deletedTicket, "Ticket deleted");

    // Respond with success message and deleted ticket data
    return res.status(200).json({ message: 'Ticket deleted successfully', ticket: deletedTicket });
  } catch (error) {
    // Handle case where ticket does not exist (Prisma will throw a P2025 error)
    if (error.code === "P2025") {
      return res.status(404).send('Ticket not found');
    }

    // General error handling
    console.error('Error deleting ticket:', error);
    return res.status(500).send('Failed to delete ticket');
  }
};

export default deleteTicket;
