import prisma from "../lib/prisma.js";

export const marketAndStatus = async (req, res) => {
  const { id, market, statusId } = req.query;

  console.log("Received query parameters:", { id, market, statusId });

  // Step 1: Validate query parameters
  if ((!id && !market) || !statusId) {
    return res.status(400).json({ error: 'Either "id" or both "market" and "statusId" are required' });
  }

  try {
    let tickets;

    // Step 2: Handle different cases based on query parameters
    if (id && statusId) {
      // Fetch tickets for a specific user and statusId
      const user = await prisma.user.findUnique({
        where: { id },
        select: { fullname: true },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      console.log(`Fetching tickets for user: ${user.fullname} with status: ${statusId}`);

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
          isSettled: true,
          openedBy: true,
          completedAt: true,
          status: { select: { name: true } },
          files: true,
        },
      });
      console.log(`Found ${tickets.length} tickets for ${user.fullname} with status ${statusId}`);
    } else if (market) {
      // Fetch tickets for a specific market and statusId (if provided)
      console.log(`Fetching tickets for market: ${market} with status: ${statusId}`);

      // Case for fetching tickets by market and all statuses (if statusId is '0')
      if (statusId === '0') {
        tickets = await prisma.createTicket.findMany({
          where: { market },
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
            openedBy: true,
            completedAt: true,
            status: { select: { name: true } },
            files: true,
          },
        });
        console.log(`Found ${tickets.length} tickets for market: ${market} with all statuses`);
      } else {
        // Fetch tickets for a specific market and statusId
        tickets = await prisma.createTicket.findMany({
          where: {
            market,
            statusId,
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
            openedBy: true,
            completedAt: true,
            status: { select: { name: true } },
            files: true,
          },
        });
        console.log(`Found ${tickets.length} tickets for market: ${market} and status: ${statusId}`);
      }
    }

    // Step 3: Return tickets or handle case where no tickets are found
    if (!tickets || tickets.length === 0) {
      return res.status(404).json({ message: 'No tickets found' });
    }

    return res.status(200).json(tickets);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
