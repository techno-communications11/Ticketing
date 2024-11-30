import prisma from "../lib/prisma.js";

const UserTicketStatus = async (req, res) => {
    const { statusId,ntid } = req.query; // Access statusId from query parameters
//  console.log(ntid,"ytyffxh")
    if (!ntid) {
        return res.status(400).json('Invalid user ID');
    }

    if (!statusId) {
        return res.status(400).json('Status ID is required'); 
    }

    try {
        const tickets = await prisma.createTicket.findMany({
            where: {
                ntid: ntid,
                statusId: statusId
            },
            select: {
                ticketId: true,
                ntid: true,
                fullname: true,
                status:{
                    select:{
                        name:true,
                    }
                },
                createdAt: true,
                completedAt:true,
                requestreopen:true,
            },
        });
        // console.log(tickets,"kkkkkkkkkkkkkkkkk");
        res.status(200).json(tickets);
    } catch (error) {
        console.error('Error fetching tickets:', error); // Log the error for debugging
        res.status(500).json('Data not fetched from server');
    }
}

export default UserTicketStatus;
