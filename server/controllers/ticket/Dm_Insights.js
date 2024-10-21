import prisma from "../lib/prisma.js";

const DM_Insights = async (req, res) => {
    try {
        // Fetch tickets data based on the departmentId
        const ticketsData = await prisma.createTicket.findMany({
            where: { departmentId: '19' },
            select: {
                status: {
                    select: { name: true }
                },
                assignedTo: true,
                requestreopen: true,
            }
        });
        console.log(ticketsData,'ticketsData')
        // Initialize an object to store counts per DM (assignedTo)
        const dmInsights = {};

        // Process each ticket and accumulate counts for each DM
        ticketsData.forEach(ticket => {
            const assignedUser = ticket.assignedTo; // DM name
            const statusName = ticket.status.name;
            const isReopenedRequest = ticket.requestreopen; // Boolean for reopen request

            // Initialize the data structure for the DM if not already present
            if (!dmInsights[assignedUser]) {
                dmInsights[assignedUser] = {
                    totalTickets: 0,
                    inProgress: 0,
                    opened:0,
                    reopened: 0,
                    completed: 0,
                    requestReopenCount: 0
                };
            }

            // Increment the total number of tickets for the DM
            dmInsights[assignedUser].totalTickets++;

            // Increment status-based counts
            if (statusName === 'inprogress') {
                dmInsights[assignedUser].inProgress++;
            } else if (statusName === 'reopened') {
                dmInsights[assignedUser].reopened++;
            } else if (statusName === 'completed') {
                dmInsights[assignedUser].completed++;
            }else if(statusName==='opened'){
                dmInsights[assignedUser].opened++;
            }

            // If the request to reopen is true, increment the reopen count
            if (isReopenedRequest) {
                dmInsights[assignedUser].requestReopenCount++;
            }
        });

        console.log(dmInsights,'dmInsights')
        // Send the response with the DM insights data
        res.status(200).json(dmInsights);
    } catch (error) {
        console.error('Error fetching DM insights:', error);
        res.status(500).json({ error: 'Failed to fetch DM insights.' });
    }
};

export default DM_Insights;
