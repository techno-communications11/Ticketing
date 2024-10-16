import React from 'react';
import TicketsTable from './TicketTable';

const OpenedTickets = () => {
  const statusIds = ['2'];  
  return <TicketsTable statusIds={statusIds} text={'Opened'} />;
};

export default OpenedTickets;

