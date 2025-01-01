import prisma from "../lib/prisma.js";

const NewTicket = async (req, res) => {
    const userId = req.user.id;
    const status = req.query.status;
    console.log(userId, status, "usid");

    if (!userId) {
        return res.status(400).json('Invalid user ID');
    }

    // Validate status query parameter
    if (!status) {
        return res.status(400).json('Status parameter is required');
    }

    try {
        const role = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true }
        });

        if (role !== 'admin') {
            return res.status(403).json('Forbidden: You do not have admin rights');
        }

        // Fetch tickets if the user is an admin
        const tickets = await prisma.createTicket.findMany({
            where: {
                status: status
            },
            select: {
                id: true,
                ntid: true,
                fullname: true,
                status: { select: { name: true } },
                createdAt: true,
                completedAt: true,
            },
        });

        return res.status(200).json(tickets);

    } catch (error) {
        console.error('Error fetching tickets:', error);  // Log error for debugging
        return res.status(500).json('Data not fetched from server');
    }
};

export default NewTicket;
