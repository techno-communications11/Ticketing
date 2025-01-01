import prisma from "../lib/prisma.js";

const DM_Insights = async (req, res) => {
    try {
        // Fetch distinct DM names from createTicket based on departmentId '19'
        const dmUsers = await prisma.createTicket.findMany({
            where: { departmentId: '19' },
            distinct: ['assignedTo'], // Ensure unique DMs
            select: { assignedTo: true }
        });

        // Extract DM names
        const dmNames = dmUsers.map(user => user.assignedTo);

        // Initialize an object to store counts per DM (assignedTo)
        const dmInsights = {};

        // Fetch tickets for all DMs at once
        const ticketsData = await prisma.createTicket.findMany({
            where: { assignedTo: { in: dmNames } },
            select: {
                assignedTo: true,
                status: { select: { name: true } },
                requestreopen: true
            }
        });

        // Process tickets data and calculate the counts per DM
        ticketsData.forEach(ticket => {
            const dmName = ticket.assignedTo;

            // Initialize the DM entry if not already present
            if (!dmInsights[dmName]) {
                dmInsights[dmName] = {
                    totalTickets: 0,
                    inProgress: 0,
                    new: 0,
                    opened: 0,
                    reopened: 0,
                    completed: 0,
                    requestreopen: 0
                };
            }

            const statusName = ticket.status.name;

            // Increment counts based on status
            switch (statusName) {
                case 'inprogress':
                    dmInsights[dmName].inProgress++;
                    break;
                case 'reopened':
                    dmInsights[dmName].reopened++;
                    break;
                case 'completed':
                    dmInsights[dmName].completed++;
                    break;
                case 'opened':
                    dmInsights[dmName].opened++;
                    break;
                case 'new':
                    dmInsights[dmName].new++;
                    break;
            }

            // Increment the total tickets count for statuses only
            if (statusName !== 'requestreopen') {
                dmInsights[dmName].totalTickets++;
            }

            // Increment request reopen count independently
            if (ticket.requestreopen) {
                dmInsights[dmName].requestreopen++;
            }
        });

        // Send the response with the DM insights data
        res.status(200).json(dmInsights);

    } catch (error) {
        console.error('Error fetching DM insights:', error);
        res.status(500).json({ error: 'Failed to fetch DM insights.' });
    }
};

export default DM_Insights;
