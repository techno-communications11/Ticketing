import prisma from "../lib/prisma.js";

const TicketDetails = async (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'id parameter is required' });
  }

  try {
    const details = await prisma.createTicket.findUnique({
      where: { ticketId: id },
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
        completedAt: true,
        requestreopen: true,
        selectedDepartment: true,
        selectedSubdepartment: true,
        departmentId: true,
        userId: true,
        status: {
          select: { name: true },
        },
      },
    });

    if (!details) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Fetch the user who created the ticket (if `userId` exists)
    const userDetails = details.userId
      ? await prisma.user.findUnique({
          where: { id: details.userId },
          select: { fullname: true },
        })
      : null;

    // Add the user name to the ticket details
    const ticketWithUserDetails = {
      ...details,
      OpenedByFullName: userDetails?.fullname || null,
    };

    res.status(200).json(ticketWithUserDetails);
  } catch (error) {
    console.error('Error fetching ticket details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export default TicketDetails;
