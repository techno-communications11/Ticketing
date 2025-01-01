import prisma from "../lib/prisma.js";

const GetDepartmentTicketsCounts = async (req, res) => {
  const { department, usersId } = req.params;

  console.log(department, "department");
  console.log(usersId, "userId");

  // Preliminary checks for missing parameters
  if (!department) {
    return res.status(400).json("Invalid or missing department");
  }

  if (!usersId) {
    return res.status(400).json("Invalid or missing userId");
  }

  try {
    // Fetch the department ID based on the department name
    const departmentData = await prisma.department.findUnique({
      where: { name: department },
      select: { id: true },
    });

    if (!departmentData) {
      return res.status(404).json("Department not found");
    }

    // Fetch tickets for the given department and user
    const tickets = await prisma.createTicket.findMany({
      where: {
        departmentId: departmentData.id, // Department ID
        OR: [
          { openedBy: usersId }, // Tickets opened by the user
        ],
      },
      select: {
        status: {
          select: {
            name: true, // Status name
          },
        },
      },
    });

    // Initialize the count object and process the tickets
    const counts = tickets.reduce((acc, ticket) => {
      const statusName = ticket.status.name;
      acc[statusName] = (acc[statusName] || 0) + 1;
      return acc;
    }, {});

    // Calculate total ticket count
    counts.Total = Object.values(counts).reduce((sum, count) => sum + count, 0);

    console.log(counts, "ticket counts by status");
    return res.status(200).json(counts);

  } catch (error) {
    console.error("Error fetching department tickets:", error.message);
    return res.status(500).json("Failed to retrieve department tickets");
  }
};

export default GetDepartmentTicketsCounts;
