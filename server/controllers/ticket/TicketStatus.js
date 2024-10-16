import prisma from "../lib/prisma.js";
const TicketStatus = async (req, res) => {
  const { statusId, ticketId } = req.query;
  console.log(`Received - statusId: ${statusId}, ticketId: ${ticketId}`);

  try {
    if (!statusId || !ticketId) {
      return res.status(400).json({ message: "Status and ticket ID are required" });
    }

    const ticket = await prisma.createTicket.findUnique({
      where: { ticketId: ticketId },
      select: { userId: true, status:{select:{id:true}} },
    });
    console.log(ticket,"ticket")

    if (!ticket) {
      console.log(`Ticket with ID ${ticketId} not found.`);
      return res.status(404).json({ message: "Ticket not found" });
    }

    console.log(`Current Ticket Status: ${ticket.status.id}, Requested Status: ${statusId}`);

    const validTransitions = {
      "1": ['2'],
      '2': ['3', '4'],
      '3': ['4'],
      '4': ['5'],
      '5': ['3', '4','1']
    };

    if (validTransitions[ticket.status.id]?.includes(statusId)) {
      let updateData = { statusId: statusId };

      if (statusId === '4') {
        updateData.completedAt = new Date();
        updateData.requestreopen=null;
      } 
      if (statusId === '3') {
        updateData.openedBy = null;
      } 
      if (statusId === '5') {
        updateData.completedAt = null;
        updateData.isSettled=null;
        updateData.assignToTeam=null;
      }

      await prisma.createTicket.update({
        where: { ticketId: ticketId },
        data: updateData,
      });

      return res.status(200).json({ message: "Ticket status updated successfully" });
    } else {
      return res.status(400).json({ 
        message: "Invalid status transition", 
        currentStatus: ticket.statusId, 
        requestedStatus: statusId 
      });
    }
  } catch (error) {
    console.error("Error updating ticket status:", error);
    return res.status(500).json({ message: "Failed to update ticket status" });
  }
};

export default TicketStatus;
