import prisma from "../lib/prisma.js";

const GetRequestReopen = async (req, res) => {
    try {
        const { ntid } = req.query;
        console.log("get_request_reopen_tickets ", ntid);

        // Fetch the user's full name based on the NTID
        const user = await prisma.user.findUnique({
            where: { ntid },
            select: { fullname: true }
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Fetch tickets assigned to the user with the given statusId
        const tickets = await prisma.createTicket.findMany({
            where: {
                assignedTo: user.fullname,
                requestreopen: true
            },
            include:{
                status:{select:{name:true}}
            }
            
        });

        // Send the tickets as a response
        console.log(tickets)
        return res.status(200).json(tickets);

    } catch (error) {
        console.error("Error fetching completed tickets:", error);
        return res.status(500).json({ error: "Failed to fetch completed tickets" });
    }
};

export default GetRequestReopen;
