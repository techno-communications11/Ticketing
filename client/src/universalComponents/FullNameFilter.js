import React from 'react';
import { Form } from 'react-bootstrap';
import { useRef } from 'react';
import { useOutsideClick } from './useOutsideClick';

function  FullNameFilter({fullnameFilter, setFullnameFilter,setFullnameFilterToggle,setCurrentPage }) {
  const dropdownRef = useRef(null);
  useOutsideClick(dropdownRef, () => setFullnameFilterToggle(false));
  return (
    <Form.Control
    ref={dropdownRef}
      type="text"
      placeholder="Enter Fullname"
      value={fullnameFilter}
      onChange={(e) => {setFullnameFilter(e.target.value);setCurrentPage(1)}}
      className="shadow-sm"
    />
  );
}

export default FullNameFilter;
