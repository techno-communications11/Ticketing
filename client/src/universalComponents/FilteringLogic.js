const filterByNtid = (ticket, ntidFilter) => {
    return ntidFilter.trim() ? ticket.ntid === ntidFilter.trim() : true;
  };
  
  const filterByStatus = (ticket, statusFilter) => {
    return statusFilter ? ticket.status.name.includes(statusFilter.toLowerCase()) : true;
  };
  
  const filterByDate = (ticket, dateFilter) => {
    const ticketDate = new Date(ticket.createdAt).toISOString().split('T')[0];
    const filterDate = dateFilter ? new Date(dateFilter).toISOString().split('T')[0] : null;
    return filterDate ? ticketDate === filterDate : true;
  };
  
  const FilterLogic = (tickets, ntidFilter, dateFilter, statusFilter) => {
    return tickets.filter(ticket => {
      return (
        filterByNtid(ticket, ntidFilter) &&
        filterByStatus(ticket, statusFilter) &&
        filterByDate(ticket, dateFilter)
      );
    });
  };
  
  export default FilterLogic;
  