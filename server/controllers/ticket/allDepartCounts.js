import prisma from "../lib/prisma.js";

const allDepartCounts = async (req, res) => {
  try {
    console.log("Fetching ticket counts by department and status");

    // Aggregate ticket counts by department and status directly in the database
    const counts = await prisma.createTicket.groupBy({
      by: ['departmentId', 'statusId'], // Group by department and status
      _count: {
        ticketId: true, // Count the number of tickets
      }
    });

    // Fetch department and status names in separate queries
    const departmentNames = await prisma.department.findMany({
      select: {
        id: true,
        name: true,
      }
    });

    const statusNames = await prisma.status.findMany({
      select: {
        id: true,
        name: true,
      }
    });

    // Map department and status IDs to names
    const departmentMap = departmentNames.reduce((acc, dept) => {
      acc[dept.id] = dept.name;
      return acc;
    }, {});

    const statusMap = statusNames.reduce((acc, status) => {
      acc[status.id] = status.name;
      return acc;
    }, {});

    // Format counts into the desired structure
    const result = {};

    counts.forEach(item => {
      const departmentName = departmentMap[item.departmentId];
      const statusName = statusMap[item.statusId];

      // Skip if no department or status name
      if (!departmentName || !statusName) return;

      // Initialize department entry if it doesn't exist
      if (!result[departmentName]) {
        result[departmentName] = {
          total: 0,
          new: 0,
          opened: 0,
          inProgress: 0,
          completed: 0,
          reopened: 0,
        };
      }

      // Increment the counts for the corresponding status
      result[departmentName].total += item._count.ticketId;
      if (statusName === 'new') result[departmentName].new += item._count.ticketId;
      else if (statusName === 'opened') result[departmentName].opened += item._count.ticketId;
      else if (statusName === 'inprogress') result[departmentName].inProgress += item._count.ticketId;
      else if (statusName === 'completed') result[departmentName].completed += item._count.ticketId;
      else if (statusName === 'reopened') result[departmentName].reopened += item._count.ticketId;
    });

    console.log("Ticket Counts by Department and Status:", result);

    // Return the counts as a response
    res.json(result);

  } catch (error) {
    console.error("Error fetching ticket counts:", error);
    res.status(500).json({ error: 'Failed to fetch ticket counts' });
  }
};

export default allDepartCounts;
