import prisma from "../lib/prisma.js";

const DepartmentWiseTickets = async (req, res) => {
    const { department, statusId } = req.query;

    if (!department || statusId === undefined) {
        return res.status(400).json({ error: 'department and statusId are required' });
    }

    try {
        // Find the department ID
        const departmentRecord = await prisma.department.findUnique({
            where: { name: department },
            select: { id: true }
        });

        if (!departmentRecord) {
            return res.status(404).json({ error: 'Department not found' });
        }

        const departmentId = departmentRecord.id;
        const statusCondition = statusId === "0" ? { in: ['1', '2', '3', '4', '5'] } : statusId;

        // Fetch tickets along with `openedBy`
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
                isSettled:true, 
            }
        });
        console.log(tickets,"oooooooo")

        // Fetch user names for `openedBy`
        const ticketsWithOpeners = await Promise.all(
            tickets.map(async (ticket) => {
                if (ticket.openedBy) {
                    const user = await prisma.user.findUnique({
                        where: { id: ticket.openedBy },
                        select: { fullname: true }
                    });
                    return {
                        ...ticket,
                        openedByFullName: user?.fullname || null,
                    };
                }
                return { ...ticket, openedByFullName: null };
            })
        );

        console.log("Fetched tickets with openers:", ticketsWithOpeners);

        res.status(200).json(ticketsWithOpeners);

    } catch (error) {
        console.error('Error fetching tickets:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export default DepartmentWiseTickets;
