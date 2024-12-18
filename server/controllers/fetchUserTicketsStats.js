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
  console.log(fullname, 'assignedTo');

  try {
    // Step 1: Get tickets assigned to users under the DM
    const tickets = await getTicketsByDM(fullname);
    console.log(tickets, 'tickets');

    // Step 2: Organize data to count tickets by status per user
    const result = tickets.reduce((acc, ticket) => {
      const ntid = ticket.ntid;
      const statusName = ticket.status.name.toLowerCase(); // Ensure it's lowercase for consistency

      // Check if user already exists in the accumulator
      if (!acc[ntid]) {
        acc[ntid] = {
          ntid: ntid,
          totalTickets: 0,
          openedTickets: 0,
          inprogressTickets: 0,
          completedTickets: 0,
          reopenedTickets: 0,
          newTickets: 0,
        };
      }

      // Update ticket counts
      acc[ntid].totalTickets += 1;

      switch (statusName) {
        case 'opened':
          acc[ntid].openedTickets += 1;
          break;
        case 'inprogress':
          acc[ntid].inprogressTickets += 1;
          break;
        case 'completed':
          acc[ntid].completedTickets += 1;
          break;
        case 'reopened':
          acc[ntid].reopenedTickets += 1;
          break;
        case 'new':
          acc[ntid].newTickets += 1;
          break;
        default:
          break;
      }

      return acc;
    }, {});

    // Convert the object back into an array
    const resultArray = Object.values(result);

    console.log(resultArray, 'result');
    res.json(resultArray);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching tickets' });
  }
};

// Export the controller
export default fetchUserTicketsStats;
