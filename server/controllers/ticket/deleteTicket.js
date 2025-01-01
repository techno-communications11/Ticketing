import prisma from "../lib/prisma.js";

const deleteTicket = async (req, res) => {
  const { ticketId } = req.params;  // Use 'params' to get ticketId from URL

  console.log(ticketId, "delete ticket");

  if (!ticketId) {
    return res.status(400).send('Ticket ID is required');
  }

  try {
    // Check if the ticket exists before attempting to delete
    const ticket = await prisma.createTicket.findUnique({
      where: { ticketId: ticketId },
    });

    if (!ticket) {
      return res.status(404).send('Ticket not found');
    }

    // Correct Prisma query to delete the ticket by ticketId
    const deletedTicket = await prisma.createTicket.delete({
      where: { ticketId: ticketId },  // Assuming 'ticketId' is the correct field name
    });

    console.log(deletedTicket, "Ticket deleted");

    // Respond with success message and deleted ticket data
    return res.status(200).json({ message: 'Ticket deleted successfully', ticket: deletedTicket });
  } catch (error) {
    console.error('Error deleting ticket:', error);
    return res.status(500).send('Failed to delete ticket');
  }
};

export default deleteTicket;
