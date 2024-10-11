import prisma from "../lib/prisma.js";

export const fetchAllTickets = async (req, res) => {
  console.log("Fetching all tickets");

  try {
    // Fetch all tickets from the database
    const tickets = await prisma.createTicket.findMany({
      select: {
        ticketId: true,
        ntid: true,
        fullname: true,
        market: true,
        selectStore: true,
        phoneNumber: true,
        ticketRegarding: true,
        description: true,
        createdAt: true,
        completedAt:true,
        status:{select:{name:true}},
        assignedTo:true,
      },
    });

    // Check if any tickets were found
    if (!tickets || tickets.length === 0) {
      return res.status(404).json({ message: 'No tickets found' });
    }

    console.log(`Found ${tickets.length} tickets`);
    return res.status(200).json(tickets);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
