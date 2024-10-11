 import prisma from "../lib/prisma.js";
  const comments=async(req,res)=>{
    const{ticketId,comment,createdBy}=req.body;
    console.log(req.body)
    if(!ticketId||!comment||!createdBy){
        return res.status(400).send('Missing form fields.');
    }
    const newComment = {
        comment:comment,
        createdBy,
        createdAt: new Date(),
      }; 

      const updatedTicket = await prisma.createTicket.update({
        where: { ticketId: ticketId },
        data: {
          comments: {
            create: newComment,  // Adds the new comment
          },
        },
        include: { comments: true },  // To return the updated ticket with comments
      });
    
    res.json({
        message:'comment created successfully',
        updatedTicket,
    })
 }
 export default comments