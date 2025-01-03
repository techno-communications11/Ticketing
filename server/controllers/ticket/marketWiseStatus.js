import prisma from "../lib/prisma.js";

const marketWiseStatus = async (req, res) => {
  try {
    const { market, startDate, endDate } = req.query;

    if (!market) {
      return res.status(400).json({ message: 'Market parameter is required' });
    }

    const formattedMarket = market.trim().toLowerCase();

    // Fetch tickets from database
    const statusCounts = await prisma.createTicket.findMany({
      where: { market: formattedMarket },
      select: {
        status: {
          select: { name: true }  // Assuming 'name' is the field in 'status' model
        },
        createdAt: true
      }
    });

    // Filter tickets based on the date range if both startDate and endDate are provided
    const ticketsFiltered = statusCounts.filter((ticket) => {
      const ticketDate = new Date(ticket.createdAt).toISOString().slice(0, 10);  // Format createdAt to YYYY-MM-DD
      if (startDate && endDate) {
        return ticketDate >= startDate && ticketDate <= endDate;
      } else {
        return true;  // No date filter applied
      }
    });
    console.log(ticketsFiltered,"tcfs")

    // Count the status occurrences
    const statusCountMap = ticketsFiltered.reduce((acc, ticket) => {
      const statusName = ticket.status.name;  // Access 'name' directly
      acc[statusName] = (acc[statusName] || 0) + 1;
      return acc;
    }, {});

    // Return the final response
    const result = {
      ...statusCountMap,
      market: formattedMarket  
    };

    // console.log(result, 'data');
    res.status(200).json(result);

  } catch (error) {
    console.error('Error fetching market-wise status:', error);
    res.status(500).json({ message: 'Failed to retrieve data' });
  }
};

export default marketWiseStatus;
