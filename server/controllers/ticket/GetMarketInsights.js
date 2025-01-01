import prisma from "../lib/prisma.js";

const GetMarketInsights = async (req, res) => {
  const { fullname } = req.query;
  
  if (!fullname) {
    return res.status(400).json({ error: "Fullname is required" });
  }

  try {
    // Fetch tickets assigned to the provided fullname and get their status
    const tickets = await prisma.createTicket.findMany({
      where: { assignedTo: fullname },
      select: { status: { select: { name: true } } }
    });

    // Check if any tickets are found
    if (tickets.length === 0) {
      return res.status(404).json({ message: `No tickets found for ${fullname}` });
    }

    // Initialize counts using reduce
    const counts = tickets.reduce((acc, ticket) => {
      const statusName = ticket.status.name;
      acc[statusName] = (acc[statusName] || 0) + 1;
      return acc;
    }, {});

    // Calculate the total count of all ticket statuses
    counts.Total =
      (counts.new || 0) +
      (counts.completed || 0) +
      (counts.inprogress || 0) +
      (counts.opened || 0) +
      (counts.reopened || 0);

    // Log the results (optional for debugging)
    console.log(counts, "Market Insights");

    return res.status(200).json(counts);

  } catch (error) {
    console.error('Error fetching market insights:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export default GetMarketInsights;
