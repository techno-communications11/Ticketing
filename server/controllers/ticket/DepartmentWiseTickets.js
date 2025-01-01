import prisma from "../lib/prisma.js";

const DepartmentWiseTickets = async (req, res) => {
  const { department, statusId } = req.query;

  if (!department || statusId === undefined) {
    return res.status(400).json({ error: 'department and statusId are required' });
  }

  try {
    // Find the department ID
    const departmentRecord = await prisma.department.findUnique({
      where: { name: department },
      select: { id: true }
    });

    if (!departmentRecord) {
      return res.status(404).json({ error: 'Department not found' });
    }

    const departmentId = departmentRecord.id;
    const statusCondition = statusId === "0" ? { in: ['1', '2', '3', '4', '5'] } : statusId;

    // Fetch tickets along with `openedBy`
    const tickets = await prisma.createTicket.findMany({
      where: {
        departmentId: departmentId,
        statusId: statusCondition
      },
      select: {
        ticketId: true,
        ntid: true,
        fullname: true,
        departmentId: true,
        status: { select: { id: true, name: true } },
        createdAt: true,
        completedAt: true,
        openedBy: true,
        assignToTeam: true,
        isSettled: true
      }
    });

    console.log(tickets, "Fetched tickets");

    // Collect user IDs for all tickets with openedBy field populated
    const openedByUserIds = tickets
      .filter(ticket => ticket.openedBy)
      .map(ticket => ticket.openedBy);

    // Fetch all users once for performance optimization
    const users = await prisma.user.findMany({
      where: { id: { in: openedByUserIds } },
      select: { id: true, fullname: true }
    });

    // Create a lookup map for users by their IDs
    const userMap = users.reduce((map, user) => {
      map[user.id] = user.fullname;
      return map;
    }, {});

    // Attach the `openedByFullName` to each ticket
    const ticketsWithOpeners = tickets.map(ticket => ({
      ...ticket,
      openedByFullName: userMap[ticket.openedBy] || null
    }));

    console.log("Tickets with openers:", ticketsWithOpeners);

    // Send the modified tickets as a response
    res.status(200).json(ticketsWithOpeners);

  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export default DepartmentWiseTickets;
