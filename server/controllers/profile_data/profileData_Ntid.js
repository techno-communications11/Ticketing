import prisma from "../lib/prisma.js";

const GetProfileData_NTID = async (req, res) => {
  try {
    const id = req.user.id;
    console.log(id,"iddd")

    if (!id) {
      return res.status(400).json({ message: "Incorrect ID" });
    }

    // Fetch user details
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

    let market = null;
    let stores = [];

    // Fetch related data only if DoorCode is present
    if (user.DoorCode) {
      market = await prisma.marketStructure.findUnique({
        where: { doorCode: user.DoorCode },
        select: {
          market: {
            select: { id: true, market: true },
          },
        },
      });

      if (market) {
        const selectedMarketId = market.market.id;

        stores = await prisma.marketStructure.findMany({
          where: {
            market: {
              id: selectedMarketId,
            },
          },
          select: {
            storeName: true,
          },
        });
      }
    }

    // Prepare the final result
    const result = {
      ntid: user.ntid,
      fullname: user.fullname,
      doorCode: user.DoorCode || "No Door Code",
      market: market ? market.market : "No Market",
      stores: stores.map((store) => store.storeName),
    };

    res.status(200).json(result);
  } catch (error) {
    console.error("Error retrieving user data:", error);
    res.status(500).json({ message: "Failed to retrieve user data" });
  }
};

export default GetProfileData_NTID;
