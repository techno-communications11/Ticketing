import prisma from "../lib/prisma.js";

const User_Insights = async (req, res) => {
  const { startDate, endDate } = req.query;

  try {
    // Fetch all users and their ticket stats
    const usersWithStats = await prisma.user.findMany({
      select: {
        ntid: true, // NTID of the user
        fullname: true, // Full name of the user
        tickets: {
          select: {
            status: { select: { name: true } }, // Status of the ticket
            requestreopen: true, // Request reopen flag
            createdAt: true, // Ticket creation date
          },
        },
      },
    });

    const usersWithTicketStats = usersWithStats.map((user) => {
      // Filter tickets based on date range, if provided
      const filteredTickets = user.tickets.filter((ticket) => {
        if (startDate && endDate) {
          const ticketDate = ticket.createdAt.toISOString().slice(0, 10);
          return ticketDate >= startDate && ticketDate <= endDate;
        }
        return true; // Include all tickets if no date range is provided
      });

      // Calculate ticket stats
      const ticketStatsForUser = {
        totalTickets: filteredTickets.length,
        new: 0,
        opened: 0,
        inprogress: 0,
        reopened: 0,
        completed: 0,
        requestreopenCount: 0,
      };

      filteredTickets.forEach((ticket) => {
        const statusName = ticket.status.name;

        // Count tickets based on their status
        switch (statusName) {
          case "inprogress":
            ticketStatsForUser.inprogress++;
            break;
          case "reopened":
            ticketStatsForUser.reopened++;
            break;
          case "completed":
            ticketStatsForUser.completed++;
            break;
          case "new":
            ticketStatsForUser.new++;
            break;
          case "opened":
            ticketStatsForUser.opened++;
            break;
          default:
            break;
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
        ticketStats: ticketStatsForUser,
      };
    });

    // Send the response
    res.status(200).json(usersWithTicketStats);
  } catch (error) {
    console.error("Error fetching users with ticket stats:", error);
    res.status(500).json({ error: "Failed to fetch users with ticket stats." });
  }
};

export default User_Insights;
