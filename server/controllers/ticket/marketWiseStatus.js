import prisma from "../lib/prisma.js";

const marketWiseStatus = async (req, res) => {
  try {
    const { market } = req.query;

    if (!market) {
      return res.status(400).json({ message: 'Market parameter is required' });
    }

    const formattedMarket = market.trim().toLowerCase();

    const statusCounts = await prisma.createTicket.findMany({
      where: { market: formattedMarket },
      select: {
        status: {
          select: { name: true }  // Assuming 'name' is the field in 'status' model
        }
      }
    });

    console.log(statusCounts, 'sstx');  // Fixed typo in console.log
    
    const statusCountMap = statusCounts.reduce((acc, ticket) => {
      const statusName = ticket.status.name;  // Access 'name' directly
      acc[statusName] = (acc[statusName] || 0) + 1;
      return acc;
    }, {});

    const newObj = {
      ...statusCountMap,
      market: market  
    };

    console.log(newObj, 'data');
    res.status(200).json(newObj);

  } catch (error) {
    console.error('Error fetching market-wise status:', error);  // Log the error for debugging
    res.status(500).json({ message: 'Failed to retrieve data' });
  }
};

export default marketWiseStatus;
