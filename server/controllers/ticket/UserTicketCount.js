import prisma from "../lib/prisma.js";

const UserTicketCount = async (req, res) => {
    try {
        // const userId = req.user.id;
        const { ntid } = req.query;
        console.log(ntid,"user ntid  got from  client")

        if (!ntid) {
            return res.status(400).json({ message: 'userId parameter is required' });
        }

        // Fetching the tickets for the user
        const tickets = await prisma.createTicket.findMany({
            where: {
                ntid
            },
            select: {
                status: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        console.log(tickets, "Fetched tickets");

        // Counting statuses
        const statusCountMap = tickets.reduce((acc, ticket) => {
            const statusId = ticket.status.name; // Accessing status ID
            acc[statusId] = (acc[statusId] || 0) + 1; // Incrementing count
            return acc;
        }, {});

        console.log(statusCountMap, "Count ");

        // Send the response back to the client
        res.status(200).json(statusCountMap);
    } catch (error) {
        console.error('Failed to retrieve data:', error); // Log the error details
        res.status(500).json({ message: 'Failed to retrieve data' });
    }
};

export default UserTicketCount;
