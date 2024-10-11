import prisma from '../lib/prisma.js';

const registerMarket = async (req, res) => {
  const { boiId, dmName,storeName, market, doorCode, storeAddress } = req.body;
  try {

    const existingUser = await prisma.marketStructure.findUnique({
      where: { boiId },
    });

    if (existingUser) {
      return res.status(400).json({ message: " market already taken" });
    }

   

    const newUser = await prisma.marketStructure.create({
      data: {
        boiId,
        dmName,
        storeName,
        market,
        doorCode,
        StoreAddress:storeAddress,
      },
    });

    res.status(201).json({ message: "User registered successfully", user: newUser });

  } catch (error) {
    res.status(500).json({ message: "Failed to register" });
  }
};

export default registerMarket;
