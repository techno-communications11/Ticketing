import prisma from "../lib/prisma.js";

const GetMarketTickets = async (req, res) => {
  const { ntid } = req.query; // Get NTID from query parameters
  
  // Check if NTID is provided
  if (!ntid) {
    return res.status(400).json({ error: 'NTID is required' }); // Return 400 if NTID is missing
  }

  try {
    // Fetch the doorCode for the user based on NTID
    const doorCodeRecord = await prisma.user.findUnique({
      where: { ntid },
      select: { DoorCode: true },
    });

    // Check if doorCode was found
    if (!doorCodeRecord || !doorCodeRecord.DoorCode) {
      return res.status(404).json({ error: 'Door code not found for the given NTID' }); // Return 404 if user not found
    }

    const doorCode = doorCodeRecord.DoorCode; // Extract doorCode

    // Fetch the market structure based on doorCode
    const marketRecord = await prisma.marketStructure.findUnique({
      where: { doorCode },
      include: {
        market: { // Include the related market record
          select: { market: true },
        },
      },
    });

    // Check if the market record was found
    if (!marketRecord || !marketRecord.market) {
      return res.status(404).json({ error: 'Market not found for the given doorCode' });
    }

    const market = marketRecord.market; // Extract the market

    // Fetch tickets based on the market name
    const tickets = await prisma.createTicket.findMany({
      where: { market: market.market },
      select: {
        ticketId: true,
        ntid: true,
        fullname: true,
        status: {
          select: { name: true },
        },
        market: true,
        createdAt: true,
        completedAt: true,
      },
    });

    // Return the fetched tickets
    return res.status(200).json(tickets);

  } catch (error) {
    console.error('Error fetching market tickets:', error); // Log any server error for debugging
    return res.status(500).json({ error: 'Internal server error while fetching tickets' });
  }
};

export default GetMarketTickets;
