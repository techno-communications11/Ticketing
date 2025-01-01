import prisma from "./lib/prisma.js";

// Function to get tickets based on the assigned DM's name
const getTicketsByDM = async (fullname) => {
  if (!fullname) {
    throw new Error("DM's fullname is required.");
  }

  return prisma.createTicket.findMany({
    where: {
      assignedTo: fullname, // Filter tickets by assignedTo field
    },
    select: {
      ntid: true, // Get the NTID of the user
      status: {
        select: {
          name: true, // Get the status name
        },
      },
    },
  });
};

// Express route handler
const fetchUserTicketsStats = async (req, res) => {
  const { fullname } = req.query; // Get DM's full name from the query params

  if (!fullname) {
    return res.status(400).json({ message: "DM's fullname is required." });
  }

  try {
    // Step 1: Get tickets assigned to users under the DM
    const tickets = await getTicketsByDM(fullname);

    // Step 2: Organize data to count tickets by status per user using `reduce`
    const result = tickets.reduce((acc, ticket) => {
      const ntid = ticket.ntid;
      const statusName = ticket.status.name.toLowerCase(); // Normalize status name

      if (!acc[ntid]) {
        acc[ntid] = {
          ntid,
          totalTickets: 0,
          openedTickets: 0,
          inprogressTickets: 0,
          completedTickets: 0,
          reopenedTickets: 0,
          newTickets: 0,
        };
      }

      acc[ntid].totalTickets += 1;

      switch (statusName) {
        case "opened":
          acc[ntid].openedTickets += 1;
          break;
        case "inprogress":
          acc[ntid].inprogressTickets += 1;
          break;
        case "completed":
          acc[ntid].completedTickets += 1;
          break;
        case "reopened":
          acc[ntid].reopenedTickets += 1;
          break;
        case "new":
          acc[ntid].newTickets += 1;
          break;
        default:
          break;
      }

      return acc;
    }, {});

    // Convert result object to an array
    const resultArray = Object.values(result);

    res.status(200).json(resultArray);
  } catch (error) {
    console.error("Error fetching tickets:", error.message);
    res.status(500).json({ message: "Error fetching tickets. Please try again." });
  }
};

// Export the controller
export default fetchUserTicketsStats;
