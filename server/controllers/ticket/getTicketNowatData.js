import prisma from "../lib/prisma.js";

const getTicketNowatData = async (req, res) => {
  const { datastatusId, datafullname } = req.query;

  // Step 1: Validate input parameters
  if (!datastatusId || !datafullname) {
    return res.status(400).json({ error: "datastatusId and datafullname are required" });
  }

  // Additional validation for datastatusId and datafullname
  if (
    typeof datastatusId !== "string" ||
    typeof datafullname !== "string" ||
    !datastatusId.trim() ||
    !datafullname.trim()
  ) {
    return res.status(400).json({ error: "Invalid datastatusId or datafullname" });
  }

  console.log("Request Query:", req.query);

  try {
    // Step 2: Find the user by fullname
    const user = await prisma.user.findFirst({
      where: { fullname: datafullname },
    });

    let tickets;

    if (user) {
      const userId = user.id;

      // Step 3: Fetch tickets based on userId and statusId
      tickets = await prisma.createTicket.findMany({
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
    } else {
      // Step 4: Fetch tickets with openedBy === null if user not found
      tickets = await prisma.createTicket.findMany({
        where: {
          openedBy: null,
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
    }

    // console.log("Fetched Tickets:", tickets);

    // Step 5: Return the fetched tickets with additional info
    return res.status(200).json({
      tickets,
      openedByFullName: user ? datafullname : null,
    });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return res.status(500).json({ error: "Failed to fetch tickets", details: error.message });
  }
};

export default getTicketNowatData;
