import prisma from '../lib/prisma.js';

const Callback = async (req, res) => {
  try {
    const { department, ticketId, usersId } = req.query;

    // Log incoming query parameters
    // console.log("Incoming query parameters:", req.query);
    // console.log("Department assignment details:", department, ticketId);

    // Check if required fields are provided
    if (!department || !ticketId) {
      return res.status(400).json({ message: 'All required fields (department, ticketId) must be provided' });
    }

    const status = '2'; // Assuming status ID '2' represents the desired status

    // Fetch department record by name
    const departmentRecord = await prisma.department.findUnique({
      where: { name: department },
      select: { id: true },
    });

    // Check if the department exists
    if (!departmentRecord) {
      console.error(`Department not found: ${department}`);
      return res.status(404).json({ message: 'Department not found' });
    }

    console.log('Department Record:', departmentRecord);

    // Update the ticket using the correct model name and field
    const updatedTicket = await prisma.createTicket.update({
      where: { ticketId },
      data: { 
        departmentId: departmentRecord.id,  
        openedBy: usersId,
        assignToTeam: null,
        statusId: status,
      },
    });

    // console.log(`Ticket ${ticketId} successfully updated and assigned to ${department}`);
    res.status(200).json(updatedTicket);

  } catch (err) {
    console.error('Error occurred during department assignment:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export default Callback;
