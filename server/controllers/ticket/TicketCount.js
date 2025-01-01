import prisma from "../lib/prisma.js";

const TicketCount = async (req, res) => {
  try {
    // Fetch ticket counts grouped by statusId
    const [counts, statuses] = await Promise.all([
      prisma.createTicket.groupBy({
        by: ['statusId'],
        _count: {
          statusId: true,
        },
      }),
      prisma.status.findMany({
        select: {
          id: true,
          name: true,
        },
      }),
    ]);

    // Create a formatted response with status names and counts
    const formattedCounts = statuses.map(status => ({
      status: status.name,
      count: counts.find(count => count.statusId === status.id)?._count.statusId || 0,
    }));

    console.log(formattedCounts); // Optionally log the formatted counts

    // Send the response to the client
    res.status(200).json(formattedCounts);
  } catch (error) {
    console.error('Error fetching ticket counts:', error);
    res.status(500).json({ message: 'Failed to retrieve ticket count data' });
  } finally {
    // Disconnect Prisma connection if needed (for serverless environments)
    // await prisma.$disconnect();
  }
};

export default TicketCount;
