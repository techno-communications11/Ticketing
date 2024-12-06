import React from 'react'
import Ticket from './Ticket'
import getDecodedToken from '../universalComponents/decodeToken';
function DepartmentWiseTickets() {
  const openedBy=getDecodedToken().id
  return  (<Ticket status={'4'} openedBy={openedBy}/>);
  
}

export default DepartmentWiseTickets
