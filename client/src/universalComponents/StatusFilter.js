import React from 'react';
import { useOutsideClick } from "./useOutsideClick";
import { useRef } from 'react';

const statuses = ['All','New', 'Opened', 'Inprogress', 'Completed', 'ReOpened'];

function StatusFilter({setStatusFilter, setStatusToggle,setCurrentPage}) {
  const dropdownRef = useRef(null);
  useOutsideClick(dropdownRef, () => setStatusToggle(false));

  return (
    <div ref={dropdownRef} style={{ zIndex: 2 }}>
      {statuses.map((status) => (
        <div
          key={status}
          style={{ cursor: 'pointer' }}
          className="shadow-lg fw-medium text-primary dropdown-item text-center text-capitalize"
          onClick={() => { !status.includes('All')?setStatusFilter(status):setStatusFilter(null); setCurrentPage(1)}}
          aria-label={`Filter by ${status} status`}
        >
          {status}
        </div>
      ))}
    </div>
  );
}

export default StatusFilter;
