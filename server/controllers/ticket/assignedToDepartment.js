import prisma from '../lib/prisma.js';

const assignToDepartment = async (req, res) => {
  try {
    console.log(req.query, "Incoming query parameters");

    let { department, ticketId} = req.query;
    console.log(department, ticketId, "Department assignment details");

    if (!department || !ticketId) {
      return res.status(400).send('All required fields (department, ticketId, ntid) must be provided');
    }

   

    const departmentRecord = await prisma.department.findUnique({
      where: { name: department },
      select: { id: true },
    });
    // const statusIds="3";

    if (!departmentRecord) {
      console.error(`Department not found: ${department}`);
      return res.status(404).send('Department not found');
    }

    const updatedTicket = await prisma.createTicket.update({
      where: { ticketId: ticketId },
      data: { 
        departmentId: departmentRecord.id,  
        openedBy: null,
        // statusId: statusIds,
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
