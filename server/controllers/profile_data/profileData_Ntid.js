import prisma from "../lib/prisma.js";

const GetProfileData_NTID = async (req, res) => {
  try {
    const id = req.user.id;

    if (!id) {
      return res.status(400).json({ message: "Incorrect ID" });
    }

    const user = await prisma.user.findUnique({
      where: { id: id },
      select: {
        ntid: true,
        fullname: true,
        DoorCode: true, 
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const doorCode = user.DoorCode;

    if (!doorCode) {
      return res.status(400).json({ message: "Door Code not found for user" });
    }

    const market = await prisma.marketStructure.findUnique({
      where: { doorCode: doorCode }, 
      select: {
        market: { 
          select: { id:true,market: true },
      },
      },
    });
    console.log(market,'dats')

    if (!market) {
      return res.status(404).json({ message: "Market not found for the given door code" });
    }

    const selectedMarket = market.market.id;
    console.log(selectedMarket,"selected marklet")

    // Fetch stores related to the selected market
    const stores = await prisma.marketStructure.findMany({
      where: { 
        market: { // Assuming `markets` is the relation field
          id: selectedMarket // Use the correct field name to filter the market
        }
      },
      select: {
        storeName: true,
      },
    });
    
 console.log(stores,'stores')
    const result = { 
      ...user, 
      market: market.market|| 'No Market', // Handle null/undefined cases
      stores: stores.map(store => store.storeName) 
    };
    console.log(result,'res')

    res.status(200).json(result);
  } catch (error) {
    console.error("Error retrieving user data:", error); // More specific error logging
    res.status(500).json({ message: "Failed to retrieve user data" });
  }
};

export default GetProfileData_NTID;
