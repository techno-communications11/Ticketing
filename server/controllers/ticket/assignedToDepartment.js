import prisma from '../lib/prisma.js';

const assignToDepartment = async (req, res) => {
  try {
    console.log(req.query, "Incoming query parameters");

    let { department, ticketId, ntid } = req.query;
    console.log(ntid, department, ticketId, "Department assignment details");

    if (!department || !ticketId || !ntid) {
      return res.status(400).send('All required fields (department, ticketId, ntid) must be provided');
    }

    if (department === 'Maintenance Related') {
      department = 'Maintenance_Head';
    } else if (department === 'Admin') {
      department = 'Admin_Head';
    }

    const departmentRecord = await prisma.department.findUnique({
      where: { name: department },
      select: { id: true },
    });

    if (!departmentRecord) {
      console.error(`Department not found: ${department}`);
      return res.status(404).send('Department not found');
    }

    const updatedTicket = await prisma.createTicket.update({
      where: { ticketId: ticketId },
      data: { 
        departmentId: departmentRecord.id,  
        openedBy: null, 
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
