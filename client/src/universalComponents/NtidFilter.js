import React from 'react';
import { Form } from 'react-bootstrap';
import { useOutsideClick } from './useOutsideClick';
import { useRef } from 'react';

function NtidFilter({ ntidFilter, setntidFilter,setNtidFilterToggle,setCurrentPage }) {
  const dropdownRef = useRef(null);
  useOutsideClick(dropdownRef, () => setNtidFilterToggle(false));
  return (
    <Form.Control
    ref={dropdownRef}
      type="text"
      placeholder="Enter NTID"
      value={ntidFilter}
      onChange={(e) => {setntidFilter(e.target.value); setCurrentPage(1)}}
      className="shadow-sm"
    />
  );
}

export default NtidFilter;
