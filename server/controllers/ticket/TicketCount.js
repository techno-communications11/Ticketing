import prisma from "../lib/prisma.js";
const TicketCount = async (req, res) => {
  // console.log("Ticket counting");
  try {
    // Fetch ticket counts grouped by statusId
    const counts = await prisma.createTicket.groupBy({
      by: ['statusId'],
      _count: {
        statusId: true,
      },
    });

    // Fetch all statuses
    const statuses = await prisma.status.findMany({
      select: {
        id: true,
        name: true,
      },
    });

   

    // Create a formatted response with status names and counts
    const formattedCounts = statuses.map(status => ({
      status: status.name,
      count: counts.find(count => count.statusId === status.id)?._count.statusId || 0,
    }));

    console.log(formattedCounts);

    // Send the response to the client
    res.status(200).json(formattedCounts);
  } catch (error) {
    console.error('Error fetching ticket counts:', error);
    res.status(500).json({ message: 'Failed to retrieve data' });
  } finally {
    await prisma.$disconnect();
  }
};

export default TicketCount;
