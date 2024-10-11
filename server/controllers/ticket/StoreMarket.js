import prisma from "../lib/prisma.js";

export const StoreMarket = async (req, res) => {
  const { ntid } = req.query;

  if (!ntid) {
    return res.status(400).json({ message: "NTID is required" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { ntid: ntid },
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid user data" });
    }

    const findData = await prisma.marketStructure.findMany({
      where: {
        userId: user.id 
      },
      select: {
        market: true,
        storeName: true
      }
    });

    res.status(200).json(findData);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
