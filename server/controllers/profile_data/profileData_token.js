import prisma from "../lib/prisma.js";

const GetProfileData_token = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Fetch user data
    const user = await prisma.user.findUnique({
      where: {
        id: userId
      },
    });

    if (!user) {
      console.error(`User with ID ${userId} not found`);
      return res.status(404).json({ error: 'User not found' });
    }

    // Fetch the department name using the user's departmentId
    const department = await prisma.department.findUnique({
      where: { id: user.departmentId },
      select: { name: true }
    });

    // Fetch the market data
    const marketData = await prisma.marketStructure.findUnique({
      where: { doorCode: user.DoorCode },
      select: {
        market: { select: { market: true } }, // Fetch the market name
        dmName: true,
      }
    });

    // Construct the response object
    const response = {
      ...user,
      departmentName: department ? department.name : null, 
      market: marketData?.market?.market || null, // Safely accessing market name
      dmName: marketData?.dmName || null, // Safely accessing dmName
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching profile data:", error); // More specific error logging
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export default GetProfileData_token;
