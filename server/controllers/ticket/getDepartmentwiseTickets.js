import prisma from "../lib/prisma.js";

const GetDepartmentWisetickets = async (req, res) => {
    const { ntid } = req.query; 

    if (!ntid) {
        return res.status(400).json({ error: 'NTID required' }); 
    }

    try {
        const user = await prisma.user.findUnique({
            where: { ntid },
            select: { departmentId: true }
        });
        console.log(user,"uisrs")

        if (!user || !user.departmentId) {
            return res.status(404).json({ error: 'User or department not found' });
        }

        const departmentId = user.departmentId;
       

        const tickets = await prisma.createTicket.findMany({
            where: { departmentId },
            select: {
                ticketId: true,
                ntid: true,
                fullname: true,
                departmentId:true,
                status: {
                    select: {
                        id: true,
                        name: true, 
                    }
                },
                createdAt: true,
                completedAt: true,
                openedBy: true,
                assignToTeam:true,
                isSettled:true,
            }
        });
        console.log(tickets)

        res.status(200).json(tickets);

    } catch (error) {
        console.error('Error fetching tickets:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export default GetDepartmentWisetickets;
