import prisma from '../lib/prisma.js';

const getUserTickets = async (req, res) => {
  try {
    const { ntid, statusId } = req.query;

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
        openedBy: true,
        ticketId: true,
        isSettled:true,
        status: {
          select: {
            name: true,
          }
        }
      }
    });

    if (tickets.length === 0) {
      return res.status(404).json({ message: 'No tickets found for the provided parameters' });
    }

    // Fetch full names for users who opened tickets
    const ticketsWithOpeners = await Promise.all(
      tickets.map(async (ticket) => {
        if (ticket.openedBy) {
          const NcUser = await prisma.user.findUnique({
            where: { id: ticket.openedBy },
            select: { fullname: true }
          });
          // console.log(NcUser,"ggggggggggggggggggggggggg")
          return {
            ...ticket,
            openedByFullName: NcUser?.fullname || null,
          };
        }
        
        return { ...ticket, openedByFullName: "-" };
      })
    );
    console.log(ticketsWithOpeners,'lllllllllllll')

    res.status(200).json(ticketsWithOpeners);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ message: 'Failed to retrieve tickets' });
  }
};

export default getUserTickets;
