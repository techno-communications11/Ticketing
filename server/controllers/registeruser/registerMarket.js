import prisma from '../lib/prisma.js';

const registerMarket = async (req, res) => {
  const { bdiId, dmName, storeName, market, doorCode, storeAddress } = req.body;
  console.log(req.body,"nbbbn ")

  // Predefined markets
  const markets = [
    { _id: "1", market: "arizona" },
    { _id: "2", market: "colorado" },
    { _id: "3", market: "dallas" },
    { _id: "4", market: "el paso" },
    { _id: "5", market: "florida" },
    { _id: "6", market: "houston" },
    { _id: "7", market: "los angeles" },
    { _id: "8", market: "memphis" },
    { _id: "9", market: "nashville" },
    { _id: "10", market: "north carol" },
    { _id: "11", market: "sacramento" },
    { _id: "12", market: "san diego" },
    { _id: "13", market: "san francisco" },
    { _id: "14", market: "bay area" },
  ];

  try {
    // Check if market already exists
    const existingUser = await prisma.marketStructure.findUnique({
      where: { bdiId },
    });

    if (existingUser) {
      return res.status(400).json({ message: "Market already taken" });
    }

    // Match the provided market with the predefined list
    const matchedMarket = markets.find(
      (m) => m.market.toLowerCase() === (market || '').toLowerCase()
    );
    console.log(matchedMarket,"mmmr")

    // Create a new market structure entry
    const newUser = await prisma.marketStructure.create({
      data: {
        bdiId,
        dmName,
        storeName,
        marketId: matchedMarket ? matchedMarket._id : null,
        doorCode,
        storeAddress,
      },
    });

    res.status(201).json({ message: "User registered successfully", user: newUser });
  } catch (error) {
    console.error("Error registering market:", error);
    res.status(500).json({ message: "Failed to register market", error: error.message });
  }
};

export default registerMarket;
