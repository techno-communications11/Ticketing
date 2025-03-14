import React from "react";
import { Form } from "react-bootstrap";
import { useRef } from "react";
import { useOutsideClick } from "./useOutsideClick";
import "../styles/FullNameFilter.css"; // New custom CSS file

function FullNameFilter({
  fullnameFilter,
  setFullnameFilter,
  setFullnameFilterToggle,
  setCurrentPage,
}) {
  const dropdownRef = useRef(null);
  useOutsideClick(dropdownRef, () => setFullnameFilterToggle(false));

  const handleChange = (e) => {
    setFullnameFilter(e.target.value);
    setCurrentPage(1);
  };

  return (
    <Form.Control
      ref={dropdownRef}
      type="text"
      placeholder="Enter Full Name"
      value={fullnameFilter}
      onChange={handleChange}
      className="fullname-filter-input"
      aria-label="Filter by Full Name"
    />
  );
}

export default FullNameFilter;