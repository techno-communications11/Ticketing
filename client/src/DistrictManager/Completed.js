import React from 'react';
import TicketsTable from './TicketTable';

const New = () => {
  const statusIds = ['4']; 
  return <TicketsTable statusIds={statusIds} requestreopen={null} text={'Completed'}/>;
};

export default New;