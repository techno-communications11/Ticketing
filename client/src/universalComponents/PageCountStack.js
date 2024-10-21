import React, { useState } from 'react';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';

function PageCountStack({ filteredTickets, currentPage, setCurrentPage,itemsPerPage }) {
  
  const pageCount = Math.ceil(filteredTickets?.length / itemsPerPage);
  const handleChangePage = (_, value) => setCurrentPage(value);
    return (
    <Stack spacing={2} alignItems="center" className="mt-3">
      <Pagination count={pageCount} page={currentPage} onChange={handleChangePage} color="primary" />
    </Stack>
  );
}

export default PageCountStack;
