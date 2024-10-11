import prisma from "../lib/prisma.js";

const GetMarketTickets = async (req, res) => {
    const { ntid } = req.query; // Get NTID from query parameters
    console.log(ntid, "nti"); // Log NTID for debugging

    // Check if NTID is provided
    if (!ntid) {
        return res.status(400).json({ error: 'NTID required' }); // Return 400 if NTID is missing
    }

    // Fetch the doorCode for the user based on NTID
    const doorCodeRecord = await prisma.user.findUnique({
        where: { ntid },
        select: { DoorCode: true }
    });

    // Check if doorCode was found
    if (!doorCodeRecord) {
        return res.status(404).json({ error: 'Door code not found' }); // Return 404 if user not found
    }

    const doorCode = doorCodeRecord.DoorCode; // Extract doorCode

    // Fetch the market structure based on doorCode
    const marketRecord = await prisma.marketStructure.findUnique({
        where: { doorCode }, // Use doorCode value here
        include: {
            market: { // Include the related market record
                select: {
                    market: true, // Assuming the market has a 'name' field
                },
            },
        },
        
    });

    // Check if the market record was found
    if (!marketRecord) {
        return res.status(404).json({ error: 'Market not found' }); // Handle case if market not found
    }

    const market = marketRecord.market; // Extract the market

    console.log(market, 'marketfff'); // Log the market for debugging

    // Fetch tickets based on the market name
    const tickets = await prisma.createTicket.findMany({
        where: { market: market.market },
        select: {
            ticketId: true,
            ntid: true,
            fullname: true,
            status:{
                select:{
                    name:true,
                }
            }, market:true,
            createdAt: true,
            completedAt:true,
        }, // Use market.name to match tickets
    });
 console.log(tickets)
    // Return the fetched tickets
    res.status(200).json(tickets);
};

export default GetMarketTickets;
