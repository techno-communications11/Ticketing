import React from 'react';
import Ticket from './Ticket';
import getDecodedToken from '../universalComponents/decodeToken';

function DepartmentOpened() {
  const userId = getDecodedToken()?.id;

  return (
    <Ticket status={'3'} openedBy={userId}  fullname={null} />
  );
}

export default DepartmentOpened;
