import prisma from "../lib/prisma.js";

const fetchStores = async (req, res) => {
  const { selectedMarket } = req.query; // Use req.query if sent as a query parameter.
  console.log(selectedMarket,"selecm")

  if (!selectedMarket) {
    return res.status(400).json({ error: 'selectedMarket parameter is required' });
  }

  try {
    const marketid = await prisma.markets.findUnique({
      where: { market: selectedMarket },
    });
    console.log(marketid)

    if (!marketid) {
      return res.status(404).json({ error: 'Market not found' });
    }

    const details = await prisma.marketStructure.findMany({
      where: { marketId: marketid.id },
      select: {
        storeName: true,
      },
    });
 console.log(details,"dts")
    if (!details || details.length === 0) {
      return res.status(404).json({ error: 'No stores found for the selected market' });
    }

    res.status(200).json(details);
  } catch (error) {
    console.error('Error fetching store details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export default fetchStores;
