import React from 'react';
import Ticket from '../Department/Ticket';
import getDecodedToken from '../universalComponents/decodeToken';

function OpenedMA() {
  const indifullname = getDecodedToken()?.fullname;
  return (
    <Ticket indifullname={indifullname} departmentId={'12'} statusId={'3'} openedbyUser={true} />
  );
}

export default OpenedMA;
