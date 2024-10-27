import prisma from "../lib/prisma.js"; // Ensure this path is correct

const allDepartCounts = async (req, res) => {
    try {
        // Fetch all tickets with department and status details
        const tickets = await prisma.createTicket.findMany({
            include: {
                department: {
                    select: {
                        name: true, // Include the department name
                    },
                },
                status: {
                    select: {
                        name: true, // Include the status name
                    },
                },
            },
        });
        console.log(tickets, "tics");

        // Initialize counts object
        const counts = {};

        // Count tickets by department and status
        tickets.forEach(ticket => {
            const departmentName = ticket.department?.name; // Use optional chaining
            const statusName = ticket.status?.name; // Use optional chaining

            // Check if department name is defined
            if (!departmentName) {
                console.warn('Ticket has no department name', ticket);
                return; // Skip this ticket if department name is missing
            }

            // Initialize department entry if it doesn't exist
            if (!counts[departmentName]) {
                counts[departmentName] = {
                    total: 0,
                    new: 0,
                    opened: 0,
                    inProgress: 0,
                    completed: 0,
                    reopened: 0,
                };
            }

            // Increment counts
            counts[departmentName].total += 1; // Count total tickets

            // Correct the property name for "In Progress" count
            if (statusName === 'new') counts[departmentName].new += 1;
            else if (statusName === 'opened') counts[departmentName].opened += 1;
            else if (statusName === 'inprogress') counts[departmentName].inProgress += 1; // Changed to `inProgress`
            else if (statusName === 'completed') counts[departmentName].completed += 1;
            else if (statusName === 'reopened') counts[departmentName].reopened += 1;
        });

        console.log(counts); // Log the final counts
        // Return counts as a response
        res.json(counts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch ticket counts' });
    }
};

export default allDepartCounts;
