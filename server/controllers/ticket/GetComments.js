import prisma from '../lib/prisma.js';

const getcomment = async (req, res) => {
    const { ticketId } = req.query; 

    try {
      const ticketWithComments = await prisma.createTicket.findUnique({
        where: { ticketId: ticketId },
        include: {
          comments: true,  
        },
      });
      if (!ticketWithComments) {
        return res.status(404).json({ message: 'Ticket not found.' });
      }
      console.log(ticketWithComments.comments,"comments")
      res.status(200).json(ticketWithComments.comments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      res.status(500).json({ message: 'Error fetching comments.' });
    }
};
export default getcomment;
