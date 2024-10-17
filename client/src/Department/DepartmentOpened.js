import React from 'react';
import Ticket from './Ticket';

function DepartmentOpened() {
  return (
    <Ticket statusId={'3'} text="Opened" openedbyUser={true} departmentId={'23'} />
  );
}

export default DepartmentOpened;
