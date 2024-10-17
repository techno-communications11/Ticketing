import React from 'react';
import Ticket from '../Department/Ticket';
import getDecodedToken from '../universalComponents/decodeToken';

function CompletedMA() {
  const indifullname = getDecodedToken()?.fullname;
  return (
    <Ticket indifullname={indifullname} departmentId={'12'} statusId={'4'} />
  );
}

export default CompletedMA;
