import prisma from "../lib/prisma.js";

const userData = async (req, res) => {
    try {
        // Fetch user data without passwords
        const responseData = await prisma.user.findMany({
            select: {
                ntid: true,
                fullname: true,
                DoorCode: true,
                password:true,
                department: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });
        console.log(responseData,"resp")

        const doorCodes = responseData.map(user => user.DoorCode).filter(Boolean); // Filter out any undefined values

        const additionalData = await prisma.marketStructure.findMany({
            where: {
                doorCode: {
                    in: doorCodes,
                },
            },
            select: {
                doorCode: true,
                dmName: true,
                market: { // Include related market data
                    select: { market: true }, // Fetch the market name
                },
            },
        });

        // Merge user data with additional market data
        const data = responseData.map(user => {
            const additional = additionalData.find(add => add.doorCode === user.DoorCode);
            return {
                ...user,
                market: additional ? additional.market : null,
                dmName: additional ? additional.dmName : null
            };
        });

        // Respond with user data excluding passwords
        res.status(200).json(data);
    } catch (error) {
        console.error("Error fetching user data:", error); // Log the error for debugging
        res.status(500).json({ error: 'Internal server error' });
    }
};

export default userData;
