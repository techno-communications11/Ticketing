import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const detailedTicketsWithMarket = async (req, res) => {
  const { market } = req.query; 
  if (!market) {
    return res.status(400).json({ error: 'Market parameter is required' });
  }

  try {
    const details = await prisma.createTicket.findMany({
      where: { market },
      select: {
        ticketId:true,
        ntid: true,
        fullname: true,
        status:{select:{name:true}},
        createdAt:true,
        completedAt:true
      },
    });

    res.status(200).json(details);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export default detailedTicketsWithMarket;
