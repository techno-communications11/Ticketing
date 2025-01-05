function FilterLogic(tickets, ntidFilter, createdAt, completedAt, statusFilter, fullnameFilter) {
  if (!Array.isArray(tickets)) {
    // console.error('Invalid tickets input:', tickets);
    return []; // Return an empty array if `tickets` is not valid
  }

  return tickets.filter(ticket => {
    const matchesNTID = ntidFilter ? ticket.ntid.includes(ntidFilter) : true;
    const matchesName = fullnameFilter 
      ? ticket.fullname?.toLowerCase().includes(fullnameFilter.toLowerCase()) 
      : true;
    const matchesStatus = statusFilter
      ? ticket.status?.name.toLowerCase() === statusFilter.toLowerCase() 
      : ticket;
    const matchesCreatedAt = createdAt 
      ? new Date(ticket.createdAt).toISOString().split('T')[0] = new Date(createdAt).toISOString().split('T')[0] 
      : true;
    const matchesCompletedAt = completedAt 
      ? new Date(ticket.completedAt).toISOString().split('T')[0] = new Date(completedAt).toISOString().split('T')[0] 
      : true;

    return matchesNTID && matchesName && matchesStatus && matchesCreatedAt && matchesCompletedAt;
  });
}

export default FilterLogic;
