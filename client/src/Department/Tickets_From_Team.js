import React from 'react';
import Ticket from './Ticket';
import getDecodedToken from '../universalComponents/decodeToken';

function Tickets_From_Team() {
  const fullname = getDecodedToken()?.fullname;
  // const openedBy=null;
  // console.log(fullname,"fulname")
  return <Ticket fullname={fullname}  />;
}

export default Tickets_From_Team;
