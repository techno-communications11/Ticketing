import React from 'react';
import TicketsTable from './TicketTable';

const OpenedTickets = () => {
  const statusIds = ['2'];  
  return <TicketsTable statusIds={statusIds} />;
};

export default OpenedTickets;

