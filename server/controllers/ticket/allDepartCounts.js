import prisma from "../lib/prisma.js";

const allDepartCounts = async (req, res) => {
  const { startDate, endDate } = req.query;

  try {
    console.log("Fetching ticket counts by department and status");

    // Fetch all tickets
    const tickets = await prisma.createTicket.findMany({
      select: {
        ticketId: true,
        departmentId: true,
        statusId: true,
        createdAt: true,
      },
    });

    // Filter tickets based on the date range (using slice(0, 10) to get the date part)
    const filteredTickets = tickets.filter(ticket => {
      const ticketDate = ticket.createdAt.toISOString().slice(0, 10); // Extract the date part (YYYY-MM-DD)
      // Apply the date range filter if provided
      if (startDate && endDate) {
        return ticketDate >= startDate && ticketDate <= endDate;
      }else {
        return ticket
      }
    });
    console.log(filteredTickets,"ffilfkflk")

    // Aggregate ticket counts by department and status
    const counts = filteredTickets.reduce((acc, ticket) => {
      const departmentId = ticket.departmentId;
      const statusId = ticket.statusId;

      // Initialize department if not yet created
      if (!acc[departmentId]) {
        acc[departmentId] = {
          total: 0,
          new: 0,
          opened: 0,
          inProgress: 0,
          completed: 0,
          reopened: 0,
        };
      }

      // Increment total ticket count
      acc[departmentId].total += 1;

      // Fetch the status name and update the count for that status
      if (statusId === '1') acc[departmentId].new += 1;
      else if (statusId === '2') acc[departmentId].opened += 1;
      else if (statusId === '3') acc[departmentId].inProgress += 1;
      else if (statusId === '4') acc[departmentId].completed += 1;
      else if (statusId === '5') acc[departmentId].reopened += 1;

      return acc;
    }, {});

    // Fetch department and status names in separate queries
    const departmentNames = await prisma.department.findMany({
      select: {
        id: true,
        name: true,
      },
    });

    const statusNames = await prisma.status.findMany({
      select: {
        id: true,
        name: true,
      },
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

    // Final result to include department names and counts
    const result = {};
    for (const departmentId in counts) {
      const departmentName = departmentMap[departmentId];
      if (departmentName) {
        result[departmentName] = counts[departmentId];
      }
    }

    console.log("Ticket Counts by Department and Status:", result);

    // Return the counts as a response
    res.json(result);

  } catch (error) {
    console.error("Error fetching ticket counts:", error);
    res.status(500).json({ error: 'Failed to fetch ticket counts' });
  }
};

export default allDepartCounts;
