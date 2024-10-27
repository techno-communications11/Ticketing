import prisma from "../lib/prisma.js";

const User_Insights = async (req, res) => {
  try {
    // Fetch all users and their ticket stats by joining with createTicket model
    const usersWithStats = await prisma.user.findMany({
      select: {
        ntid: true,   // NTID of the user
        fullname: true // Full name of the user
      }
    });

    // Fetch ticket data for all users
    const ticketStats = await prisma.createTicket.findMany({
      select: {
        ntid: true,   // NTID stored in the createTicket table
        status: { select: { name: true } },  // Status of the ticket
        requestreopen: true  // Request reopen flag
      }
    });

    // Map users to their respective ticket stats
    const usersWithTicketStats = usersWithStats.map(user => {
      const ticketStatsForUser = {
        totalTickets: 0,
        new: 0,
        opened: 0,
        inprogress: 0,
        reopened: 0,
        completed: 0,
        requestreopenCount: 0
      };

      // Filter and calculate stats for this user's tickets
      const userTickets = ticketStats.filter(ticket => ticket.ntid === user.ntid);

      userTickets.forEach(ticket => {
        ticketStatsForUser.totalTickets++;
        const statusName = ticket.status.name;

        // Count tickets based on their status
        if (statusName === 'inprogress') {
          ticketStatsForUser.inprogress++;
        } else if (statusName === 'reopened') {
          ticketStatsForUser.reopened++;
        } else if (statusName === 'completed') {
          ticketStatsForUser.completed++;
        } else if (statusName === 'new') {
          ticketStatsForUser.new++;
        } else if (statusName === 'opened') {
          ticketStatsForUser.opened++;
        }

        // Count request reopen tickets
        if (ticket.requestreopen) {
          ticketStatsForUser.requestreopenCount++;
        }
      });

      // Return the user with their ticket stats
      return {
        ntid: user.ntid,
        fullname: user.fullname,
        ticketStats: ticketStatsForUser
      };
    });
    console.log(usersWithTicketStats)

    // Send the response
    res.status(200).json(usersWithTicketStats);
  } catch (error) {
    console.error('Error fetching users with ticket stats:', error);
    res.status(500).json({ error: 'Failed to fetch users with ticket stats.' });
  }
};

export default User_Insights;
