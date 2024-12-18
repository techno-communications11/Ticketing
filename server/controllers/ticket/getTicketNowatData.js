import prisma from "../lib/prisma.js";

const getTicketNowatData = async (req, res) => {
  const { datastatusId, datafullname } = req.query;

  if (!datastatusId || !datafullname) {
    return res.status(400).json({ error: "datastatusId and datafullname are required" });
  }

  console.log(req.query, "Request Query");

  try {
    // Step 1: Find the user by fullname
    const user = await prisma.user.findFirst({
      where: { fullname: datafullname },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const userId = user.id;

    // Step 2: Fetch tickets based on userId and statusId
    const tickets = await prisma.createTicket.findMany({
      where: {
        openedBy: userId,
        statusId: datastatusId,
      },
      select: {
        ticketId: true,
        ntid: true,
        fullname: true,
        market: true,
        selectStore: true,
        phoneNumber: true,
        ticketRegarding: true,
        description: true,
        createdAt: true,
        isSettled: true,
        openedBy: true,
        completedAt: true,
        status: { select: { name: true } },
        files: true,
      },
    });

    console.log(tickets, "Fetched Tickets");

    // Step 3: Return the fetched tickets with additional info
    return res.status(200).json({
      tickets,
      openedByFullName: datafullname,
    });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return res.status(500).json({ error: "Failed to fetch tickets" });
  }
};

export default getTicketNowatData;
