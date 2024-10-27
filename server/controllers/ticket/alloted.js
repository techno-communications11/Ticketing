import prisma from "../lib/prisma.js";

const alloted = async (req, res) => {
  const { user,ticketId } = req.body; 
  console.log(user)

  

  try {
    const dept=await prisma.user.findFirst({
      where:{fullname:user},
      select:{departmentId:true}
    })

    const updatedTicket = await prisma.createTicket.update({
      where: { ticketId },
      data: {
        assignToTeam: user, 
        openedBy:null, 
        departmentId: dept.departmentId
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
