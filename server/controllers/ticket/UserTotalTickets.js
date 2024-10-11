import prisma from '../lib/prisma.js';

const getUserTickets = async (req, res) => {
  try {
    const { ntid } = req.query;
    console.log(ntid);
    if (!ntid) {
      return res.status(400).json({ message: 'NTID parameter is required' });
    }

    const tickets = await prisma.createTicket.findMany({
      where: {
        ntid: ntid
      },
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
      return res.status(404).json({ message: 'No tickets found for this NTID' });
    }

    res.status(200).json(tickets);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ message: 'Failed to retrieve tickets' });
  }
};

export default getUserTickets;
