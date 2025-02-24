import React, { useState, useMemo, useCallback } from "react";
import { GrLinkNext } from "react-icons/gr";
import { Link } from "react-router-dom";
import { RiDeleteBin6Line } from "react-icons/ri";
import { toast, ToastContainer } from "react-toastify";
import getDecodedToken from "./decodeToken";
import { apiRequest } from "../lib/apiRequest";
import { getDuration } from "../universalComponents/getDuration";
import formatDate from "../universalComponents/FormatDate";

import "../styles/TicketTable.css";
import "../styles/loader.css";

const TicketBody = React.memo(({ 
  ticket, 
  index, 
  currentPage, 
  itemsPerPage, 
  handleTicket, 
  fetchUserTickets, 
  tickets, // No default needed since parent provides it
  setTickets 
}) => {
  const [loading, setLoading] = useState(false);
  const department = getDecodedToken().department;

  const badgeClasses = useMemo(() => ({
    opened: "bg-secondary",
    inprogress: "bg-warning",
    completed: "bg-success",
    reopened: "bg-primary",
    new: "bg-info",
  }), []);

  const statusTexts = useMemo(() => ({
    opened: "Opened",
    inprogress: "In Progress",
    completed: "Completed",
    reopened: "Reopened",
    new: "New",
  }), []);

  const rowNumber = useMemo(() => (currentPage - 1) * itemsPerPage + index + 1, [currentPage, index, itemsPerPage]);

  const handleDelete = useCallback(async (ticketId) => {
    setLoading(true);
    
    // Optimistically update the UI by removing the ticket
    const previousTickets = [...tickets]; // Store previous state for rollback
    const updatedTickets = tickets.filter(t => t.ticketId !== ticketId);
    setTickets(updatedTickets);

    try {
      const response = await apiRequest.get(`/createTickets/deleteticket/${ticketId}`);
      if (response.status === 200) {
        setTimeout(() => {
          toast.success("Ticket deleted successfully!");
        }, 1000);
      }
    } catch (error) {
      console.error("Error deleting ticket:", error);
      setTickets(previousTickets); // Revert to previous state on error
      fetchUserTickets(); // Fallback to refresh data
      toast.error("Failed to delete ticket. Data has been refreshed.");
    } finally {
      setLoading(false);
    }
  }, [tickets, setTickets, fetchUserTickets]);

  const renderCell = useCallback((content, className = '') => (
    <td className={`${ticket.isSettled ? 'bg-secondary text-white text-center fw-medium text-shrink bg-opacity-50 text-capitalize' : `text-center fw-medium text-shrink text-capitalize ${className}`}`}>
      {content}
    </td>
  ), [ticket]);

  if (loading) {
    return (
      <tr>
        <td colSpan="10" className="text-center">
          <div className="loader" role="status" aria-hidden="true">
            {/* Add your loader animation here */}
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr key={ticket.ticketId}>
      {renderCell(rowNumber)}
      {renderCell(ticket.ntid)}
      {renderCell(ticket.fullname)}
      {renderCell(
        <span className={`badge rounded-pill ${badgeClasses[ticket.status?.name] || "bg-secondary"}`}>
          {ticket.isSettled ? "Settled" : statusTexts[ticket.status?.name]}
        </span>
      )}
      {renderCell(formatDate(ticket.createdAt))}
      {department === "SuperAdmin" && (
        <>
          {renderCell(ticket.openedByFullName?.toLowerCase() || "-")}
          {renderCell(ticket.status?.name === "completed" ? ticket.openedByFullName?.toLowerCase() : "-")}
        </>
      )}
      {renderCell(ticket.completedAt ? formatDate(ticket.completedAt) : "-")}
      {renderCell(ticket.completedAt ? getDuration(ticket.createdAt, ticket.completedAt) : "-")}
      {renderCell(
        <Link to="/details">
          <GrLinkNext
            onClick={() => handleTicket(ticket.ticketId)}
            aria-label="View Details"
            style={{ cursor: "pointer" }}
          />
        </Link>
      )}
      {department === "SuperAdmin" && (
        <td className={`text-center fw-medium text-shrink`}>
          <RiDeleteBin6Line
            className="delete-icon bg-danger text-white p-1 rounded-5"
            onClick={() => handleDelete(ticket.ticketId)}
            style={{ cursor: "pointer", width: "60px", height: "25px" }}
            aria-label="Delete Ticket"
            disabled={loading}
          />
        </td>
      )}
      <ToastContainer />
    </tr>
  );
});

export default TicketBody;