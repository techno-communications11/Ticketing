import React from 'react'
import Ticket from './Ticket'
import getDecodedToken from '../universalComponents/decodeToken';
function DepartmentWiseTickets() {
  const userId = getDecodedToken()?.id;
  return  (<Ticket status={'4'} openedBy={userId} fullname={null} />);
  
}

export default DepartmentWiseTickets
