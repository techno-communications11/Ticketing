import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useOutsideClick } from './useOutsideClick';
import { useRef } from 'react';

function CreatedAt({ createdAt, setCreatedAt, setCreatedAtToggle,setCurrentPage }) {
  const dropdownRef = useRef(null);
  useOutsideClick(dropdownRef, () => setCreatedAtToggle(false));
  return (
    <div className="shadow-sm p-3 my-2" ref={dropdownRef}>
      <DatePicker
        selected={createdAt}
        onChange={
          (date) => {
            setCreatedAt(date);setCurrentPage(1)
          }}
        inline
        placeholderText="Select a date"
        className="form-control" // Bootstrap styling
        aria-label="Select a date" // Accessibility
      />
    </div>
  );
}



export default CreatedAt;
