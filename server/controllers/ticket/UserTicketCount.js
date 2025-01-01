import prisma from "../lib/prisma.js";

const UserTicketCount = async (req, res) => {
  try {
    const { ntid } = req.query;

    if (!ntid || typeof ntid !== "string") {
      return res.status(400).json({ message: "The ntid parameter is required and must be a string." });
    }

    console.log(ntid, "User NTID received from client");

    // Fetch tickets for the specified NTID
    const tickets = await prisma.createTicket.findMany({
      where: { ntid },
      select: {
        status: {
          select: {
            name: true, // Status name
          },
        },
      },
    });

    if (!tickets || tickets.length === 0) {
      return res.status(404).json({ message: `No tickets found for NTID: ${ntid}` });
    }

    console.log(tickets, "Fetched tickets");

    // Count ticket statuses
    const statusCountMap = tickets.reduce((acc, ticket) => {
      const statusName = ticket.status.name; // Access status name
      acc[statusName] = (acc[statusName] || 0) + 1; // Increment count
      return acc;
    }, {});

    console.log(statusCountMap, "Status counts");

    // Send response back to the client
    res.status(200).json(statusCountMap);
  } catch (error) {
    console.error("Error retrieving ticket data:", error);
    res.status(500).json({ message: "Failed to retrieve ticket data." });
  }
};

export default UserTicketCount;
