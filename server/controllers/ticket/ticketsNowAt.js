import prisma from "../lib/prisma.js";

const TicketsNowAt = async (req, res) => {
  try {
    // Fetch tickets with basic ticket information, including the openedById
    const tickets = await prisma.createTicket.findMany({
      select: {
        ticketId: true, 
        status: {
          select: {
            name: true, // Status name
          },
        },
        openedBy: true, // Fetch only the openedBy (which is a string ID)
        createdAt: true, 
        completedAt: true, 
      },
    });

    // Fetch the full name of the users who opened the tickets using openedBy
    const ticketsWithUser = await Promise.all(
      tickets.map(async (ticket) => {
        if (ticket.openedBy) { // Only attempt to fetch user if openedBy is not null
          const openedByUser = await prisma.user.findUnique({
            where: { id: ticket.openedBy }, // Use openedBy to fetch the user
            select: { fullname: true },
          });

          return {
            ...ticket,
            openedBy: openedByUser ? openedByUser.fullname : "Not Opened", // Add the fullname to the ticket
          };
        } else {
          return {
            ...ticket,
            openedBy: "Not Opened", // If openedBy is null, set to "Unknown"
          };
        }
      })
    );

    console.log(ticketsWithUser, 'Tickets with User');

    if (ticketsWithUser.length === 0) {
      return res.status(404).json({ message: "No tickets found." });
    }

    return res.status(200).json(ticketsWithUser);
  } catch (error) {
    console.error("Error fetching tickets:", error.message);
    return res.status(500).json({ message: "Failed to fetch tickets." });
  }
};

export default TicketsNowAt;
