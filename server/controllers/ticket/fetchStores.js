import prisma from "../lib/prisma.js";

const fetchStores = async (req, res) => {
  const { selectedMarket } = req.query;
  console.log("Selected Market:", selectedMarket);

  if (!selectedMarket) {
    return res.status(400).json({ error: 'selectedMarket parameter is required' });
  }

  try {
    // Fetch the market ID based on the selected market
    const marketid = await prisma.markets.findUnique({
      where: { market: selectedMarket },
      select: { id: true }  // Ensure we only fetch the ID
    });
    console.log("Market ID:", marketid);

    if (!marketid) {
      return res.status(404).json({ error: 'Market not found' });
    }

    // Fetch stores related to the market
    const details = await prisma.marketStructure.findMany({
      where: { marketId: marketid.id },
      select: { storeName: true },
      take: 100,  // Optional: limit the number of stores fetched, adjust as needed
    });

    console.log("Fetched store details:", details);

    if (!details || details.length === 0) {
      return res.status(404).json({ error: 'No stores found for the selected market' });
    }

    res.status(200).json(details);

  } catch (error) {
    console.error('Error fetching store details:', error.message, error.stack);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

export default fetchStores;
