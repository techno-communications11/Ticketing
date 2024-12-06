import prisma from '../lib/prisma.js';

const Callback = async (req, res) => {
  try {
    console.log(req.query, "Incoming query parameters");

    let { department, ticketId,usersId } = req.query;
    console.log(department, ticketId, "Department assignment details");

    // Check if required fields are provided
    if (!department || !ticketId) {
      return res.status(400).send('All required fields (department, ticketId) must be provided');
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
      return res.status(404).send('Department not found');
    }

    console.log('Department Record:', departmentRecord); // Log department record

    // Update the ticket using the correct model name and field
    const updatedTicket = await prisma.createTicket.update({
      where: { ticketId: ticketId }, // Ensure this matches your schema
      data: { 
        departmentId: departmentRecord.id,  
        openedBy: usersId,
        assignToTeam:null,
        statusId: status, // Ensure this matches your schema
      },
    });
    console.log(updatedTicket)

    console.log(`Ticket ${ticketId} successfully updated and assigned to ${department}`);
    res.status(200).json(updatedTicket);

  } catch (err) {
    console.error('Error occurred during department assignment:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export default Callback;
