import prisma from "../lib/prisma.js";

const GetDepartmentWisetickets = async (req, res) => {
    const { ntid } = req.query;

    // Validate if NTID is provided
    if (!ntid) {
        return res.status(400).json({ error: 'NTID is required' });
    }

    try {
        // Fetch user details to find their department
        const user = await prisma.user.findUnique({
            where: { ntid },
            select: { departmentId: true }
        });

        // Check if the user and departmentId exist
        if (!user || !user.departmentId) {
            return res.status(404).json({ error: 'User or department not found' });
        }

        const departmentId = user.departmentId;

        // Fetch all tickets for the given department
        const tickets = await prisma.createTicket.findMany({
            where: { departmentId },
            select: {
                ticketId: true,
                ntid: true,
                fullname: true,
                departmentId: true,
                status: {
                    select: {
                        id: true,
                        name: true, // Assuming status is related to a status model
                    }
                },
                createdAt: true,
                completedAt: true,
                openedBy: true,
                assignToTeam: true, // If this is a relationship, consider including related data
                isSettled: true,
            }
        });

        console.log(tickets); // You might want to replace this in production with more specific logging

        // Return the tickets in the response
        return res.status(200).json(tickets);

    } catch (error) {
        console.error('Error fetching tickets:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

export default GetDepartmentWisetickets;
