import prisma from '../lib/prisma.js';

const getUserTickets = async (req, res) => {
  try {
    const { ntid, statusId } = req.query;

    // Ensure only one of ntid or statusId is provided
    if ((!ntid && !statusId) || (ntid && statusId)) {
      return res.status(400).json({ message: 'Provide either NTID or Status ID, but not both' });
    }

    // Build filter condition
    const filter = ntid
      ? { ntid: ntid }
      : statusId === '0'
      ? { statusId: { in: ['1', '2', '3', '4', '5'] } }
      : { statusId: statusId };

    const tickets = await prisma.createTicket.findMany({
      where: filter,
      select: {
        ntid: true,
        fullname: true,
        createdAt: true,
        completedAt: true,
        ticketId: true,
        status: {
          select: {
            name: true,
          }
        }
      }
    });

    if (tickets.length === 0) {
      return res.status(404).json({ message: 'No tickets found for the provided parameter' });
    }

    res.status(200).json(tickets);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ message: 'Failed to retrieve tickets' });
  }
};

export default getUserTickets;
