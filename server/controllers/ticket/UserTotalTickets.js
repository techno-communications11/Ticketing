import prisma from "../lib/prisma.js";

const getUserTickets = async (req, res) => {
  try {
    const { ntid, statusId } = req.query;

    // Build filter condition
    const filter = {
      ...(ntid ? { ntid } : {}),
      ...(statusId === "0"
        ? { statusId: { in: ["1", "2", "3", "4", "5"] } }
        : { statusId }),
    };

    // Fetch tickets based on the filter
    const tickets = await prisma.createTicket.findMany({
      where: filter,
      select: {
        ntid: true,
        fullname: true,
        createdAt: true,
        completedAt: true,
        openedBy: true,
        ticketId: true,
        isSettled: true,
        status: {
          select: {
            name: true,
          },
        },
      },
    });

    if (tickets.length === 0) {
      return res
        .status(404)
        .json({ message: "No tickets found for the provided parameters." });
    }

    // Extract unique `openedBy` IDs for batch querying
    const openedByIds = [
      ...new Set(tickets.map((ticket) => ticket.openedBy).filter(Boolean)),
    ];

    // Fetch user full names in bulk
    const usersMap = await prisma.user
      .findMany({
        where: { id: { in: openedByIds } },
        select: { id: true, fullname: true },
      })
      .then((users) =>
        users.reduce((map, user) => {
          map[user.id] = user.fullname;
          return map;
        }, {})
      );

    // Map tickets with the `openedByFullName` field
    const ticketsWithOpeners = tickets.map((ticket) => ({
      ...ticket,
      openedByFullName: ticket.openedBy ? usersMap[ticket.openedBy] || "-" : "-",
    }));

    res.status(200).json({
      message: "Tickets retrieved successfully.",
      total: ticketsWithOpeners.length,
      data: ticketsWithOpeners,
    });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    res.status(500).json({ message: "Failed to retrieve tickets." });
  }
};

export default getUserTickets;
