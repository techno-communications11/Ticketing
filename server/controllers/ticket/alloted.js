import prisma from "../lib/prisma.js";

const alloted = async (req, res) => {
  const { user, ticketId } = req.body;

  // Logging the incoming request data
  console.log("Received data:", req.body);

  try {
    // Fetch departmentId for the user
    const dept = await prisma.user.findFirst({
      where: { fullname: user },
      select: { departmentId: true },
    });

    // Log the result of the dept query
    console.log("Department data:", dept);

    // If no department is found, return an error response
    if (!dept) {
      return res.status(404).json({ message: "User not found or no department assigned" });
    }

    // Proceed to update the ticket
    const updatedTicket = await prisma.createTicket.update({
      where: { ticketId },
      data: {
        assignToTeam: user,
        openedBy: null,
        departmentId: dept.departmentId,
      },
    });

    // Log the updated ticket
    console.log("Ticket updated:", updatedTicket);

    // Send the success response
    res.status(200).json({ message: "Ticket updated successfully", ticket: updatedTicket });

  } catch (error) {
    // Log the error and send a response with the error details
    console.error("Error updating ticket:", error);
    res.status(500).json({ message: "Failed to update the ticket", error: error.message });
  }
};

export default alloted;
