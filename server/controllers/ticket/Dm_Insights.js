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

        // Fetch tickets assigned to each DM and calculate the counts
        for (const dmName of dmNames) {
            const ticketsData = await prisma.createTicket.findMany({
                where: { assignedTo: dmName },
                select: {
                    status: { select: { name: true } },
                    requestreopen: true
                }
            });
            console.log(ticketsData,"td")

            // Initialize the DM entry if not already present
            dmInsights[dmName] = {
                totalTickets: 0,
                inProgress: 0,
                new: 0,
                opened: 0,
                reopened: 0,
                completed: 0,
                requestreopen: 0
            };

            // Process each ticket for the current DM
            ticketsData.forEach(ticket => {
                const statusName = ticket.status.name;

                // Increment counts based on status
                if (statusName === 'inprogress') {
                    dmInsights[dmName].inProgress++;
                } else if (statusName === 'reopened') {
                    dmInsights[dmName].reopened++;
                } else if (statusName === 'completed') {
                    dmInsights[dmName].completed++;
                } else if (statusName === 'opened') {
                    dmInsights[dmName].opened++;
                } else if (statusName === 'new') {
                    dmInsights[dmName].new++;
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
        }

        // Send the response with the DM insights data
        console.log(dmInsights, 'dmInsights');
        res.status(200).json(dmInsights);

    } catch (error) {
        console.error('Error fetching DM insights:', error);
        res.status(500).json({ error: 'Failed to fetch DM insights.' });
    }
};

export default DM_Insights;
