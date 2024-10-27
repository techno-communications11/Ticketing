import React from 'react'
import TicketsTable from './TicketTable';

function Reopened() {
      const statusIds = ['3']; 
      return <TicketsTable statusIds={statusIds} text={'Inprogress/Assigned'}  />;
}

export default Reopened