import prisma from "../lib/prisma.js";

const TicketsNowAt = async (req, res) => {
  try {
    // Fetch tickets with basic ticket information
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

    // If no tickets are found, return early
    if (tickets.length === 0) {
      return res.status(404).json({ message: "No tickets found." });
    }

    // Fetch all users associated with the openedBy field in a single query
    const openedByUsers = await prisma.user.findMany({
      where: {
        id: {
          in: tickets.map(ticket => ticket.openedBy).filter(id => id), // Only fetch users that have an openedBy ID
        },
      },
      select: {
        id: true,
        fullname: true,
      },
    });

    // Create a map of user IDs to full names
    const userMap = openedByUsers.reduce((acc, user) => {
      acc[user.id] = user.fullname;
      return acc;
    }, {});

    // Map over the tickets and add the fullname of the user who opened the ticket
    const ticketsWithUser = tickets.map(ticket => ({
      ...ticket,
      openedBy: ticket.openedBy ? userMap[ticket.openedBy] || "Unknown User" : "Not Opened",
    }));

    console.log(ticketsWithUser, 'Tickets with User');

    return res.status(200).json(ticketsWithUser);
  } catch (error) {
    console.error("Error fetching tickets:", error.message);
    return res.status(500).json({ message: "Failed to fetch tickets." });
  }
};

export default TicketsNowAt;
