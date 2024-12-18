import prisma from "../lib/prisma.js";

const NewTicket = async (req, res) => {
    const userId = req.user.id;
    const status = req.query.status;
    console.log(userId,status,"usid")

    if (!userId) {
        return res.status(400).json('Invalid user ID');
    }
    const role=await prisma.user.findUnique({
        where:{id:userId},
        select:{role:true}
    })
     if(role==='admin')
    {
        try {
            const tickets = await prisma.createTicket.findMany({
                where: {
                    status: status
                },
                select: {
                    id: true,
                    ntid: true,
                    fullname: true,
                    status:{select:{name:true}},
                    createdAt: true,
                    completedAt:true,
                },
            });
            res.status(200).json(tickets);

        } catch (error) {
            res.status(500).json('Data not fetched from server');
        }
        
    }
    
      
}

export default NewTicket;
