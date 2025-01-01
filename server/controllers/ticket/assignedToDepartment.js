import prisma from '../lib/prisma.js';

const assignToDepartment = async (req, res) => {
  try {
    const { department, ticketId } = req.query; // Destructure directly from req.query
    console.log(department, ticketId, "Department assignment details");

    // Validate input fields
    if (!department || !ticketId) {
      return res.status(400).send('Both department and ticketId are required');
    }

    // Fetch the department id based on the department name
    const departmentRecord = await prisma.department.findUnique({
      where: { name: department },
      select: { id: true },
    });

    // If the department is not found, send a 404 error
    if (!departmentRecord) {
      console.error(`Department not found: ${department}`);
      return res.status(404).send('Department not found');
    }

    // Update the ticket with the department id and other necessary fields
    const updatedTicket = await prisma.createTicket.update({
      where: { ticketId },
      data: {
        departmentId: departmentRecord.id,  
        openedBy: null,  // This can be updated based on your business logic
      },
    });

    console.log(`Ticket ${ticketId} successfully updated and assigned to ${department}`);
    res.status(200).json(updatedTicket);

  } catch (err) {
    console.error('Error occurred during department assignment:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export default assignToDepartment;
