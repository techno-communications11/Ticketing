import prisma from "../lib/prisma.js";

const TicketCount = async (req, res) => {
  const { startDate, endDate } = req.query;

  // Ensure the startDate and endDate are valid Date objects
  const parsedStartDate = startDate ? new Date(startDate) : null;
  const parsedEndDate = endDate ? new Date(endDate) : null;

  try {
    // Fetch all tickets without filtering by date in the database
    const tickets = await prisma.createTicket.findMany();

    // Fetch all statuses
    const statuses = await prisma.status.findMany({
      select: {
        id: true,
        name: true,
      },
    });

    // Filter tickets by start and end date using JavaScript
    const filteredTickets = tickets.filter(ticket => {
      const ticketDate = new Date(ticket.createdAt);
      // Reset time to midnight for both startDate and endDate for comparison
      const ticketDateOnly = ticketDate.toISOString().slice(0, 10); // Get only YYYY-MM-DD

      // Compare with the provided start and end dates, if they exist
      const startDateMatch = parsedStartDate ? ticketDateOnly >= parsedStartDate.toISOString().slice(0, 10) : true;
      const endDateMatch = parsedEndDate ? ticketDateOnly <= parsedEndDate.toISOString().slice(0, 10) : true;

      return startDateMatch && endDateMatch;
    });

    // Now, group the filtered tickets by statusId and count them
    const ticketCounts = statuses.map(status => {
      const count = filteredTickets.filter(ticket => ticket.statusId === status.id).length;
      return {
        status: status.name,
        count: count,
      };
    });

    console.log(ticketCounts); // Optionally log the ticket counts

    // Send the response to the client
    res.status(200).json(ticketCounts);
  } catch (error) {
    console.error('Error fetching ticket counts:', error);
    res.status(500).json({ message: 'Failed to retrieve ticket count data' });
  }
};

export default TicketCount;
