import React from 'react';
import TicketsTable from './TicketTable';

const New = () => {
  const statusIds = ['4']; 
  return <TicketsTable statusIds={statusIds} />;
};

export default New;