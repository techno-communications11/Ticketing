import React from "react";
import { useOutsideClick } from "./useOutsideClick";
import { useRef } from "react";
import "../styles/StatusFilter.css"; // New custom CSS file

const statuses = ["All", "New", "Opened", "Inprogress", "Completed", "ReOpened"];

function StatusFilter({ setStatusFilter, setStatusToggle, setCurrentPage }) {
  const dropdownRef = useRef(null);
  useOutsideClick(dropdownRef, () => setStatusToggle(false));

  const handleStatusClick = (status) => {
    setStatusFilter(status === "All" ? null : status);
    setCurrentPage(1);
    setStatusToggle(false); // Close dropdown after selection
  };

  return (
    <div ref={dropdownRef} className="status-filter-dropdown">
      {statuses.map((status) => (
        <div
          key={status}
          className="status-filter-item"
          onClick={() => handleStatusClick(status)}
          aria-label={`Filter by ${status} status`}
        >
          {status}
        </div>
      ))}
    </div>
  );
}

export default StatusFilter;