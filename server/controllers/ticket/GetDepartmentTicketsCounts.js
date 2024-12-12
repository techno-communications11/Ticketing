import prisma from "../lib/prisma.js";

const GetDepartmentTicketsCounts = async (req, res) => {
  const { department, usersId } = req.params;

  console.log(department,"department")
  // const userid = req.user.id;
  console.log(usersId,"iddddddddddddddddddddddddddddddd")

  if (!department) {
    return res.status(400).json("Invalid department or missing department");
  }
  if (!usersId) {
    return res.status(400).json("Invalid userId or missing userId");
  }
  try {
    const departmentId = await prisma.department.findMany({
      where: { name: department },
      select: { id: true },
    });
   

    if (!departmentId.length) {
      return res.status(404).json("Department not found");
    }

    const tickets = await prisma.createTicket.findMany({
      where: {
        departmentId: departmentId[0].id, // Assuming departmentId[0].id is defined correctly
        OR: [
          {
            openedBy: usersId, // Match tickets opened by the user
          },
          
        ],
      },
      select: {
        status: {
          select: {
            name: true, // Select the name field from the status relation
          },
        },
      },
    });

    const counts = {};

    tickets.forEach((ticket) => {
      const statusName = ticket.status.name;
      counts[statusName] = (counts[statusName] || 0) + 1;
    });

    counts.Total =
      (counts.completed || 0) +
      (counts.inprogress || 0) +
      (counts.opened || 0) +
      (counts.reopened || 0);

    console.log(counts, "ccser");
    return res.status(200).json(counts);
  } catch (error) {
    console.log(error);
    return res.status(500).json("Failed to retrieve department tickets");
  }
};

export default GetDepartmentTicketsCounts;
