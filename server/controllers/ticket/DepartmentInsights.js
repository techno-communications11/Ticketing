import prisma from "../lib/prisma.js";

const DepartmentInsights = async (req, res) => {
  const { department, statusId, dm, fullname } = req.query;
  console.log(department, statusId, dm, fullname, "rbjfgrjfgbjghesg");

  try {
    // Get the department ID for the specified department name
    const departmentRecord = await prisma.department.findUnique({
      where: { name: department },
      select: { id: true },
    });
    const departmentId = departmentRecord?.id;
    console.log(departmentId, "Department ID");

    // Initialize tickets as an empty array
    let tickets = [];
    const statusIds = statusId === "0" ? ['1', '2', '3', '4', '5'] : [statusId];

    // Ensure departmentId exists
    if (!departmentId) {
      return res.status(404).json({ error: "Department not found" });
    }

    if (dm) {
      // Fetch tickets assigned to a specific DM in the specified department and statusId(s)
      tickets = await prisma.createTicket.findMany({
        where: {
          statusId: { in: statusIds },
          assignedTo: dm,
        },
        include: {
          department: true,
          status:{select:{name:true}},
        },
      });
    } else if (fullname) {
      // Fetch tickets assigned to a specific team member by fullname in the specified department and statusId(s)
      tickets = await prisma.createTicket.findMany({
        where: {
          statusId:statusId,
          departmentId: departmentId, // Assuming departmentId[0].id is defined correctly
          OR: [
            {
              openedBy: req.user.id,                // Match tickets opened by the user
            },
            {
              assignToTeam: fullname            // Match tickets assigned to the user
            },
          ],
        include: {
          department: true,
          status:{select:{name:true}},
        },
    }});
    }

    // Send back the tickets array
    res.json({ tickets });
  } catch (error) {
    console.error("Error fetching department insights:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export default DepartmentInsights;
