import React from 'react';
import TicketsTable from './TicketTable';

const New = () => {
  const statusIds = ['1','5']; 
  return <TicketsTable statusIds={statusIds}  />;
};

export default New;