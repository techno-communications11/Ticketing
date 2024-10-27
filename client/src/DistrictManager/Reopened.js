import React from 'react'
import TicketsTable from './TicketTable';

function Reopened() {
      const statusIds = ['5']; 
      return <TicketsTable statusIds={statusIds} text={'Reopened'}  />;
}

export default Reopened
