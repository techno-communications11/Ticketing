import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const detailedTicketsWithMarket = async (req, res) => {
  const { market } = req.query; 
  if (!market) {
    return res.status(400).json({ error: 'Market parameter is required' });
  }

  try {
    // Fetch tickets from the given market
    const details = await prisma.createTicket.findMany({
      where: { market },
      select: {
        ticketId: true,
        ntid: true,
        fullname: true,
        openedBy: true, // Include userId to fetch the creator's name
        status: {
          select: { name: true },
        },
        createdAt: true,
        completedAt: true,
      },
    });

    // Fetch the user details for each ticket if userId exists
    const enrichedDetails = await Promise.all(
      details.map(async (ticket) => {
        if (ticket.openedBy) {
          const userDetails = await prisma.user.findUnique({
            where: { id: ticket.openedBy },
            select: { fullname: true },
          });
          return {
            ...ticket,
            openedByFullName: userDetails?.fullname || null,
          };
        }
        return { ...ticket, openedByFullName: null };
      })
    );

    res.status(200).json(enrichedDetails);
  } catch (error) {
    console.error('Error fetching detailed tickets:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export default detailedTicketsWithMarket;
