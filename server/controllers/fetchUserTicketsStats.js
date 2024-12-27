import prisma from './lib/prisma.js';

// Function to get tickets based on the assigned DM's name
const getTicketsByDM = async (fullname) => {
  return await prisma.createTicket.findMany({
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

  try {
    // Step 1: Get tickets assigned to users under the DM
    const tickets = await getTicketsByDM(fullname);

    // Step 2: Organize data to count tickets by status per user using a Map for better performance
    const result = new Map();

    tickets.forEach((ticket) => {
      const ntid = ticket.ntid;
      const statusName = ticket.status.name.toLowerCase(); // Ensure it's lowercase for consistency

      // Check if user already exists in the Map
      if (!result.has(ntid)) {
        result.set(ntid, {
          ntid: ntid,
          totalTickets: 0,
          openedTickets: 0,
          inprogressTickets: 0,
          completedTickets: 0,
          reopenedTickets: 0,
          newTickets: 0,
        });
      }

      // Get the user's ticket count object
      const userTickets = result.get(ntid);

      // Update ticket counts
      userTickets.totalTickets += 1;
      switch (statusName) {
        case 'opened':
          userTickets.openedTickets += 1;
          break;
        case 'inprogress':
          userTickets.inprogressTickets += 1;
          break;
        case 'completed':
          userTickets.completedTickets += 1;
          break;
        case 'reopened':
          userTickets.reopenedTickets += 1;
          break;
        case 'new':
          userTickets.newTickets += 1;
          break;
        default:
          break;
      }
    });

    // Convert the Map back into an array
    const resultArray = Array.from(result.values());

    res.json(resultArray);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching tickets' });
  }
};

// Export the controller
export default fetchUserTicketsStats;
