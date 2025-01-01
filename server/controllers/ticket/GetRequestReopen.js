import prisma from "../lib/prisma.js";

const GetRequestReopen = async (req, res) => {
  try {
    const { ntid } = req.query;

    // Check if NTID is provided
    if (!ntid) {
      return res.status(400).json({ error: "NTID is required" });
    }

    console.log("get_request_reopen_tickets ", ntid);

    // Fetch the user's full name based on the NTID
    const user = await prisma.user.findUnique({
      where: { ntid },
      select: { fullname: true },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Fetch tickets that are requested for reopening and have statusId '4'
    const tickets = await prisma.createTicket.findMany({
      where: {
        statusId: '4',
        requestreopen: true,
      },
      include: {
        status: { select: { name: true } },
      },
    });

    // Return the fetched tickets
    return res.status(200).json(tickets);

  } catch (error) {
    console.error("Error fetching reopen request tickets:", error);
    return res.status(500).json({ error: "Failed to fetch reopen request tickets" });
  }
};

export default GetRequestReopen;
