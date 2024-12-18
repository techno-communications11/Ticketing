import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TicketCount = async (req, res) => {
  console.log("Ticket counting")
  try {
    // Fetch ticket counts grouped by statusId
    const counts = await prisma.createTicket.groupBy({
      by: ['statusId'],
      _count: {
        statusId: true,
      },
    });
    console.log(counts);

    // Fetch all statuses (so we can map them)
    const statuses = await prisma.status.findMany({
      select: {
        id: true,
        name: true,
      },
    });
    console.log(statuses);

    // Map statusId to status name
    const statusMap = {};
    statuses.forEach((status) => {
      statusMap[status.id] = status.name;
    });

    // Create a formatted response with status names and counts
    const formattedCounts = statuses.map((status) => {
      const foundCount = counts.find((count) => count.statusId === status.id);
      const countValue = foundCount ? foundCount._count.statusId : 0; // Handle missing status
      return {
        status: status.name,
        count: countValue,
      };
    });

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
