import prisma from '../lib/prisma.js';

const getUserTickets = async (req, res) => {
  try {
    const { ntid, statusId } = req.query;
    console.log('Received NTID dwmw dj :', ntid, 'Received Status IDnknknfk jdxgw:', statusId);

    // Build filter condition
    const filter = {
      
      ...(ntid ? { ntid: ntid } : {}),
      ...(statusId === '0' 
        ? { statusId: { in: ['1', '2', '3', '4', '5'] } } 
        : { statusId: statusId }
      )
    };

    // Fetch tickets based on the filter
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

    console.log('Fetched Tickets:', tickets);

    if (tickets.length === 0) {
      return res.status(404).json({ message: 'No tickets found for the provided parameters' });
    }

    res.status(200).json(tickets);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ message: 'Failed to retrieve tickets' });
  }
};

export default getUserTickets;
