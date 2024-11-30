import prisma from "../lib/prisma.js";

export const marketAndStatus = async (req, res) => {
  const { id, market, statusId } = req.query;
  // console.log(market,"mmmmmm",statusId,"stiii",id,"idddd")
  // console.log(id, market, statusId, "Received query parameters");

  if ((!id || !market) && !statusId) {
    return res.status(400).json({ error: 'Either id or market and status are required' });
  }

  try {
    let tickets;

    // If id and status are provided, fetch by user id and fullname
    if (id && statusId) {
      const user = await prisma.user.findUnique({
        where: { id },
        select: { fullname: true },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // console.log(`User found: ${user.fullname}, Fetching tickets with status: ${statusId}`);

      // Fetch tickets based on the user and statusId
      tickets = await prisma.createTicket.findMany({
        where: {
          assignedTo: user.fullname,
          statusId: statusId,
        },
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
          isSettled:true,
          completedAt: true,
          status: { select: { name: true } },
          files: true,
        },
      });

      // console.log(`Found ${tickets.length} tickets for user ${user.fullname} with status ${statusId}`);
    } else if (market) {
      // console.log(`Fetching tickets for market: ${market} with status: ${statusId}`);

      if (statusId === '0'&& market) {
        tickets = await prisma.createTicket.findMany({
          where: {
            market:market,
          },
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
            completedAt: true,
            
            status: { select: { name: true } },
            files: true,
          },
        });

        // console.log(`Found ${tickets.length} tickets for market: ${market} with all statuses`);
      } else {
        // Fetch tickets for the specified market and statusId
        tickets = await prisma.createTicket.findMany({
          where: {
            market: market,
            statusId: statusId,
          },
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
            completedAt: true,
            status: { select: { name: true } },
            files: true,
          },
        });

        // console.log(`Found ${tickets.length} tickets for market: ${market} and status: ${statusId}`);
      }
    }

    if (!tickets || tickets.length === 0) {
      return res.status(404).json({ message: 'No tickets found' });
    }

    console.log(tickets,"tickets");
    return res.status(200).json(tickets);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
