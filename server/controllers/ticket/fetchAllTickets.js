import prisma from "../lib/prisma.js";

export const fetchAllTickets = async (req, res) => {
  try {
    // Fetch all tickets from the database with pagination (optional)
    const { page = 1, limit = 50 } = req.query; // Set default page and limit

    const tickets = await prisma.createTicket.findMany({
      skip: (page - 1) * limit, // Pagination skip
      take: limit,              // Pagination limit
      select: {
        ticketId: true,
        ntid: true,
        fullname: true,
        market: true,
        selectStore: true,     // Ensure this is correctly set up in Prisma schema
        phoneNumber: true,
        ticketRegarding: true,
        description: true,
        createdAt: true,
        completedAt: true,
        status: { select: { name: true } },
        assignedTo: true,
      },
    });

    // Check if any tickets were found
    if (!tickets || tickets.length === 0) {
      return res.status(404).json({ message: 'No tickets found' });
    }

    console.log(`Found ${tickets.length} tickets`);
    return res.status(200).json(tickets);
  } catch (error) {
    console.error('Error fetching tickets:', error.message, error.stack);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};
