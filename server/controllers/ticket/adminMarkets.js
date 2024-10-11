import prisma from "../lib/prisma.js";

const adminMarket = async (req, res) => {
  try {
    console.log("Incoming request for market structures");

    const marketStructures = await prisma.marketStructure.findMany({
      include: {
        market: { 
          select: { market: true }, // Fetch the market name
        },
      },
    });

    console.log("Market Structures Retrieved:", marketStructures);

    // Check if market structures are empty
    if (marketStructures.length === 0) {
      console.log("No market data found");
      return res.status(404).json({ message: "No market data found" });
    }

    // Extract market names and remove duplicates
    const markets = [...new Set(marketStructures.map(structure => structure.market?.market))];

    console.log("Formatted Markets Data:", markets);

    // Send the markets data as a response
    res.status(200).json(markets);
  } catch (error) {
    console.error("Error retrieving market data:", error);
    res.status(500).json({ message: "Failed to retrieve data" });
  }
};

export default adminMarket;
