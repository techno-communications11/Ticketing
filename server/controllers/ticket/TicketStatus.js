import prisma from "../lib/prisma.js";

const TicketStatus = async (req, res) => {
  const { statusId, ticketId, usersId } = req.query;
  console.log(`Received - statusId: ${statusId}, ticketId: ${ticketId}, usersId: ${usersId}`);

  try {
    if (!statusId || !ticketId || !usersId) {
      return res.status(400).json({ message: "Status, ticket ID, and users ID are required" });
    }
    

    const ticket = await prisma.createTicket.findUnique({
      where: { ticketId: ticketId },
      select: { userId: true, status: { select: { id: true } } },
    });

    // console.log(ticket, "ticket");

    if (!ticket) {
      console.log(`Ticket with ID ${ticketId} not found.`);
      return res.status(404).json({ message: "Ticket not found" });
    }

    const requestedStatus = String(statusId); // Ensure statusId is treated as a string
    console.log(`Current Ticket Status: ${ticket.status.id}, Requested Status: ${requestedStatus}`);

    const validTransitions = {
      '1': ['2'],
      '2': ['3', '4'],
      '3': ['4'],
      '4': ['5'],
      '5': ['3','4','1']
    };

    if (!validTransitions[ticket.status.id]?.includes(requestedStatus)) {
      return res.status(400).json({
        message: `Invalid status transition from ${ticket.status.id} to ${requestedStatus}`,
        currentStatus: ticket.status.id,
        requestedStatus: requestedStatus,
      });
    }

    let updateData = { statusId: requestedStatus };

    // Handle specific status logic
    if (requestedStatus === '4') {
      updateData = {
        ...updateData,
        completedAt: new Date(),
        requestreopen: null,
        openedBy:usersId
      };
    } else if (requestedStatus === '3') {
      updateData = {
        ...updateData,
        completedAt: null,
        requestreopen: null,
        openedBy: null,
      };
    } else if (requestedStatus === '2') {
      updateData.openedBy = usersId;
    } else if (requestedStatus === '5') {
      updateData = {
        ...updateData,
        completedAt: null,
        isSettled: null,
        assignToTeam: null,
        requestreopen: null,
        departmentId: '19', // Adjust the department ID as needed
      };
    }

    await prisma.createTicket.update({
      where: { ticketId: ticketId },
      data: updateData,
    });

    return res.status(200).json({ message: "Ticket status updated successfully" });
  } catch (error) {
    console.error("Error updating ticket status:", error);
    return res.status(500).json({ message: "Failed to update ticket status" });
  }
};

export default TicketStatus;
