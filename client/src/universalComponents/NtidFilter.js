import React from "react";
import { Form } from "react-bootstrap";
import { useOutsideClick } from "./useOutsideClick";
import { useRef } from "react";
import "../styles/NtidFilter.css"; // New custom CSS file

function NtidFilter({ ntidFilter, setntidFilter, setNtidFilterToggle, setCurrentPage }) {
  const dropdownRef = useRef(null);
  useOutsideClick(dropdownRef, () => setNtidFilterToggle(false));

  const handleChange = (e) => {
    setntidFilter(e.target.value);
    setCurrentPage(1);
  };

  return (
    <Form.Control
      ref={dropdownRef}
      type="text"
      placeholder="Enter NTID"
      value={ntidFilter}
      onChange={handleChange}
      className="ntid-filter-input"
      aria-label="Filter by NTID"
    />
  );
}

export default NtidFilter;