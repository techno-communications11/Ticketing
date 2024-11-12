import prisma from "../lib/prisma.js";

const DepartmentWiseTickets = async (req, res) => {
    const { department, statusId } = req.query;
    console.log(department, typeof(statusId));

    if (!department || statusId === undefined) {
        return res.status(400).json({ error: 'department and statusId are required' });
    }

    try {
        const departmentRecord = await prisma.department.findUnique({
            where: { name: department },
            select: { id: true }
        });
        
        if (!departmentRecord) {
            return res.status(404).json({ error: 'Department not found' });
        }
        
        const departmentId = departmentRecord.id;
        const statusCondition = statusId === "0" ? { in: ['1', '2', '3', '4', '5'] } : statusId

        const tickets = await prisma.createTicket.findMany({
            where: {
                departmentId: departmentId,
                statusId: statusCondition
            },
            select: {
                ticketId: true,
                ntid: true,
                fullname: true,
                departmentId: true,
                status: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                createdAt: true,
                completedAt: true,
                openedBy: true,
                assignToTeam: true,
            }
        });
        
        console.log("Fetched tickets:", tickets);

        res.status(200).json(tickets);

    } catch (error) {
        console.error('Error fetching tickets:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export default DepartmentWiseTickets;
