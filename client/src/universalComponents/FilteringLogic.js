const filterByNtid = (ticket, ntidFilter) => {
  return ntidFilter.trim() ? ticket.ntid === ntidFilter.trim() : true;
};

const filterByStatus = (ticket, statusFilter) => {
  return statusFilter ? ticket.status.name.toLowerCase()?.includes(statusFilter.toLowerCase()) : true;
};

const isValidDate = (dateString) => {
  const date = new Date(dateString);
  return !isNaN(date); 
};

const FilterLogic = (tickets, ntidFilter, dateFilter, statusFilter) => {
  return tickets.filter(ticket => {
    const dateMatches = !dateFilter || (isValidDate(ticket.createdAt) && new Date(ticket.createdAt).toISOString().split('T')[0] === dateFilter);
    return (
      filterByNtid(ticket, ntidFilter) &&
      filterByStatus(ticket, statusFilter) &&
      dateMatches
    );
  });
};

export default FilterLogic;
