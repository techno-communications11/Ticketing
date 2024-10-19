import React from 'react';
import Ticket from './Ticket';

function DepartmentOpened() {
  return (
    <Ticket statusId={'3'} text="Opened" openedbyUser={true} />
  );
}

export default DepartmentOpened;
