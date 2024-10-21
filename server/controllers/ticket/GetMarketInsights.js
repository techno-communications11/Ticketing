import prisma from "../lib/prisma.js";

const GetMarketInsights = async (req, res) => {
  const { fullname } = req.query;
  console.log(fullname,"fn")

  if (!fullname) {
    return res.status(400).json("Need fullname");
  }

  // Fetch tickets assigned to the provided fullname and get their status
  const tickets = await prisma.createTicket.findMany({
    where: { assignedTo: fullname },
    select: { status: { select: { name: true } } }
  });
  console.log(tickets,"tics")

  // Initialize an empty object to hold the counts of each status
  const counts = {};

  // Loop through the tickets and count occurrences of each status
  tickets.forEach(ticket => {
    const statusName = ticket.status.name;

    if (counts[statusName]) {
      counts[statusName] += 1;
    } else {
      counts[statusName] = 1;
    }
  });
  counts.Total=counts.completed+counts.inprogress+counts.opened+counts.reopened;
 console.log(counts,"ccser")
  return res.status(200).json(counts);
};

export default GetMarketInsights;
