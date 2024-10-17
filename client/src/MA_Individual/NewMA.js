import React, { useState } from 'react';
import Ticket from '../Department/Ticket';
import getDecodedToken from '../universalComponents/decodeToken';

function NewMA() {
  const indifullname = getDecodedToken()?.fullname;
  return (
      <Ticket 
        indifullname={indifullname} 
        departmentId={'12'} 
        statusId={'3'} 
        openedbyUser={false}
      />
  );
}

export default NewMA;
