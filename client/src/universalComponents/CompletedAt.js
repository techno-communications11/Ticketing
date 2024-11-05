
import React, { useRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useOutsideClick } from './useOutsideClick';

function CompletedAt({ completedAt,setCompletedAt,setCompletedAtToggle,setCurrentPage }) {
  const dropdownRef=useRef(null);
  useOutsideClick(dropdownRef,()=>setCompletedAtToggle(false))
  return (
    <div className="shadow-sm p-3 my-2" ref={dropdownRef}>
        <DatePicker
          selected={completedAt}
          onChange={(date) => {setCompletedAt(date);setCurrentPage(1)}}
          inline
        />
    </div>
  );
}

export default CompletedAt;

