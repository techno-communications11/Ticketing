import prisma from "../lib/prisma.js";

const alloted = async (req, res) => {
  const { user,ticketId } = req.body; 
  console.log(user,"usr")
  

  try {

    const updatedTicket = await prisma.createTicket.update({
      where: { ticketId },
      data: {
        assignToTeam: user, 
        openedBy:null 
      },
    });

    console.log("Ticket updated:", updatedTicket);

    res.status(200).json({ message: "Ticket opened successfully", ticket: updatedTicket });
  } catch (error) {
    console.error("Error updating ticket:", error);
    res.status(500).json({ message: "Failed to update the ticket" });
  }
};

export default alloted;
