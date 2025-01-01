import prisma from "../lib/prisma.js";

export const StoreMarket = async (req, res) => {
  const { ntid } = req.query;

  // Validate that ntid is provided
  if (!ntid) {
    return res.status(400).json({ message: "NTID is required" });
  }

  try {
    // Find user by ntid
    const user = await prisma.user.findUnique({
      where: { ntid: ntid },
    });

    // Check if the user exists
    if (!user) {
      return res.status(401).json({ message: "Invalid user data" });
    }

    // Log user info for debugging
    console.log(`User found: ${user.fullname}`);

    // Fetch associated market and store data
    const findData = await prisma.marketStructure.findMany({
      where: {
        userId: user.id 
      },
      select: {
        market: true,
        storeName: true
      }
    });

    // If no data found, inform the user
    if (!findData.length) {
      return res.status(404).json({ message: "No store data found for the user" });
    }

    // Send the found data
    res.status(200).json(findData);
  } catch (error) {
    console.error("Error fetching store market data:", error); // Log detailed error for debugging
    res.status(500).json({ message: "Server error" });
  }
};
