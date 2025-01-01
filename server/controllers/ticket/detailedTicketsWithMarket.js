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

    // Collect user IDs for all tickets with openedBy field populated
    const openedByUserIds = details
      .filter(ticket => ticket.openedBy)
      .map(ticket => ticket.openedBy);

    // Fetch all users once for performance optimization
    const users = await prisma.user.findMany({
      where: { id: { in: openedByUserIds } },
      select: { id: true, fullname: true }
    });

    // Create a lookup map for users by their IDs
    const userMap = users.reduce((map, user) => {
      map[user.id] = user.fullname;
      return map;
    }, {});

    // Enrich ticket details with openedByFullName
    const enrichedDetails = details.map(ticket => ({
      ...ticket,
      openedByFullName: userMap[ticket.openedBy] || null
    }));

    res.status(200).json(enrichedDetails);
  } catch (error) {
    console.error('Error fetching detailed tickets:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export default detailedTicketsWithMarket;
