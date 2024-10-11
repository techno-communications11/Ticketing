import prisma from "../lib/prisma.js";

export const searchUser = async (req, res) => {
  const input = req.query.query; 
  console.log("Received query:", input); 

  try {
    // Ensure query is defined
    if (!input || typeof input !== 'string') {
      return res.status(400).json({ error: 'Query parameter is required and must be a string.' });
    }

    // Search users with dynamic parameters
    const results = await prisma.user.findMany({
      where: {
        OR: [
          { ntid: { contains: input, mode: 'insensitive' } },
          { fullname: { contains: input, mode: 'insensitive' } },
          {
            market: { select: { market: true } }
          },
          { manager: { contains: input, mode: 'insensitive' } } 
        ]
      }
    });
    console.log(input, results)
    res.json(results);
  } catch (error) {
    console.error("Error during user search:", error);
    res.status(500).json({ error: error.message });
  }
};
