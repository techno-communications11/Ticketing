import prisma from '../lib/prisma.js';

const assignToDepartment = async (req, res) => {
  try {
    // Log the incoming query parameters
    console.log(req.query, "Incoming query parameters");

    const { department, ticketId, ntid } = req.query;
    console.log(ntid, department, ticketId, "Department assignment details");

    // Validate inputs
    if (!department || !ticketId || !ntid) {
      return res.status(400).send('Need all the required fields');
    }

    if (!prisma) {
      console.error('Prisma client is not initialized');
      return res.status(500).send('Internal Server Error: Prisma client not initialized');
    }

    // Log the ticket model to see if it's defined
    console.log(prisma.ticket, "Prisma ticket model"); // Check if this is defined

    // Find the department ID
    const departmentRecord = await prisma.department.findUnique({
      where: { name: department },
      select: { id: true },
    });

    console.log(departmentRecord, 'Fetched department record');

    // Check if department exists
    if (!departmentRecord) {
      return res.status(404).send('Department not found');
    }

    // Update the ticket with the department ID
    const updatedTicket = await prisma.createTicket.update({
      where: { ticketId: ticketId },
      data: { departmentId: departmentRecord.id, ticketNowAt: ntid, openedBy:null },
    });

    // Return the updated ticket
    res.status(200).json(updatedTicket);
  } catch (err) {
    console.error(err); // Use console.error for better logging
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export default assignToDepartment;
