const filterByNtid = (ticket, ntidFilter) => {
    return ntidFilter.trim() ? ticket.ntid === ntidFilter.trim() : true;
  };
  
  const filterByStatus = (ticket, statusFilter) => {
    return statusFilter ? ticket.status.name.includes(statusFilter.toLowerCase()) : true;
  };
  
  const filterByDate = (ticket, dateFilter) => {
    // Convert ticket createdAt to local time and extract the yyyy-mm-dd part
    const ticketDate = new Date(ticket.createdAt);
  
    // Get the filter date (the date selected by the user)
    const filterDate = dateFilter ? new Date(dateFilter) : null;
  
    // Helper function to format a date object into a local yyyy-mm-dd format (ignoring time zones)
    const formatToLocalDate = (date) => {
      return date.toLocaleDateString('en-CA'); // yyyy-mm-dd format
    };
  
    // Compare the local date strings (yyyy-mm-dd) between ticketDate and filterDate
    return filterDate ? formatToLocalDate(ticketDate) === formatToLocalDate(filterDate) : true;
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
  