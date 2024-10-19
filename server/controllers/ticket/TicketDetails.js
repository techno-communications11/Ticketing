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
        isSettled:true,
        completedAt:true,
        requestreopen:true,
        status:{select:{name:true}},
        files: true,
      },
    });

    console.log(details, "det");

    if (!details) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.status(200).json(details);
  } catch (error) {
    console.error('Error fetching ticket details:', error); 
    res.status(500).json({ error: 'Internal server error' });
  }
};

export default TicketDetails;
