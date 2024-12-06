import React from 'react';
import TicketsTable from './TicketTable';
import getDecodedToken from '../universalComponents/decodeToken';

const OpenedTickets = () => {
  const statusIds = ['2'];  
  const logedInuser=getDecodedToken().id;
  return <TicketsTable statusIds={statusIds} text={'Opened'} logedInuser={logedInuser} />;
};

export default OpenedTickets;

