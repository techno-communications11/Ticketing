import prisma from "../lib/prisma.js";

const DepartmentInsights = async (req, res) => {
  const { department, statusId, dm, fullname, usersId } = req.query;

  try {
    // Get the department ID for the specified department name
    const departmentRecord = await prisma.department.findUnique({
      where: { name: department },
      select: { id: true },
    });
    const departmentId = departmentRecord?.id;

    // Ensure departmentId exists
    if (!departmentId) {
      return res.status(404).json({ error: "Department not found" });
    }

    console.log(departmentId, "Department ID");

    // Initialize tickets array
    let tickets = [];
    const statusIds = statusId === "0" ? ['1', '2', '3', '4', '5'] : [statusId]; // Handle "0" case for all statuses

    // Building the query conditions
    let whereConditions = {
      statusId: { in: statusIds },
      departmentId: departmentId,
    };

    if (dm) {
      // Fetch tickets assigned to a specific DM in the specified department and statusId(s)
      whereConditions.assignedTo = dm;
    } else if (fullname) {
      // Fetch tickets assigned to a specific team member or opened by the user
      whereConditions.OR = [
        { openedBy: usersId },
        { assignToTeam: fullname },
      ];
    }

    // Fetch tickets based on the constructed query
    tickets = await prisma.createTicket.findMany({
      where: whereConditions,
      include: {
        department: true,
        status: { select: { name: true } },
      },
    });

    // Send back the tickets array
    res.json({ tickets });
  } catch (error) {
    console.error("Error fetching department insights:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export default DepartmentInsights;
